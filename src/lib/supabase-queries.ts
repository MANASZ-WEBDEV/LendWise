import { supabase } from './supabase';
import { DbPerson, DbBalance, DbTransaction, DbRateHistory, PersonSummary, BalanceDirection } from '../types';
import { calculateBalanceState, calculateRepaymentSplit } from './interest-engine';

/**
 * Fetch all active people for the current authenticated user.
 */
export async function fetchPeople(): Promise<DbPerson[]> {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .is('archived_at', null)
    .order('name');

  if (error) throw error;
  return data || [];
}

/**
 * Create a new person in the database.
 */
export async function createPerson(name: string, notes?: string, phone?: string, isWm?: boolean): Promise<DbPerson> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('people')
    .insert({
      user_id: user.id,
      name: name.trim(),
      notes: notes?.trim() || null,
      phone: phone?.trim() || null,
      is_wm: isWm || false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing person's details.
 */
export async function updatePerson(personId: string, updates: {
  name?: string;
  notes?: string;
  phone?: string;
  is_wm?: boolean;
}): Promise<DbPerson> {
  const updatePayload: Record<string, any> = {};
  if (updates.name !== undefined) updatePayload.name = updates.name.trim();
  if (updates.notes !== undefined) updatePayload.notes = updates.notes.trim() || null;
  if (updates.phone !== undefined) updatePayload.phone = updates.phone.trim() || null;
  if (updates.is_wm !== undefined) updatePayload.is_wm = updates.is_wm;

  const { data, error } = await supabase
    .from('people')
    .update(updatePayload)
    .eq('id', personId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Soft-delete a person by setting archived_at.
 */
export async function archivePerson(personId: string): Promise<void> {
  const { error } = await supabase
    .from('people')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', personId);

  if (error) throw error;
}

/**
 * Fetch all archived people for the current user.
 */
export async function fetchArchivedPeople(): Promise<DbPerson[]> {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .not('archived_at', 'is', null)
    .order('name');

  if (error) throw error;
  return data || [];
}

/**
 * Restore an archived person by clearing archived_at.
 */
export async function unarchivePerson(personId: string): Promise<void> {
  const { error } = await supabase
    .from('people')
    .update({ archived_at: null })
    .eq('id', personId);

  if (error) throw error;
}

/**
 * Fetch full details and balances for a person, computing live accruing interest using the engine.
 */
export async function fetchPersonSummary(person: DbPerson): Promise<PersonSummary> {
  const { data: balancesData, error: bErr } = await supabase
    .from('balances')
    .select('*')
    .eq('person_id', person.id);

  if (bErr) throw bErr;

  const todayStr = new Date().toISOString().split('T')[0];
  const balances = [];

  let totalLentPrincipal = 0;
  let totalLentInterest = 0;
  let totalBorrowedPrincipal = 0;
  let totalBorrowedInterest = 0;

  for (const b of (balancesData || [])) {
    // Fetch rate history
    const { data: ratesData, error: rErr } = await supabase
      .from('rate_history')
      .select('*')
      .eq('balance_id', b.id)
      .order('effective_from');

    if (rErr) throw rErr;

    // Fetch transactions
    const { data: txnsData, error: tErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('balance_id', b.id)
      .order('date');

    if (tErr) throw tErr;

    const txns: DbTransaction[] = txnsData || [];
    const rates: DbRateHistory[] = ratesData || [];

    // Find initial loan date from transactions or creation date
    const initialTxn = txns.find(t => t.type === 'loan');
    const initialLoanDate = initialTxn ? initialTxn.date : b.created_at.split('T')[0];

    // Compute live balance state from transactions & rate history using engine
    const engineTxns = txns.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      newRate: t.new_rate,
      date: t.date,
      created_at: t.created_at,
    }));

    const engineRates = rates.map(r => ({
      rate: Number(r.rate),
      effectiveFrom: r.effective_from,
    }));

    const calcResult = calculateBalanceState(
      initialLoanDate,
      0, // Initial balance starts 0; initial loan txn adds to principal
      Number(b.current_rate),
      engineTxns,
      engineRates,
      todayStr
    );

    const liveAccrued = calcResult.outstandingInterest;
    const currentPrincipal = calcResult.currentPrincipal;
    const totalOwed = currentPrincipal + liveAccrued;

    if (b.direction === 'lent') {
      totalLentPrincipal += currentPrincipal;
      totalLentInterest += liveAccrued;
    } else {
      totalBorrowedPrincipal += currentPrincipal;
      totalBorrowedInterest += liveAccrued;
    }

    balances.push({
      balance: {
        ...b,
        principal: currentPrincipal,
        outstanding_interest: liveAccrued,
      },
      liveAccruedInterest: liveAccrued,
      totalOwed,
      transactions: txns,
      rateHistory: rates,
    });
  }

  return {
    person,
    balances,
    totalLentPrincipal,
    totalLentInterest,
    totalLentTotal: totalLentPrincipal + totalLentInterest,
    totalBorrowedPrincipal,
    totalBorrowedInterest,
    totalBorrowedTotal: totalBorrowedPrincipal + totalBorrowedInterest,
  };
}

/**
 * Record a new loan disbursement (creates balance if it doesn't exist yet for this direction).
 */
export async function recordLoanDisbursement(params: {
  personId: string;
  direction: BalanceDirection;
  amount: number;
  monthlyRate: number;
  date: string; // ISO date 'YYYY-MM-DD'
  notes?: string;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Check if balance exists for (personId, direction)
  const { data: existingBalances, error: bErr } = await supabase
    .from('balances')
    .select('*')
    .eq('person_id', params.personId)
    .eq('direction', params.direction);

  if (bErr) throw bErr;

  let balanceId: string;

  if (existingBalances && existingBalances.length > 0) {
    balanceId = existingBalances[0].id;
  } else {
    // Create new balance
    const { data: newBal, error: createBalErr } = await supabase
      .from('balances')
      .insert({
        person_id: params.personId,
        user_id: user.id,
        direction: params.direction,
        principal: 0,
        outstanding_interest: 0,
        current_rate: params.monthlyRate,
      })
      .select()
      .single();

    if (createBalErr) throw createBalErr;
    balanceId = newBal.id;

    // Create initial rate_history entry
    await supabase.from('rate_history').insert({
      balance_id: balanceId,
      user_id: user.id,
      rate: params.monthlyRate,
      effective_from: params.date,
    });
  }

  // Insert loan transaction
  const { error: txnErr } = await supabase.from('transactions').insert({
    balance_id: balanceId,
    user_id: user.id,
    type: 'loan',
    amount: params.amount,
    date: params.date,
    notes: params.notes || null,
  });

  if (txnErr) throw txnErr;
}

/**
 * Record a repayment against a balance (applies interest-first split logic).
 */
export async function recordRepaymentTransaction(params: {
  balanceId: string;
  amount: number;
  outstandingInterest: number;
  currentPrincipal: number;
  date: string; // 'YYYY-MM-DD'
  notes?: string;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const split = calculateRepaymentSplit(
    params.amount,
    params.outstandingInterest,
    params.currentPrincipal
  );

  const { error } = await supabase.from('transactions').insert({
    balance_id: params.balanceId,
    user_id: user.id,
    type: 'repayment',
    amount: params.amount,
    date: params.date,
    interest_applied: split.interestPaid,
    principal_applied: split.principalPaid,
    notes: params.notes || null,
  });

  if (error) throw error;
}

/**
 * Change the interest rate for a balance starting from an effective date.
 */
export async function recordRateChange(params: {
  balanceId: string;
  newMonthlyRate: number;
  effectiveDate: string; // 'YYYY-MM-DD'
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Insert rate history
  const { error: rateErr } = await supabase.from('rate_history').insert({
    balance_id: params.balanceId,
    user_id: user.id,
    rate: params.newMonthlyRate,
    effective_from: params.effectiveDate,
  });

  if (rateErr) throw rateErr;

  // Update current_rate in balances table
  await supabase
    .from('balances')
    .update({ current_rate: params.newMonthlyRate, updated_at: new Date().toISOString() })
    .eq('id', params.balanceId);

  // Record rate_change transaction entry for audit trail
  await supabase.from('transactions').insert({
    balance_id: params.balanceId,
    user_id: user.id,
    type: 'rate_change',
    new_rate: params.newMonthlyRate,
    date: params.effectiveDate,
  });
}

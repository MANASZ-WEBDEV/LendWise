/**
 * Interest Calculation Engine for LendWise
 *
 * Implements segment-based 30/360-style simple interest calculation:
 *   daily_interest = principal * (monthly_rate / 100 / 30) * days
 */

export interface TransactionRecord {
  id: string;
  type: 'loan' | 'repayment' | 'rate_change';
  amount?: number | null;
  interest_applied?: number | null;
  principal_applied?: number | null;
  newRate?: number | null;
  date: string; // ISO string 'YYYY-MM-DD'
  created_at?: string;
}

export interface RateHistoryRecord {
  rate: number; // monthly percentage, e.g. 1.5 for 1.5%/month
  effectiveFrom: string; // ISO string 'YYYY-MM-DD'
}

export interface InterestSegment {
  startDate: string;
  endDate: string;
  days: number;
  principal: number;
  monthlyRate: number;
  interestAccrued: number;
}

export interface InterestAccrualResult {
  totalAccruedInterest: number;
  interestPaidTotal: number;
  outstandingInterest: number;
  currentPrincipal: number;
  segments: InterestSegment[];
}

/**
 * Calculates the number of days between two ISO date strings ('YYYY-MM-DD')
 * using the 30/360 fixed-month convention (where every month is treated as 30 days).
 * Assumes start <= end.
 */
export function getDaysDifference(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  const startUTC = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
  const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));

  if (endUTC <= startUTC) return 0;

  let y1 = startUTC.getUTCFullYear();
  let m1 = startUTC.getUTCMonth() + 1;
  let d1 = startUTC.getUTCDate();

  let y2 = endUTC.getUTCFullYear();
  let m2 = endUTC.getUTCMonth() + 1;
  let d2 = endUTC.getUTCDate();

  if (d1 === 31) d1 = 30;
  if (d2 === 31 && d1 >= 30) d2 = 30;

  const days = 360 * (y2 - y1) + 30 * (m2 - m1) + (d2 - d1);
  return Math.max(0, days);
}

/**
 * Computes interest for a single static period.
 * Formula: principal * (monthlyRate / 100 / 30) * days
 */
export function computePeriodInterest(principal: number, monthlyRate: number, days: number): number {
  if (principal <= 0 || monthlyRate <= 0 || days <= 0) return 0;
  const rawInterest = principal * (monthlyRate / 100 / 30) * days;
  return Math.round(rawInterest * 100) / 100;
}

/**
 * Computes live balance, accrued interest, and breakdown segments as of a target date.
 */
export function calculateBalanceState(
  initialLoanDate: string,
  initialPrincipal: number,
  initialMonthlyRate: number,
  transactions: TransactionRecord[],
  rateHistory: RateHistoryRecord[],
  asOfDate: string
): InterestAccrualResult {
  // Sort rate history chronologically
  const rates = [...rateHistory].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  if (rates.length === 0 || rates[0].effectiveFrom > initialLoanDate) {
    rates.unshift({ rate: initialMonthlyRate, effectiveFrom: initialLoanDate });
  }

  // Sort transactions chronologically (and by created_at tie-breaker if same date)
  const txns = [...transactions].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.created_at || '').localeCompare(b.created_at || '');
  });

  // Collect all timeline boundary dates (loan start, rate changes, transactions, asOfDate)
  const boundarySet = new Set<string>();
  boundarySet.add(initialLoanDate);
  if (asOfDate >= initialLoanDate) {
    boundarySet.add(asOfDate);
  }

  rates.forEach(r => {
    if (r.effectiveFrom >= initialLoanDate && r.effectiveFrom <= asOfDate) {
      boundarySet.add(r.effectiveFrom);
    }
  });

  txns.forEach(t => {
    if (t.date >= initialLoanDate && t.date <= asOfDate) {
      boundarySet.add(t.date);
    }
  });

  const boundaries = Array.from(boundarySet).sort((a, b) => a.localeCompare(b));

  let currentPrincipal = initialPrincipal;
  let totalAccruedInterest = 0;
  let interestPaidTotal = 0;
  let outstandingInterest = 0;

  const segments: InterestSegment[] = [];

  // Helper to get active rate on a given date
  const getActiveRate = (dateStr: string): number => {
    let activeRate = initialMonthlyRate;
    for (const r of rates) {
      if (r.effectiveFrom <= dateStr) {
        activeRate = r.rate;
      } else {
        break;
      }
    }
    return activeRate;
  };

  // Process day-by-day segments between boundaries
  for (let i = 0; i < boundaries.length - 1; i++) {
    const segStart = boundaries[i];
    const segEnd = boundaries[i + 1];

    // Apply any transactions that occur on segStart before accruing for this segment
    const sameDayTxns = txns.filter(t => t.date === segStart);
    for (const t of sameDayTxns) {
      if (t.type === 'loan' && t.amount) {
        currentPrincipal += t.amount;
      } else if (t.type === 'repayment' && t.amount) {
        const payment = t.amount;
        const interestCovered = (t.interest_applied !== undefined && t.interest_applied !== null)
          ? Math.min(payment, t.interest_applied)
          : 0;
        const principalCovered = (t.principal_applied !== undefined && t.principal_applied !== null)
          ? Math.min(payment, t.principal_applied)
          : Math.min(payment, currentPrincipal);

        interestPaidTotal += interestCovered;
        outstandingInterest -= interestCovered;
        currentPrincipal = Math.max(0, currentPrincipal - principalCovered);
      }
    }

    const days = getDaysDifference(segStart, segEnd);
    if (days > 0 && currentPrincipal > 0) {
      const activeRate = getActiveRate(segStart);
      const interestForSeg = computePeriodInterest(currentPrincipal, activeRate, days);

      totalAccruedInterest += interestForSeg;
      outstandingInterest += interestForSeg;

      segments.push({
        startDate: segStart,
        endDate: segEnd,
        days,
        principal: currentPrincipal,
        monthlyRate: activeRate,
        interestAccrued: interestForSeg,
      });
    }
  }

  // Also process transactions on the final boundary date (asOfDate)
  const finalDayTxns = txns.filter(t => t.date === asOfDate && boundaries[boundaries.length - 1] === asOfDate);
  for (const t of finalDayTxns) {
    if (t.type === 'loan' && t.amount) {
      currentPrincipal += t.amount;
    } else if (t.type === 'repayment' && t.amount) {
      const payment = t.amount;
      const interestCovered = (t.interest_applied !== undefined && t.interest_applied !== null)
        ? Math.min(payment, t.interest_applied)
        : 0;
      const principalCovered = (t.principal_applied !== undefined && t.principal_applied !== null)
        ? Math.min(payment, t.principal_applied)
        : Math.min(payment, currentPrincipal);

      interestPaidTotal += interestCovered;
      outstandingInterest -= interestCovered;
      currentPrincipal = Math.max(0, currentPrincipal - principalCovered);
    }
  }

  return {
    totalAccruedInterest: Math.round(totalAccruedInterest * 100) / 100,
    interestPaidTotal: Math.round(interestPaidTotal * 100) / 100,
    outstandingInterest: Math.max(0, Math.round(outstandingInterest * 100) / 100),
    currentPrincipal: Math.max(0, Math.round(currentPrincipal * 100) / 100),
    segments,
  };
}

/**
 * Calculates repayment breakdown for a prospective payment.
 * By default, 100% of repayment reduces principal.
 */
export function calculateRepaymentSplit(
  paymentAmount: number,
  outstandingInterest: number,
  currentPrincipal: number,
  deductFromPrincipal: boolean = true
) {
  const amount = Math.max(0, paymentAmount);

  if (deductFromPrincipal) {
    const principalPaid = Math.min(amount, Math.max(0, currentPrincipal));
    const remainder = amount - principalPaid;
    const interestPaid = Math.min(remainder, Math.max(0, outstandingInterest));
    const overpaid = Math.max(0, remainder - interestPaid);

    const newPrincipal = Math.max(0, currentPrincipal - principalPaid);
    const newInterest = Math.max(0, outstandingInterest - interestPaid);

    return {
      interestPaid: Math.round(interestPaid * 100) / 100,
      principalPaid: Math.round(principalPaid * 100) / 100,
      overpaid: Math.round(overpaid * 100) / 100,
      newPrincipal: Math.round(newPrincipal * 100) / 100,
      newInterest: Math.round(newInterest * 100) / 100,
      totalRemaining: Math.round((newPrincipal + newInterest) * 100) / 100,
    };
  } else {
    const interestPaid = Math.min(amount, Math.max(0, outstandingInterest));
    const remainder = amount - interestPaid;
    const principalPaid = Math.min(remainder, Math.max(0, currentPrincipal));
    const overpaid = Math.max(0, remainder - principalPaid);

    const newPrincipal = Math.max(0, currentPrincipal - principalPaid);
    const newInterest = Math.max(0, outstandingInterest - interestPaid);

    return {
      interestPaid: Math.round(interestPaid * 100) / 100,
      principalPaid: Math.round(principalPaid * 100) / 100,
      overpaid: Math.round(overpaid * 100) / 100,
      newPrincipal: Math.round(newPrincipal * 100) / 100,
      newInterest: Math.round(newInterest * 100) / 100,
      totalRemaining: Math.round((newPrincipal + newInterest) * 100) / 100,
    };
  }
}

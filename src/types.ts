export type ViewMode =
  | 'dashboard'
  | 'people'
  | 'person-detail'
  | 'disburse-loan'
  | 'repayment'
  | 'transactions'
  | 'settings';

export type BalanceDirection = 'lent' | 'borrowed';
export type TransactionType = 'loan' | 'repayment' | 'rate_change';

export interface DbPerson {
  id: string;
  user_id: string;
  name: string;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
}

export interface DbBalance {
  id: string;
  person_id: string;
  user_id: string;
  direction: BalanceDirection;
  principal: number;
  outstanding_interest: number;
  current_rate: number; // monthly % rate
  created_at: string;
  updated_at: string;
}

export interface DbRateHistory {
  id: string;
  balance_id: string;
  user_id: string;
  rate: number;
  effective_from: string;
  created_at: string;
}

export interface DbTransaction {
  id: string;
  balance_id: string;
  user_id: string;
  type: TransactionType;
  amount: number | null;
  new_rate: number | null;
  date: string; // 'YYYY-MM-DD'
  interest_applied: number | null;
  principal_applied: number | null;
  notes: string | null;
  created_at: string;
}

// Enhanced UI representation aggregating a person with their live calculated balances
export interface PersonSummary {
  person: DbPerson;
  balances: {
    balance: DbBalance;
    liveAccruedInterest: number;
    totalOwed: number; // principal + liveAccruedInterest
    transactions: DbTransaction[];
    rateHistory: DbRateHistory[];
  }[];
  totalLentPrincipal: number;
  totalLentInterest: number;
  totalLentTotal: number;
  totalBorrowedPrincipal: number;
  totalBorrowedInterest: number;
  totalBorrowedTotal: number;
}

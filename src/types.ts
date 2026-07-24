export type ViewMode = 'dashboard' | 'people' | 'person-detail' | 'disburse-loan' | 'repayment' | 'transactions' | 'settings' | 'support';

export interface Person {
  id: string; // e.g., 'LW-9421-AS'
  name: string;
  company: string;
  avatar: string;
  relationship: 'OWES_ME' | 'I_OWE_THEM';
  creditScore: number;
  activeLoans: number;
  principal: number;
  interestRate: number; // e.g. 4.5 for 4.5%
  liveAccrual: number;
  accrualDays: number;
  repaymentHistory: number[]; // relative bar heights e.g. [20, 40, 60, 80]
  status: 'Active' | 'Grace Period' | 'Settled';
  category: 'Personal' | 'Venture Debt' | 'Bridge Financing' | 'Corporate';
  lastPaymentDate: string;
  tier?: 'Premium Client' | 'Standard Client';
}

export interface Transaction {
  id: string; // e.g., 'TXN-8849201'
  personId: string;
  personName: string;
  personInitials?: string;
  date: string;
  type: 'Repayment' | 'Loan Disbursement' | 'Interest Accrual';
  reference: string;
  amount: number; // raw value
  debit?: number; // loan given or interest added
  credit?: number; // repayment received
  balanceAfter: number;
  status: 'Cleared' | 'Verified' | 'Settled' | 'Active' | 'System';
  notes?: string;
}

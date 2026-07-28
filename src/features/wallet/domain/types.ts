export type TransactionType = 'credit' | 'debit';
export type TransactionStatus = 'success' | 'pending' | 'failed';
export type TimePeriod = 'daily' | 'weekly' | 'monthly';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  coins?: number;
  status: TransactionStatus;
  date: string;
  createdAt?: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface Earnings {
  daily: number;
  weekly: number;
  monthly: number;
  total: number;
  today?: number;
  lastPayout?: PayoutInfo;
  pendingPayout?: PayoutInfo;
}

export interface PayoutInfo {
  amount: number;
  date: string;
  status: string;
}

export interface ChartData {
  label: string;
  value: number;
}

export interface WalletDashboard {
  balance: number;
  earnings: Earnings;
  transactions: Transaction[];
  chartData: ChartData[];
}

export interface WithdrawRequest {
  amount: number;
  upiId?: string;
  bankAccount?: string;
}

export interface WithdrawResponse {
  success: boolean;
  message: string;
  transactionId?: string;
}

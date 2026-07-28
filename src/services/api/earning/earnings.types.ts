export interface EarningsSummary {
  totalEarnings: number;
  totalWithdrawn: number;
  currentBalance: number;
  totalSessions: number;
  totalChatMinutes: number;
}

export interface EarningsTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  coins: number;
  description: string;
  createdAt: string;
}

export interface GetAstrologerEarningsResponse {
  summary: EarningsSummary;
  transactions: EarningsTransaction[];
}
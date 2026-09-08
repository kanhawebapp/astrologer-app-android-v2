// walletTransactions.types.ts

export type WalletTransactionType =
  | 'CHAT_EARNING'
  | 'CALL_EARNING'
  | 'WITHDRAWAL'
  | 'REFUND'
  | 'BONUS'
  | 'CREDIT'
  | 'DEBIT';

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  amount: number;
  coins: number;
  description: string;
  createdAt: string;
  sessionId: string;
}

export interface GetAstrologerWalletTransactionsResponse {
  success: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  data: WalletTransaction[];
}

export interface GetAstrologerWalletTransactionsVariables {
  page: number;
  limit: number;
  [key: string]: unknown;
}
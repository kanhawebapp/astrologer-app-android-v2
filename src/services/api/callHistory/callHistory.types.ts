// callHistory.types.ts

export type CallHistoryStatus =
  | 'COMPLETED'
  | 'MISSED'
  | 'CANCELLED'
  | 'ONGOING';

export interface CallHistoryItem {
  sessionId: string;
  roomId: string;
  userName: string;
  userMobile: string;
  userCountryCode: string;
  startedAt: string;
  endedAt: string;
  createdAt: string;
  status: CallHistoryStatus;
  durationSec: number;
  durationMinutes: number;
  ratePerMin: number;
  coinsEarned: number;
  commission: number;
  lastMessage: string;
}

export interface GetAstrologerCallHistoryResponse {
  success: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  data: CallHistoryItem[];
}

export interface GetAstrologerCallHistoryVariables {
  page: number;
  limit: number;
  status?: CallHistoryStatus;
}
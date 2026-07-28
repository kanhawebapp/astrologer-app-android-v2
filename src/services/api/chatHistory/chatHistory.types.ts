// src/features/chatHistory/api/chatHistory.types.ts

export interface AstrologerChatHistoryItem {
  sessionId: string;
  roomId: string;
  userName: string;
  userMobile: string;
  userCountryCode: string;
  startedAt: string;
  endedAt: string;
  createdAt: string;
  status: 'COMPLETED' | 'MISSED' | 'CANCELLED' | 'ONGOING';
  durationSec: number;
  durationMinutes: number;
  ratePerMin: number;
  coinsEarned: number;
  commission: number;
  lastMessage: string;
}

export interface GetAstrologerChatHistoryResponse {
  success: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  data: AstrologerChatHistoryItem[];
}

export interface GetAstrologerChatHistoryFilter {
  page: number;
  limit: number;
}
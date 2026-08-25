export interface AstrologerChatHistoryItem {
  sessionId: string;
  roomId: string;
  userName: string;
  birthPlace: string;
  rating: number | null;
  reviewComment: string | null;
  status: 'COMPLETED' | 'MISSED' | 'CANCELLED' | 'ONGOING';
  ratePerMin: number;
  durationMinutes: number;
  coinsEarned: number;
  commission: number;
  source: string;
  createdAt: string;
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

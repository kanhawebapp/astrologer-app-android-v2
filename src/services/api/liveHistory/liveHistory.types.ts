export type LiveHistoryInteractionType = 'AUDIO' | 'VIDEO' | string;

export type LiveHistoryStatus =
  | 'ENDED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'PENDING'
  | 'ACCEPTED'
  | string;

export interface LiveHistoryItem {
  sessionId: string;
  liveStreamId: string;
  userId: string;
  userName: string | null;
  astrologerId: string;
  interactionType: LiveHistoryInteractionType;
  status: LiveHistoryStatus;
  ratePerMin: number | null;
  chargedCoins: number | null;
  astrologerEarned: number | null;
  durationSeconds: number | null;
  billableMinutes: number | null;
  requestedAt: string | null;
  acceptedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string | null;
}

export interface MyAstrologerLiveInteractionHistorySearchInput {
  limit?: number;
  page?: number;
}

export interface GetMyLiveInteractionHistoryResponse {
  data: LiveHistoryItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  totalCoinsCollected: number;
  totalAstrologerEarnings: number;
  totalAudioCalls: number;
  totalVideoCalls: number;
}

export interface GetMyLiveInteractionHistoryVariables {
  searchInput: MyAstrologerLiveInteractionHistorySearchInput;
}

export interface LiveHistorySummary {
  totalCoinsCollected: number;
  totalAstrologerEarnings: number;
  totalAudioCalls: number;
  totalVideoCalls: number;
}

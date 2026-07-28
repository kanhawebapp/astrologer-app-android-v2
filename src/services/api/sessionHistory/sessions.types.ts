export interface AstrologerSession {
  sessionId: string;
  chatId: string;
  sessionType: string;
  status: string;

  userId: string;
  userName: string;
  userMobile: string;
  userCountryCode: string;

  birthPlace: string;
  birthDate: string;
  birthTime: string;
  occupation: string;
  gender: string;

  rating: number | null;
  reviewComment: string | null;

  startedAt: string;
  endedAt: string;
  createdAt: string;

  durationSec: number;
  durationMinutes: number;
  ratePerMin: number;
  coinsEarned: number;
  commission: number;
}

export interface GetAstrologerSessionsResponse {
  success: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  data: AstrologerSession[];
}

export interface AstrologerSessionFilter {
  page: number;
  limit: number;

  userName?: string;
  sessionType?: string;

  startDate?: string;
  endDate?: string;
}
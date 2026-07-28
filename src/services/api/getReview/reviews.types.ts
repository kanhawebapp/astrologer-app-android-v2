export interface AstrologerReview {
  id: string;
  sessionId: string;
  sessionType: string;
  sessionStatus: string;
  rating: number;
  comment: string;
  reply: string | null;
  isFlagged: boolean;
  createdAt: string;
}

export interface GetAstrologerReviewsResponse {
  success: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  data: AstrologerReview[];
}

export interface GetAstrologerReviewsFilter {
  page: number;
  limit: number;
  rating?: number;
}
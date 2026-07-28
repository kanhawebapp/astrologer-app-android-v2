export interface ReplyToReviewInput {
  reviewId: string;
  reply: string;
}

export interface ReplyToReviewResponse {
  success: boolean;
  message: string;
}
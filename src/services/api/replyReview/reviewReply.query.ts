export const REPLY_TO_REVIEW_MUTATION = `
  mutation ReplyToReview(
    $reviewId: String!
    $reply: String!
  ) {
    replyToReview(
      reviewId: $reviewId
      reply: $reply
    ) {
      success
      message
    }
  }
`;
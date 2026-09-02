export const GET_ASTROLOGER_REVIEWS_QUERY = `
  query GetAstrologerReviews(
    $page: Int!
    $limit: Int!
    $rating: Int
  ) {
    getAstrologerReviews(
      filter: {
        page: $page
        limit: $limit
        rating: $rating
      }
    ) {
      success
      totalCount
      currentPage
      totalPages
      limit

      data {
        id
        sessionId
        userName
        sessionType
        sessionStatus
        rating
        comment
        reply
        isFlagged
        createdAt
      }
    }
  }
`;
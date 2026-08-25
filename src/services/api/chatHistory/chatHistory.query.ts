export const GET_ASTROLOGER_CHAT_HISTORY_QUERY = `
  query GetAstrologerChatHistory(
    $page: Int!,
    $limit: Int!,
    $status: SessionStatus
  ) {
    getAstrologerChatHistory(
      filter: {
        page: $page,
        limit: $limit,
        status: $status
      }
    ) {
      success
      totalCount
      currentPage
      totalPages

      data {
        sessionId
        roomId
        userName
        birthPlace
        rating
        reviewComment
        status
        ratePerMin
        durationMinutes
        coinsEarned
        commission
        source
        createdAt
      }
    }
  }
`;

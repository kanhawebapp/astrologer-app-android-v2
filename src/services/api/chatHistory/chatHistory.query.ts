
export const GET_ASTROLOGER_CHAT_HISTORY_QUERY = `
  query GetAstrologerChatHistory(
    $page: Int!,
    $limit: Int!,
  ) {
    getAstrologerChatHistory(
      filter: {
        page: $page,
        limit: $limit
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
        userMobile
        userCountryCode
        startedAt
        endedAt
        createdAt
        status
        durationSec
        durationMinutes
        ratePerMin
        coinsEarned
        commission
        lastMessage
      }
    }
  }
`;
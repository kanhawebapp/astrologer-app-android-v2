export const GET_ASTROLOGER_CALL_HISTORY_QUERY = `
  query GetAstrologerCallHistory(
    $page: Int!,
    $limit: Int!,
    $status: SessionStatus
  ) {
    getAstrologerCallHistory(
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
        source
      }
    }
  }
`;

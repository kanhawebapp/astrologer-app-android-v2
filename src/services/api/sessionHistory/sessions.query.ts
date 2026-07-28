export const GET_ASTROLOGER_SESSIONS_QUERY = `
  query GetAstrologerSessions(
    $filter: AstrologerSessionFilterInput
  ) {
    getAstrologerSessions(filter: $filter) {
      success
      totalCount
      currentPage
      totalPages

      data {
        sessionId
        chatId
        sessionType
        status

        userId
        userName
        userMobile
        userCountryCode
        source
        birthPlace
        birthDate
        birthTime
        occupation
        gender

        rating
        reviewComment

        startedAt
        endedAt
        createdAt

        durationSec
        durationMinutes
        ratePerMin
        coinsEarned
        commission
      }
    }
  }
`;
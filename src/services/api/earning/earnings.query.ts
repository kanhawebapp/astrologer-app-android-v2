export const GET_ASTROLOGER_EARNINGS_QUERY = `
  query GetAstrologerEarnings {
    getAstrologerEarnings {
      summary {
        totalEarnings
        totalWithdrawn
        currentBalance
        totalSessions
        totalChatMinutes
      }

      transactions {
        id
        type
        amount
        coins
        description
        createdAt
      }
    }
  }
`;
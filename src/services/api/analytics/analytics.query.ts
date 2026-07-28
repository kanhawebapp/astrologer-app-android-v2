export const GET_ASTROLOGER_ANALYTICS_QUERY = `
  query GetAstrologerAnalytics(
    $astrologerId: String!
  ) {
    getAstrologerAnalytics(
      astrologerId: $astrologerId
    ) {
      totalEarnings
      totalFollowers
      totalChats
      totalCalls
      averageRating

      monthlyData {
        month
        earnings
        chats
        calls
      }
    }
  }
`;
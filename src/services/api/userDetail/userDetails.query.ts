export const GET_USER_DETAILS_QUERY = `
  query GetUserDetails($userId: String!) {
    getUserDetails(userId: $userId) {
      id
      name
      mobile
      countryCode
      gender
      occupation

      wallet {
        balanceCoins
        lockedCoins
      }

      totalSessions
      completedSessions
      totalReviews

      createdAt
    }
  }
`;

export const GET_ASTROLOGER_FOLLOWERS_QUERY = `
  query GetAstrologerFollowers(
    $astrologerId: String!
    $page: Int
    $limit: Int
  ) {
    getAstrologerFollowers(
      astrologerId: $astrologerId
      page: $page
      limit: $limit
    ) {
      followers {
        id
        userId
        astrologerId
        createdAt
        user {
          id
          name
          mobile
          countryCode
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_ASTROLOGER_FOLLOWERS_COUNT_QUERY = `
  query GetAstrologerFollowersCount(
    $astrologerId: String!
  ) {
    getAstrologerFollowersCount(
      astrologerId: $astrologerId
    ) {
      totalFollowers
    }
  }
`;
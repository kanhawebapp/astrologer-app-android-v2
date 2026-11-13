export const GET_PREVIOUS_REMEDIES_QUERY = `
  query GetPreviousRemedies($userId: ID!) {
    getPreviousRemedies(userId: $userId) {
      id
      sessionId
      sessionType
      remedyText
      createdAt
      __typename
    }
  }
`;

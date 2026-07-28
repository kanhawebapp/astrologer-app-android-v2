export const GET_REMEDIES_QUERY = `
  query GetRemedies {
    getRemedies {
      success
      message

      data {
        id
        title
        description
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

export const SEND_REMEDY_MUTATION = `
  mutation SendRemedy(
    $sessionId: String!
    $remedyText: String!
  ) {
    sendRemedy(
      sessionId: $sessionId
      remedyText: $remedyText
    ) {
      success
      message
    }
  }
`;

export const GET_SESSION_REMEDIES_QUERY = `
  query GetSessionRemedies(
    $sessionId: String!
  ) {
    getSessionRemedies(
      sessionId: $sessionId
    ) {
      success
      message
      totalCount
      currentPage
      totalPages

      data {
        id
        sessionId
        sessionType
        remedyText
        createdAt
      }
    }
  }
`;
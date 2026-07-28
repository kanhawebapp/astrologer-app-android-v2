export const GET_SESSION_REMEDIES_QUERY = `
  query GetSessionRemedies(
    $filter: SessionRemedyFilterInput
  ) {
    getSessionRemedies(
      filter: $filter
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
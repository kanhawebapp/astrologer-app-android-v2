export const GET_KUNDALI_QUERY = `
  query GetKundali(
    $requestSessionId: String!
  ) {
    getKundali(
      requestSessionId: $requestSessionId
    ) {
      status
      userId
      requestType
      requestSessionId
      userName
      data
    }
  }
`;
// messages.query.ts

export const GET_SESSION_MESSAGES_QUERY = `
  query GetSessionMessages($sessionId: String!) {
    getSessionMessages(sessionId: $sessionId) {
      success
      totalCount

      data {
        id
        sender
        message
        image
        createdAt
      }
    }
  }
`;
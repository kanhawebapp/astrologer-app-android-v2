// walletTransactions.query.ts

export const GET_ASTROLOGER_WALLET_TRANSACTIONS_QUERY = `
  query GetAstrologerWalletTransactions(
    $page: Int!,
    $limit: Int!
  ) {
    getAstrologerWalletTransactions(
      page: $page
      limit: $limit
    ) {
      success
      totalCount
      currentPage
      totalPages

      data {
        id
        sessionId
        type
        amount
        coins
        description
        createdAt
      }
    }
  }
`;

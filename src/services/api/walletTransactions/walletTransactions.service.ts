// walletTransactions.service.ts

import { graphqlRequest } from '../../graphqlClient';

import { GET_ASTROLOGER_WALLET_TRANSACTIONS_QUERY } from './walletTransactions.query';
import { GetAstrologerWalletTransactionsResponse, GetAstrologerWalletTransactionsVariables } from './walletTransactions.type';



export const walletTransactionsApi = {
  getAstrologerWalletTransactions: async (
    variables: GetAstrologerWalletTransactionsVariables,
    token?: string,
  ) => {
    console.log(
      '=== GET ASTROLOGER WALLET TRANSACTIONS REQUEST ===',
    );

    console.log(
      'Variables:',
      JSON.stringify(variables, null, 2),
    );

    console.log(
      'Query:',
      GET_ASTROLOGER_WALLET_TRANSACTIONS_QUERY.trim(),
    );

    console.log(
      '==================================================',
    );

    return graphqlRequest<{
      getAstrologerWalletTransactions: GetAstrologerWalletTransactionsResponse;
    }>({
      query: GET_ASTROLOGER_WALLET_TRANSACTIONS_QUERY,
      variables,
      token,
    });
  },
};
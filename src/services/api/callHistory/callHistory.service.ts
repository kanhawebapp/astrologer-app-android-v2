// callHistory.service.ts

import {graphqlRequest} from '../../graphqlClient';

import {GET_ASTROLOGER_CALL_HISTORY_QUERY} from './callHistory.query';

import {
  GetAstrologerCallHistoryResponse,
  GetAstrologerCallHistoryVariables,
} from './callHistory.types';

export const callHistoryApi = {
  getAstrologerCallHistory: async (
    variables: GetAstrologerCallHistoryVariables,
    token?: string,
  ) => {
    // console.log('=== GET ASTROLOGER CALL HISTORY REQUEST ===');

    // console.log('Variables:', JSON.stringify(variables, null, 2));

    // console.log('Query:', GET_ASTROLOGER_CALL_HISTORY_QUERY.trim());

    // console.log('===========================================');

    return graphqlRequest<{
      getAstrologerCallHistory: GetAstrologerCallHistoryResponse;
    }>({
      query: GET_ASTROLOGER_CALL_HISTORY_QUERY,
      variables: variables as unknown as Record<string, unknown>,
      token,
    });
  },
};

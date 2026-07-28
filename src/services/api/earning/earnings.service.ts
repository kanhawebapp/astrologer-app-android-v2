import { graphqlRequest } from '../../graphqlClient';
import { GET_ASTROLOGER_EARNINGS_QUERY } from './earnings.query';
import { GetAstrologerEarningsResponse } from './earnings.types';


export const earningsApi = {
  getAstrologerEarnings: async (token?: string) => {
    console.log('🔥 GetAstrologerEarnings API', {
      timestamp: new Date().toISOString(),
      tokenProvided: Boolean(token),
    });
    console.log('=== GET ASTROLOGER EARNINGS REQUEST ===');
    console.log('Query:', GET_ASTROLOGER_EARNINGS_QUERY.trim());
    console.log('=======================================');

    return graphqlRequest<{
      getAstrologerEarnings: GetAstrologerEarningsResponse;
    }>({
      query: GET_ASTROLOGER_EARNINGS_QUERY,
      token,
    });
  },
};

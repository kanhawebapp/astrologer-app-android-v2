import { graphqlRequest } from '../../graphqlClient';
import { GET_ASTROLOGER_NOTICES_QUERY } from './notices.query';
import { GetAstrologerNoticesData } from './notices.types';

export const noticesApi = {
  getAstrologerNotices: async (
    token?: string,
  ) => {
    console.log(
      '=== GET ASTROLOGER NOTICES REQUEST ===',
    );

    console.log(
      'Query:',
      GET_ASTROLOGER_NOTICES_QUERY.trim(),
    );

    console.log(
      '=====================================',
    );

    return graphqlRequest<
      GetAstrologerNoticesData
    >({
      query: GET_ASTROLOGER_NOTICES_QUERY,
      token,
    });
  },
};
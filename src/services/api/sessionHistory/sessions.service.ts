import { graphqlRequest } from '../../graphqlClient';
import { GET_ASTROLOGER_SESSIONS_QUERY } from './sessions.query';

import {
  AstrologerSessionFilter,
  GetAstrologerSessionsResponse,
} from './sessions.types';

export const sessionsApi = {
  getAstrologerSessions: async (
    filter: AstrologerSessionFilter,
    token?: string,
  ) => {
    console.log('=== GET ASTROLOGER SESSIONS REQUEST ===');

    console.log(
      'Variables:',
      JSON.stringify(
        {
          filter,
        },
        null,
        2,
      ),
    );

    console.log('======================================');

    return graphqlRequest<{
      data: any;
      getAstrologerSessions: GetAstrologerSessionsResponse;
    }>({
      query: GET_ASTROLOGER_SESSIONS_QUERY,
      variables: {
        filter,
      },
      token,
    });
  },
};
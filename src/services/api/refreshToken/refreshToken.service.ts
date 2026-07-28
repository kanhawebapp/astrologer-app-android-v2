import { graphqlRequest } from '../../graphqlClient';
import { REFRESH_ASTROLOGER_TOKEN_MUTATION } from './refreshToken.query';
import { RefreshAstrologerTokenData } from './refreshToken.types';

export const refreshTokenApi = {
  refreshAstrologerToken: async (
    token?: string,
  ) => {
    console.log(
      '====== REFRESH ASTROLOGER TOKEN REQUEST ======',
    );

    console.log(
      'Query:',
      REFRESH_ASTROLOGER_TOKEN_MUTATION.trim(),
    );

    console.log(
      '==============================================',
    );

    return graphqlRequest<RefreshAstrologerTokenData>({
      query: REFRESH_ASTROLOGER_TOKEN_MUTATION,
      token,
    });
  },
};


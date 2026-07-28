import { graphqlRequest } from '../../graphqlClient';
import { LOGOUT_ASTROLOGER_MUTATION } from './logout.query';
import { LogoutAstrologerData } from './logout.types';

export const logoutApi = {
  logoutAstrologer: async (
    token?: string,
  ) => {
    console.log(
      '========= LOGOUT ASTROLOGER REQUEST =========',
    );

    console.log(
      'Query:',
      LOGOUT_ASTROLOGER_MUTATION.trim(),
    );

    console.log(
      '============================================',
    );

    return graphqlRequest<LogoutAstrologerData>({
      query: LOGOUT_ASTROLOGER_MUTATION,
      token,
    });
  },
};
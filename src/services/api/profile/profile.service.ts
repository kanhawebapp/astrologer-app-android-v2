import { graphqlRequest } from '../../graphqlClient';
import { GET_ASTROLOGER_PROFILE_QUERY } from './profile.query';

import {
  GetAstrologerProfileResponse,
} from './profile.types';

export const profileApi = {
  getAstrologerProfile: async (
    token?: string,
  ) => {
    console.log(
      '=== GET ASTROLOGER PROFILE REQUEST ===',
    );

    return graphqlRequest<{
      getAstrologerProfile: GetAstrologerProfileResponse;
    }>({
      query: GET_ASTROLOGER_PROFILE_QUERY,
      token,
    });
  },
};
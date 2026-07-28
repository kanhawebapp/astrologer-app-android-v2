import { graphqlRequest } from '../../graphqlClient';

import {
  GET_ASTROLOGER_FOLLOWERS_QUERY,
  GET_ASTROLOGER_FOLLOWERS_COUNT_QUERY,
} from './followers.query';

import {
  GetAstrologerFollowersResponse,
  GetAstrologerFollowersCountResponse,
} from './followers.types';

export const followersApi = {
  getAstrologerFollowers: async (
    astrologerId: string,
    page = 1,
    limit = 20,
    token?: string,
  ) => {
    console.log('=== GET ASTROLOGER FOLLOWERS ===');

    return graphqlRequest<{
      getAstrologerFollowers: GetAstrologerFollowersResponse;
    }>({
      query: GET_ASTROLOGER_FOLLOWERS_QUERY,
      variables: {
        astrologerId,
        page,
        limit,
      },
      token,
    });
  },

  getAstrologerFollowersCount: async (
    astrologerId: string,
    token?: string,
  ) => {
    console.log('=== GET FOLLOWERS COUNT ===');

    return graphqlRequest<{
      getAstrologerFollowersCount: GetAstrologerFollowersCountResponse;
    }>({
      query: GET_ASTROLOGER_FOLLOWERS_COUNT_QUERY,
      variables: {
        astrologerId,
      },
      token,
    });
  },
};
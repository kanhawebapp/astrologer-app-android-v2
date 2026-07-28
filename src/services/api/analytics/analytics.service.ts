import { graphqlRequest } from '../../graphqlClient';
import { GET_ASTROLOGER_ANALYTICS_QUERY } from './analytics.query';
import {
  GetAstrologerAnalyticsData,
  GetAstrologerAnalyticsVariables,
} from './analytics.types';

export const analyticsApi = {
  getAstrologerAnalytics: async (
    variables: GetAstrologerAnalyticsVariables,
    token?: string,
  ): Promise<GetAstrologerAnalyticsData> => {
    return graphqlRequest<GetAstrologerAnalyticsData>({
      query: GET_ASTROLOGER_ANALYTICS_QUERY,
      variables: variables as unknown as Record<string, unknown>,
      token,
    });
  },
};
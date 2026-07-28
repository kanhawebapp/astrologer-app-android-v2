import { graphqlRequest } from '../../graphqlClient';
import { GET_ASTROLOGER_REVIEWS_QUERY } from './reviews.query';
import {
  GetAstrologerReviewsFilter,
  GetAstrologerReviewsResponse,
} from './reviews.types';

export const reviewsApi = {
  getAstrologerReviews: async (
    filter: GetAstrologerReviewsFilter,
    token?: string,
  ) => {
    console.log('=== GET ASTROLOGER REVIEWS REQUEST ===');

    console.log(
      'Variables:',
      JSON.stringify(
        {
          page: filter.page,
          limit: filter.limit,
          rating: filter.rating,
        },
        null,
        2,
      ),
    );

    console.log('=====================================');

    return graphqlRequest<{
      data: any;
      getAstrologerReviews: GetAstrologerReviewsResponse;
    }>({
      query: GET_ASTROLOGER_REVIEWS_QUERY,
      variables: {
        page: filter.page,
        limit: filter.limit,
        rating: filter.rating,
      },
      token,
    });
  },
};
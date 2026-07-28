import { graphqlRequest } from '../../graphqlClient';
import { REPLY_TO_REVIEW_MUTATION } from './reviewReply.query';

import {
  ReplyToReviewInput,
  ReplyToReviewResponse,
} from './reviewReply.types';

export const reviewReplyApi = {
  replyToReview: async (
    input: ReplyToReviewInput,
    token?: string,
  ) => {
    console.log(
      '=== REPLY TO REVIEW REQUEST ===',
    );

    console.log(
      'Variables:',
      JSON.stringify(input, null, 2),
    );

    console.log(
      '===============================',
    );

    return graphqlRequest<{
      data: any;
      replyToReview: ReplyToReviewResponse;
    }>({
      query: REPLY_TO_REVIEW_MUTATION,
      variables: {
        reviewId: input.reviewId,
        reply: input.reply,
      },
      token,
    });
  },
};
// src/features/chatHistory/api/chatHistory.service.ts

import {graphqlRequest} from '../../graphqlClient';
import {GET_ASTROLOGER_CHAT_HISTORY_QUERY} from './chatHistory.query';

import {
  GetAstrologerChatHistoryFilter,
  GetAstrologerChatHistoryResponse,
} from './chatHistory.types';

export const chatHistoryApi = {
  getAstrologerChatHistory: async (
    filter: GetAstrologerChatHistoryFilter,
    token?: string,
  ) => {
    console.log('=== GET ASTROLOGER CHAT HISTORY REQUEST ===');

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

    console.log('==========================================');

    return graphqlRequest<{
      getAstrologerChatHistory: GetAstrologerChatHistoryResponse;
    }>({
      query: GET_ASTROLOGER_CHAT_HISTORY_QUERY,

      variables: {
        page: filter.page,
        limit: filter.limit,
        status: filter.status,
      },

      token,
    });
  },
};

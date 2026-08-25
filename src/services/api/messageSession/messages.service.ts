// messages.service.ts

import {graphqlRequest} from '../../graphqlClient';
import {GET_SESSION_MESSAGES_QUERY} from './messages.query';
import {GetSessionMessagesResponse} from './messages.types';

interface GetSessionMessagesVariables {
  sessionId: string;
}

export const messagesApi = {
  getSessionMessages: async (
    variables: GetSessionMessagesVariables,
    token?: string,
  ) => {
    console.log('=== GET SESSION MESSAGES REQUEST ===');

    console.log('Variables:', JSON.stringify(variables, null, 2));

    console.log('Query:', GET_SESSION_MESSAGES_QUERY.trim());

    console.log('===================================');

    return graphqlRequest<{
      getSessionMessages: GetSessionMessagesResponse;
    }>({
      query: GET_SESSION_MESSAGES_QUERY,
      variables: variables as unknown as Record<string, unknown>,
      token,
    });
  },
};

import { graphqlRequest } from '../../graphqlClient';

import {
  GET_REMEDIES_QUERY,
  SEND_REMEDY_MUTATION,
  GET_SESSION_REMEDIES_QUERY,
} from './remedies.query';

import {
  GetRemediesResponse,
  SendRemedyInput,
  SendRemedyResponse,
  GetSessionRemediesResponse,
} from './remedies.types';

export const remediesApi = {
  getRemedies: async (token?: string) => {
    console.log(
      '=== GET REMEDIES REQUEST ===',
    );

    return graphqlRequest<{
      getRemedies: GetRemediesResponse;
    }>({
      query: GET_REMEDIES_QUERY,
      token,
    });
  },

  sendRemedy: async (
    input: SendRemedyInput,
    token?: string,
  ) => {
    console.log(
      '=== SEND REMEDY REQUEST ===',
    );

    console.log(
      'Variables:',
      JSON.stringify(input, null, 2),
    );

    return graphqlRequest<{
      data: any;
      sendRemedy: SendRemedyResponse;
    }>({
      query: SEND_REMEDY_MUTATION,
      variables: {
        sessionId: input.sessionId,
        remedyText: input.remedyText,
      },
      token,
    });
  },

  getSessionRemedies: async (
    sessionId: string,
    token?: string,
  ) => {
    console.log(
      '=== GET SESSION REMEDIES REQUEST ===',
    );

    return graphqlRequest<{
      data: any;
      getSessionRemedies: GetSessionRemediesResponse;
    }>({
      query: GET_SESSION_REMEDIES_QUERY,
      variables: {
        sessionId,
      },
      token,
    });
  },
};
import { graphqlRequest } from '../../graphqlClient';
import { GET_SESSION_REMEDIES_QUERY } from './myRemedies.query';
import {
  GetSessionRemediesData,
  GetSessionRemediesVariables,
} from './myRemedies.types';

export const myRemediesApi = {
  getSessionRemedies: async (
    variables?: GetSessionRemediesVariables,
    token?: string,
  ) => {
    console.log(
      '=== GET SESSION REMEDIES REQUEST ===',
    );

    console.log(
      'Variables:',
      JSON.stringify(
        variables,
        null,
        2,
      ),
    );

    console.log(
      'Query:',
      GET_SESSION_REMEDIES_QUERY.trim(),
    );

    console.log(
      '====================================',
    );

    return graphqlRequest<
      GetSessionRemediesData,
      GetSessionRemediesVariables
    >({
      query: GET_SESSION_REMEDIES_QUERY,
      variables,
      token,
    });
  },
};
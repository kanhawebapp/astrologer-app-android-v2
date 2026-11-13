import { graphqlRequest } from '../../graphqlClient';
import { GET_PREVIOUS_REMEDIES_QUERY } from './previousRemedies.query';
import {
  GetPreviousRemediesData,
  GetPreviousRemediesVariables,
} from './previousRemedies.types';

export const previousRemediesApi = {
  getPreviousRemedies: async (
    variables: GetPreviousRemediesVariables,
    token?: string,
  ) => {
    return graphqlRequest<GetPreviousRemediesData>({
      query: GET_PREVIOUS_REMEDIES_QUERY,
      variables,
      token,
    });
  },
};

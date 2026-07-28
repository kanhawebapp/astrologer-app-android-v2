import { graphqlRequest } from '../../graphqlClient';

import {
  TOGGLE_ASTROLOGER_SERVICE_MUTATION,
  GET_ASTROLOGER_SERVICES_QUERY,
} from './toggleAstrologerService.query';

import {
  ToggleAstrologerServiceResponse,
  ToggleAstrologerServiceVariables,
  GetAstrologerServicesResponse,
  GetAstrologerServicesVariables,
} from './toggleAstrologerService.types';

export const astrologerServicesApi = {
  toggleAstrologerService: async (
    variables: ToggleAstrologerServiceVariables,
    token?: string,
  ) => {
    console.log(
      '=== TOGGLE ASTROLOGER SERVICE REQUEST ===',
    );

    console.log(
      'Variables:',
      JSON.stringify(
        variables,
        null,
        2,
      ),
    );

    return graphqlRequest<
      ToggleAstrologerServiceResponse,
    //   ToggleAstrologerServiceVariables
    >({
      query:
        TOGGLE_ASTROLOGER_SERVICE_MUTATION,
      variables,
      token,
    });
  },

  getAstrologerServices: async (
    variables: GetAstrologerServicesVariables,
    token?: string,
  ) => {
    console.log(
      '=== GET ASTROLOGER SERVICES REQUEST ===',
    );

    console.log(
      'Variables:',
      JSON.stringify(
        variables,
        null,
        2,
      ),
    );

    return graphqlRequest<
      GetAstrologerServicesResponse,
    //   GetAstrologerServicesVariables
    >({
      query: GET_ASTROLOGER_SERVICES_QUERY,
      variables,
      token,
    });
  },
};
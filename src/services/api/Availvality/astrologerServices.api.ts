import { graphqlRequest } from '../../graphqlClient';

import {
  TOGGLE_ASTROLOGER_SERVICE_MUTATION,
  GET_ASTROLOGER_SERVICES_QUERY,
} from './astrologerServices.query';

import {
  GetAstrologerServicesResponse,
  ToggleAstrologerServiceInput,
  ToggleAstrologerServiceResponse,
} from './astrologerServices.types';

export const astrologerServicesApi = {

  getAstrologerServices: async (
    astrologerId: string,
    token?: string,
  ) => {
    console.log('=== GET ASTROLOGER SERVICES REQUEST ===');

    return graphqlRequest<{
      getAstrologerById: GetAstrologerServicesResponse;
    }>({
      query: GET_ASTROLOGER_SERVICES_QUERY,
      variables: {
        astrologerId,
      },
      token,
    });
  },
  toggleAstrologerService: async (
    input: ToggleAstrologerServiceInput,
    token?: string,
  ) => {
    console.log('=== TOGGLE ASTROLOGER SERVICE REQUEST ===');

    console.log('Variables:', JSON.stringify(input, null, 2));

    return graphqlRequest<{
      toggleAstrologerService: ToggleAstrologerServiceResponse;
    }>({
      query: TOGGLE_ASTROLOGER_SERVICE_MUTATION,
      variables: {
        astrologerId: input.astrologerId,
        serviceType: input.serviceType,
        status: input.status,
      },
      token,
    });
  },
};
import {graphqlRequest} from '../../graphqlClient';
import {START_LIVE_TOGGLE_SERVICES_MUTATION} from './startLiveToggleServices.query';
import {
  StartLiveToggleServicesResponse,
  StartLiveToggleServicesVariables,
  ToggleServiceResponse,
} from './startLiveToggleServices.types';

export const startLiveToggleServicesApi = {
  startLiveToggleServices: async (
    variables: StartLiveToggleServicesVariables,
    token?: string,
  ): Promise<ToggleServiceResponse> => {
    const response = await graphqlRequest<StartLiveToggleServicesResponse>({
      query: START_LIVE_TOGGLE_SERVICES_MUTATION,
      variables: {
        astrologerId: variables.astrologerId,
        serviceType: variables.serviceType,
        status: variables.status,
      },
      token,
    });

    return response.startLiveToggleServices;
  },
};

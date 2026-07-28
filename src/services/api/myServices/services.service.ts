import { graphqlRequest } from '../../graphqlClient';
import { GET_ASTROLOGER_ASSIGNED_BOOKED_SERVICES_QUERY } from './services.query';
import {
  GetBookedServicesData,
  GetBookedServicesVariables,
} from './services.types';

export const bookedServicesApi = {
  getBookedServices: async (
    variables: GetBookedServicesVariables,
    token?: string,
  ) => {
    console.log(
      '=== GET ASSIGNED BOOKED SERVICES REQUEST ===',
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
      GET_ASTROLOGER_ASSIGNED_BOOKED_SERVICES_QUERY.trim(),
    );

    console.log(
      '===========================================',
    );

    return graphqlRequest<
      GetBookedServicesData,
      GetBookedServicesVariables
    >({
      query:
        GET_ASTROLOGER_ASSIGNED_BOOKED_SERVICES_QUERY,
      variables,
      token,
    });
  },
};
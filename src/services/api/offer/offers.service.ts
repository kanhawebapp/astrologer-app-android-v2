import { graphqlRequest } from '../../graphqlClient';

import {
  GET_OFFERS_QUERY,
  UPDATE_OFFER_STATUS_MUTATION,
} from './offers.query';

import {
  GetOffersResponse,
  UpdateOfferStatusInput,
  UpdateOfferStatusResponse,
} from './offers.types';

export const offersApi = {
  getOffers: async (token?: string) => {
    console.log('=== GET OFFERS REQUEST ===');

    return graphqlRequest<{
      getOffers: GetOffersResponse;
    }>({
      query: GET_OFFERS_QUERY,
      token,
    });
  },

  updateOfferStatus: async (
    input: UpdateOfferStatusInput,
    token?: string,
  ) => {
    console.log(
      '=== UPDATE OFFER STATUS REQUEST ===',
    );

    console.log(
      'Variables:',
      JSON.stringify(input, null, 2),
    );

    return graphqlRequest<{
      updateOfferStatus: UpdateOfferStatusResponse;
    }>({
      query: UPDATE_OFFER_STATUS_MUTATION,
      variables: {
        offerId: input.offerId,
        isActive: input.isActive,
      },
      token,
    });
  },
};

import { graphqlRequest } from '../../graphqlClient';
import { UPDATE_OFFER_STATUS_MUTATION } from './offerStatus.query';
import {
  UpdateOfferStatusInput,
  UpdateOfferStatusResponse,
} from './offerStatus.types';

export const offerStatusApi = {
  updateOfferStatus: async (
    variables: UpdateOfferStatusInput,
    token?: string,
  ) => {
    console.log(
      '=== UPDATE OFFER STATUS REQUEST ===',
    );
    console.log(
      'Variables:',
      JSON.stringify(variables, null, 2),
    );
    console.log(
      'Mutation:',
      UPDATE_OFFER_STATUS_MUTATION.trim(),
    );
    console.log(
      '====================================',
    );

    return graphqlRequest<UpdateOfferStatusResponse>({
      query: UPDATE_OFFER_STATUS_MUTATION,
      variables,
      token,
    });
  },
};
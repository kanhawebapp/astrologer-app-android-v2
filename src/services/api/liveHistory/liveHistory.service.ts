import {graphqlRequest} from '../../graphqlClient';
import {GET_MY_LIVE_INTERACTION_HISTORY_QUERY} from './liveHistory.query';
import {
  GetMyLiveInteractionHistoryResponse,
  GetMyLiveInteractionHistoryVariables,
} from './liveHistory.types';

export const liveHistoryApi = {
  getMyLiveInteractionHistory: async (
    variables: GetMyLiveInteractionHistoryVariables,
    token?: string,
  ) => {
    return graphqlRequest<{
      getMyLiveInteractionHistory: GetMyLiveInteractionHistoryResponse;
    }>({
      query: GET_MY_LIVE_INTERACTION_HISTORY_QUERY,
      variables: variables as unknown as Record<string, unknown>,
      token,
    });
  },
};

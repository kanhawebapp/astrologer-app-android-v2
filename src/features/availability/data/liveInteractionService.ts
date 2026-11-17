import {graphqlRequest} from '../../../services/graphqlClient';
import {
  GetPendingLiveInteractionsResponse,
  LiveInteractionAction,
  RespondLiveInteractionRequestResponse,
} from '../domain/liveInteractionTypes';

const GET_PENDING_LIVE_INTERACTIONS_QUERY = `
  query GetPendingLiveInteractions($liveStreamId: ID!) {
    getPendingLiveInteractions(liveStreamId: $liveStreamId) {
      id
      liveStreamId
      userId
      astrologerId
      agoraUid
      interactionType
      status
      requestedAt
      acceptedAt
      endedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;

const RESPOND_LIVE_INTERACTION_REQUEST_MUTATION = `
  mutation RespondLiveInteractionRequest(
    $requestId: ID!
    $action: LiveInteractionAction!
  ) {
    respondLiveInteractionRequest(
      requestId: $requestId
      action: $action
    ) {
      id
      status
      interactionType
      agoraUid
      userId
      liveStreamId
      acceptedAt
      endedAt
      __typename
    }
  }
`;

export const getPendingLiveInteractions = (liveStreamId: string) =>
  graphqlRequest<GetPendingLiveInteractionsResponse>({
    query: GET_PENDING_LIVE_INTERACTIONS_QUERY,
    variables: {liveStreamId},
  });

export const respondLiveInteractionRequest = (
  requestId: string,
  action: LiveInteractionAction,
) =>
  graphqlRequest<RespondLiveInteractionRequestResponse>({
    query: RESPOND_LIVE_INTERACTION_REQUEST_MUTATION,
    variables: {requestId, action},
  });

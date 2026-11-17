import {graphqlRequest} from '../../../services/graphqlClient';
import {
  EndLiveInteractionResponse,
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
      liveStreamId
      astrologerId
      userId
      interactionType
      status
      agoraUid
      acceptedAt
      requestedAt
      endedAt
      __typename
    }
  }
`;

const END_LIVE_INTERACTION_MUTATION = `
  mutation EndLiveInteraction($requestId: ID!) {
    endLiveInteraction(requestId: $requestId) {
      id
      liveStreamId
      astrologerId
      userId
      interactionType
      status
      agoraUid
      acceptedAt
      endedAt
      requestedAt
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

export const endLiveInteraction = (requestId: string) =>
  graphqlRequest<EndLiveInteractionResponse>({
    query: END_LIVE_INTERACTION_MUTATION,
    variables: {requestId},
  });

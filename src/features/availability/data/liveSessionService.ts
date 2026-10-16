import {graphqlRequest} from '../../../services/graphqlClient';
import {
  ScheduleLiveInput,
  ScheduleLiveResponse,
  GetMyScheduledLivesResponse,
  StartLiveResponse,
  JoinLiveResponse,
  JoinLiveRole,
  EndLiveResponse,
} from '../domain/liveTypes';

const SCHEDULE_LIVE_MUTATION = `
  mutation ScheduleLive(
    $title: String!
    $scheduledAt: String!
    $scheduledEndAt: String!
  ) {
    scheduleLive(
      title: $title
      scheduledAt: $scheduledAt
      scheduledEndAt: $scheduledEndAt
    ) {
      id
      astrologerId
      title
      channelName
      status
      scheduledAt
      scheduledEndAt
      createdAt
      __typename
    }
  }
`;

const GET_MY_SCHEDULED_LIVES_QUERY = `
  query GetMyScheduledLives {
    getMyScheduledLives {
      id
      astrologerId
      title
      channelName
      status
      scheduledAt
      scheduledEndAt
      createdAt
      __typename
    }
  }
`;

const START_LIVE_MUTATION = `
  mutation StartLive($title: String!) {
    startLive(title: $title) {
      id
      astrologerId
      title
      channelName
      status
      createdAt
    }
  }
`;

const JOIN_LIVE_QUERY = `
  query JoinLive($channelName: String!, $role: String!) {
    joinLive(channelName: $channelName, role: $role) {
      appId
      channelName
      uid
      rtcToken
      chatUserId
      chatToken
      chatRoomId
      chatAppKey
      __typename
    }
  }
`;

const END_LIVE_MUTATION = `
  mutation EndLive($streamId: String!) {
    endLive(streamId: $streamId)
  }
`;

export const scheduleLive = (input: ScheduleLiveInput) =>
  graphqlRequest<ScheduleLiveResponse>({
    query: SCHEDULE_LIVE_MUTATION,
    variables: {
      title: input.title,
      scheduledAt: input.scheduledAt,
      scheduledEndAt: input.scheduledEndAt,
    },
  });

export const getMyScheduledLives = () =>
  graphqlRequest<GetMyScheduledLivesResponse>({
    query: GET_MY_SCHEDULED_LIVES_QUERY,
  });

export const startLive = (title: string) =>
  graphqlRequest<StartLiveResponse>({
    query: START_LIVE_MUTATION,
    variables: {title},
  });

export const joinLive = (channelName: string, role: JoinLiveRole) =>
  graphqlRequest<JoinLiveResponse>({
    query: JOIN_LIVE_QUERY,
    variables: {channelName, role},
  });

export const endLive = (streamId: string) =>
  graphqlRequest<EndLiveResponse>({
    query: END_LIVE_MUTATION,
    variables: {streamId},
  });

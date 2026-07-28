import { graphqlRequest } from '../../../services/graphqlClient';
import {
  LiveSession,
  ScheduleLiveInput,
  LiveSessionResponse,
  LiveSessionsResponse,
} from '../domain/liveTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../../../config/env';

const GET_LIVE_SESSIONS_QUERY = `
  query GetLiveSessions {
    liveSessions {
      id
      title
      description
      scheduledAt
      startedAt
      endedAt
      status
      stats {
        viewers
        peakViewers
        likes
        comments
        gifts
        earnings
        duration
      }
      thumbnailUrl
      createdAt
      updatedAt
    }
  }
`;

const GET_CURRENT_LIVE_QUERY = `
  query GetCurrentLive {
    currentLive {
      id
      title
      description
      scheduledAt
      startedAt
      status
      stats {
        viewers
        peakViewers
        likes
        comments
        gifts
        earnings
        duration
      }
      createdAt
      updatedAt
    }
  }
`;

const SCHEDULE_LIVE_MUTATION = `
  mutation ScheduleLive($input: ScheduleLiveInput!) {
    scheduleLive(input: $input) {
      id
      title
      description
      scheduledAt
      status
      stats {
        viewers
        peakViewers
        likes
        comments
        gifts
        earnings
        duration
      }
      createdAt
      updatedAt
    }
  }
`;

const START_LIVE_MUTATION = `
  mutation StartLiveSession($sessionId: ID!) {
    startLiveSession(sessionId: $sessionId) {
      id
      title
      description
      scheduledAt
      startedAt
      status
      stats {
        viewers
        peakViewers
        likes
        comments
        gifts
        earnings
        duration
      }
      createdAt
      updatedAt
    }
  }
`;

const END_LIVE_MUTATION = `
  mutation EndLiveSession($sessionId: ID!) {
    endLiveSession(sessionId: $sessionId) {
      id
      title
      description
      scheduledAt
      startedAt
      endedAt
      status
      stats {
        viewers
        peakViewers
        likes
        comments
        gifts
        earnings
        duration
      }
      createdAt
      updatedAt
    }
  }
`;

const CANCEL_LIVE_MUTATION = `
  mutation CancelLiveSession($sessionId: ID!) {
    cancelLiveSession(sessionId: $sessionId) {
      id
      title
      status
      updatedAt
    }
  }
`;

const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(Config.TOKEN_KEY);
    console.log('[ASYNCSTORAGE] Read token from Config.TOKEN_KEY:', token ? 'YES' : 'NO');
    if (token) {
      console.log(`[ASYNCSTORAGE] Token Preview: ${token.substring(0, 20)}...`);
    }
    return token;
  } catch {
    console.log('[ASYNCSTORAGE] Read token from Config.TOKEN_KEY: ERROR');
    return null;
  }
};

export const fetchLiveSessions = async (): Promise<LiveSessionsResponse> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token');
  }
  return graphqlRequest<LiveSessionsResponse>({
    query: GET_LIVE_SESSIONS_QUERY,
    token,
  });
};

export const fetchCurrentLive =
  async (): Promise<LiveSessionResponse | null> => {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token');
    }
    try {
      return await graphqlRequest<LiveSessionResponse>({
        query: GET_CURRENT_LIVE_QUERY,
        token,
      });
    } catch {
      return null;
    }
  };

export const scheduleLive = async (
  input: ScheduleLiveInput,
): Promise<LiveSessionResponse> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token');
  }
  return graphqlRequest<LiveSessionResponse>({
    query: SCHEDULE_LIVE_MUTATION,
    variables: { input },
    token,
  });
};

export const startLiveSession = async (
  sessionId?: string,
): Promise<LiveSessionResponse> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token');
  }
  return graphqlRequest<LiveSessionResponse>({
    query: START_LIVE_MUTATION,
    variables: { sessionId },
    token,
  });
};

export const endLiveSession = async (
  sessionId: string,
): Promise<LiveSessionResponse> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token');
  }
  return graphqlRequest<LiveSessionResponse>({
    query: END_LIVE_MUTATION,
    variables: { sessionId },
    token,
  });
};

export const cancelLiveSession = async (
  sessionId: string,
): Promise<LiveSessionResponse> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token');
  }
  return graphqlRequest<LiveSessionResponse>({
    query: CANCEL_LIVE_MUTATION,
    variables: { sessionId },
    token,
  });
};

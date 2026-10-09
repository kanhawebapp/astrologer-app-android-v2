import {
  JoinLiveCredentials,
  LiveSession,
  ScheduleLiveInput,
} from '../domain/liveTypes';
import * as liveSessionService from './liveSessionService';
import { describeError, liveLog, liveWarn } from './liveLogger';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

// Backend timestamps may arrive as epoch strings (seconds or milliseconds) or ISO 8601.
export const parseLiveTimestamp = (
  value: string | number | null | undefined,
): Date | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const raw = typeof value === 'number' ? String(value) : value.trim();
  if (/^\d+$/.test(raw)) {
    const num = Number(raw);
    // Epoch values with 10 or fewer digits are seconds; longer values are milliseconds.
    const ms = raw.length <= 10 ? num * 1000 : num;
    const date = new Date(ms);
    return isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
};

const assertValidSession = (
  session: LiveSession | null | undefined,
  operation: string,
): LiveSession => {
  if (!session || !isNonEmptyString(session.id)) {
    throw new Error(`${operation}: server did not return a session id`);
  }
  if (!isNonEmptyString(session.channelName)) {
    throw new Error(`${operation}: server did not return a channel name`);
  }
  return session;
};

export const getMyScheduledLives = async (): Promise<LiveSession[]> => {
  liveLog('GetMyScheduledLives request');
  try {
    const response = await liveSessionService.getMyScheduledLives();
    const list = response.getMyScheduledLives;
    if (!Array.isArray(list)) {
      liveWarn('GetMyScheduledLives response: not a list', {
        receivedNull: list === null,
      });
      return [];
    }
    const valid = list.filter(item => item && isNonEmptyString(item.id));
    liveLog('GetMyScheduledLives response', {
      count: list.length,
      validCount: valid.length,
    });
    return valid;
  } catch (error) {
    liveWarn('GetMyScheduledLives error', describeError(error));
    throw error;
  }
};

export const scheduleLive = async (
  input: ScheduleLiveInput,
): Promise<LiveSession> => {
  liveLog('ScheduleLive request', {
    hasTitle: isNonEmptyString(input.title),
    scheduledAt: input.scheduledAt,
  });
  try {
    const response = await liveSessionService.scheduleLive(input);
    const session = assertValidSession(response.scheduleLive, 'Schedule live');
    liveLog('ScheduleLive response', {
      sessionId: session.id,
      status: session.status,
      scheduledAt: session.scheduledAt,
    });
    return session;
  } catch (error) {
    liveWarn('ScheduleLive error', describeError(error));
    throw error;
  }
};

export const startLive = async (title: string): Promise<LiveSession> => {
  liveLog('StartLive request', { hasTitle: isNonEmptyString(title) });
  try {
    const response = await liveSessionService.startLive(title);
    const session = assertValidSession(response.startLive, 'Start live');
    liveLog('StartLive response', {
      sessionId: session.id,
      status: session.status,
      hasChannelName: true,
    });
    return session;
  } catch (error) {
    liveWarn('StartLive error', describeError(error));
    throw error;
  }
};

export const joinLiveAsPublisher = async (
  channelName: string,
): Promise<JoinLiveCredentials> => {
  liveLog('JoinLive request', {
    hasChannelName: isNonEmptyString(channelName),
    role: 'publisher',
  });
  try {
    if (!isNonEmptyString(channelName)) {
      throw new Error('Join live: missing channel name');
    }
    const response = await liveSessionService.joinLive(
      channelName,
      'publisher',
    );
    const credentials = response.joinLive;
    const hasToken = isNonEmptyString(credentials?.token);
    const hasAppId = isNonEmptyString(credentials?.appId);
    const hasUid =
      typeof credentials?.uid === 'number' && Number.isInteger(credentials.uid);
    const channelMatches = credentials?.channelName === channelName;
    liveLog('JoinLive response', {
      hasToken,
      hasAppId,
      hasUid,
      hasChannelName: isNonEmptyString(credentials?.channelName),
      channelMatches,
    });
    if (!credentials || !hasToken || !hasAppId || !hasUid) {
      throw new Error('Join live: server returned incomplete Agora credentials');
    }
    if (!channelMatches) {
      throw new Error(
        'Join live: server returned credentials for a different channel',
      );
    }
    return credentials;
  } catch (error) {
    liveWarn('JoinLive error', describeError(error));
    throw error;
  }
};

export const endLive = async (streamId: string): Promise<void> => {
  liveLog('EndLive request', { streamId });
  try {
    if (!isNonEmptyString(streamId)) {
      throw new Error('End live: missing stream id');
    }
    const response = await liveSessionService.endLive(streamId);
    liveLog('EndLive response', { streamId, result: response.endLive });
    if (response.endLive !== true) {
      throw new Error('End live: server did not confirm the session ended');
    }
  } catch (error) {
    liveWarn('EndLive error', describeError(error));
    throw error;
  }
};

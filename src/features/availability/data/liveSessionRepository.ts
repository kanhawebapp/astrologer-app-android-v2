import {
  JoinLiveCredentials,
  LiveChatCredentials,
  LiveSession,
  ScheduleLiveInput,
} from '../domain/liveTypes';
import * as liveSessionService from './liveSessionService';
import {describeError, liveLog, liveWarn} from './liveLogger';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Parses live-session timestamps from the API.
 * ScheduleLive / list responses return scheduledAt, scheduledEndAt, and createdAt
 * as numeric millisecond strings (e.g. "1792149540000") — not ISO date strings.
 * Do not treat those response fields as ISO; use Number(value) + new Date(ms).
 */
export const parseLiveTimestamp = (
  value: string | number | null | undefined,
): Date | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return null;
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  const raw = value.trim();
  if (/^\d+$/.test(raw)) {
    const timestamp = Number(raw);
    if (!Number.isFinite(timestamp)) {
      return null;
    }
    // 10 or fewer digits → seconds; longer values → milliseconds (API contract).
    const ms = raw.length <= 10 ? timestamp * 1000 : timestamp;
    const date = new Date(ms);
    return isNaN(date.getTime()) ? null : date;
  }
  // Fallback for any legacy ISO values; primary response path is numeric ms above.
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
};

export const toLiveChatCredentials = (
  credentials: JoinLiveCredentials | null | undefined,
): LiveChatCredentials | null => {
  if (
    !credentials ||
    !isNonEmptyString(credentials.chatUserId) ||
    !isNonEmptyString(credentials.chatToken) ||
    !isNonEmptyString(credentials.chatRoomId) ||
    !isNonEmptyString(credentials.chatAppKey)
  ) {
    return null;
  }
  return {
    chatUserId: credentials.chatUserId,
    chatToken: credentials.chatToken,
    chatRoomId: credentials.chatRoomId,
    chatAppKey: credentials.chatAppKey,
  };
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
    scheduledEndAt: input.scheduledEndAt,
  });
  try {
    const response = await liveSessionService.scheduleLive(input);
    const session = assertValidSession(response.scheduleLive, 'Schedule live');
    liveLog('ScheduleLive response', {
      sessionId: session.id,
      astrologerId: session.astrologerId,
      channelName: session.channelName,
      status: session.status,
      scheduledAt: session.scheduledAt,
      scheduledEndAt: session.scheduledEndAt,
      scheduledAtParsed: parseLiveTimestamp(session.scheduledAt)?.toISOString(),
      scheduledEndAtParsed: parseLiveTimestamp(
        session.scheduledEndAt,
      )?.toISOString(),
    });
    return session;
  } catch (error) {
    liveWarn('ScheduleLive error', describeError(error));
    throw error;
  }
};

export const startLive = async (title: string): Promise<LiveSession> => {
  liveLog('StartLive request', {hasTitle: isNonEmptyString(title)});
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
    const hasRtcToken = isNonEmptyString(credentials?.rtcToken);
    const hasAppId = isNonEmptyString(credentials?.appId);
    const hasUid =
      typeof credentials?.uid === 'number' && Number.isInteger(credentials.uid);
    const channelMatches = credentials?.channelName === channelName;
    const hasChatCredentials = toLiveChatCredentials(credentials) !== null;
    liveLog('JoinLive response', {
      hasRtcToken,
      hasAppId,
      hasUid,
      hasChannelName: isNonEmptyString(credentials?.channelName),
      channelMatches,
      hasChatCredentials,
    });
    if (!credentials || !hasRtcToken || !hasAppId || !hasUid) {
      throw new Error(
        'Join live: server returned incomplete Agora credentials',
      );
    }
    if (!hasChatCredentials) {
      liveWarn('JoinLive response: incomplete chat credentials', {
        hasChatUserId: isNonEmptyString(credentials.chatUserId),
        hasChatToken: isNonEmptyString(credentials.chatToken),
        hasChatRoomId: isNonEmptyString(credentials.chatRoomId),
        hasChatAppKey: isNonEmptyString(credentials.chatAppKey),
      });
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
  liveLog('EndLive request', {streamId});
  try {
    if (!isNonEmptyString(streamId)) {
      throw new Error('End live: missing stream id');
    }
    const response = await liveSessionService.endLive(streamId);
    liveLog('EndLive response', {streamId, result: response.endLive});
    if (response.endLive !== true) {
      throw new Error('End live: server did not confirm the session ended');
    }
  } catch (error) {
    liveWarn('EndLive error', describeError(error));
    throw error;
  }
};

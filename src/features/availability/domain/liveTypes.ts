export enum LiveSessionStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  ENDED = 'ENDED',
}

export interface LiveSession {
  id: string;
  astrologerId?: string;
  title: string;
  channelName: string;
  status: LiveSessionStatus | string;
  /** Epoch milliseconds as a numeric string from the API (not ISO). */
  scheduledAt?: string | null;
  /** Epoch milliseconds as a numeric string from the API (not ISO). */
  scheduledEndAt?: string | null;
  /** Epoch milliseconds as a numeric string from the API (not ISO). */
  createdAt: string;
}

export type JoinLiveRole = 'publisher' | 'audience';

export interface JoinLiveCredentials {
  appId: string;
  channelName: string;
  uid: number;
  rtcToken: string;
  chatUserId: string;
  chatToken: string;
  chatRoomId: string;
  chatAppKey: string;
}

export type LiveChatCredentials = Pick<
  JoinLiveCredentials,
  'chatUserId' | 'chatToken' | 'chatRoomId' | 'chatAppKey'
>;

export type LiveChatMessageStatus = 'sending' | 'sent' | 'failed';

export interface LiveChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  text: string;
  timestamp: number;
  isOwn: boolean;
  status: LiveChatMessageStatus;
}

export interface LiveSessionState {
  scheduledLives: LiveSession[];
  activeLive: LiveSession | null;
  isLoading: boolean;
  hasLoaded: boolean;
  listError: string | null;
  isScheduling: boolean;
  isStarting: boolean;
  isEnding: boolean;
}

export interface ScheduleLiveInput {
  title: string;
  /** ISO 8601 UTC date-time string (with Z suffix). */
  scheduledAt: string;
  /** ISO 8601 UTC date-time string (with Z suffix). */
  scheduledEndAt: string;
}

export interface ScheduleLiveResponse {
  scheduleLive: LiveSession | null;
}

export interface GetMyScheduledLivesResponse {
  getMyScheduledLives: LiveSession[] | null;
}

export interface StartLiveResponse {
  startLive: LiveSession | null;
}

export interface JoinLiveResponse {
  joinLive: JoinLiveCredentials | null;
}

export interface EndLiveResponse {
  endLive: boolean | null;
}

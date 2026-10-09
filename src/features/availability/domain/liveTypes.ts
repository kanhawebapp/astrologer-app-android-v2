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
  scheduledAt?: string | null;
  createdAt: string;
}

export interface JoinLiveCredentials {
  token: string;
  uid: number;
  appId: string;
  channelName: string;
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
  scheduledAt: string;
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

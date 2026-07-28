export enum LiveSessionStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface LiveSessionStats {
  viewers: number;
  peakViewers: number;
  likes: number;
  comments: number;
  gifts: number;
  earnings: number;
  duration: number;
}

export interface LiveSession {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  status: LiveSessionStatus;
  stats: LiveSessionStats;
  thumbnailUrl?: string;
  streamKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiveSessionState {
  liveSessions: LiveSession[];
  currentLive: LiveSession | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  isMockData: boolean;
}

export interface ScheduleLiveInput {
  title: string;
  description?: string;
  scheduledAt: string;
}

export interface LiveSessionResponse {
  liveSession: LiveSession;
}

export interface LiveSessionsResponse {
  liveSessions: LiveSession[];
}

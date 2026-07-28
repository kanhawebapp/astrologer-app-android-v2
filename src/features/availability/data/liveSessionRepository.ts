import {
  LiveSession,
  ScheduleLiveInput,
  LiveSessionResponse,
  LiveSessionsResponse,
  LiveSessionStatus,
} from '../domain/liveTypes';
import {
  dummyLiveSessions,
  dummyCurrentLive,
  getDefaultLiveSessions,
  getCurrentLiveSession,
} from './dummyLiveData';
import * as liveSessionService from './liveSessionService';

export interface LiveSessionResult {
  data: LiveSession | LiveSession[] | null;
  isMockData: boolean;
}

export const getLiveSessions = async (): Promise<LiveSessionResult> => {
  try {
    const response = await liveSessionService.fetchLiveSessions();
    return { data: response.liveSessions, isMockData: false };
  } catch (error) {
    console.log('[LiveSessionRepository] Using fallback dummy data:', error);
    return { data: getDefaultLiveSessions(), isMockData: true };
  }
};

export const getCurrentLive = async (): Promise<LiveSessionResult> => {
  try {
    const response = await liveSessionService.fetchCurrentLive();
    if (response?.liveSession) {
      return { data: response.liveSession, isMockData: false };
    }
    return { data: null, isMockData: false };
  } catch (error) {
    console.log('[LiveSessionRepository] No current live:', error);
    const currentLive = getCurrentLiveSession();
    if (currentLive) {
      return { data: currentLive, isMockData: true };
    }
    return { data: null, isMockData: true };
  }
};

export const scheduleNewLive = async (
  input: ScheduleLiveInput,
): Promise<LiveSessionResult> => {
  try {
    const response = await liveSessionService.scheduleLive(input);
    return { data: response.liveSession, isMockData: false };
  } catch (error) {
    console.log('[LiveSessionRepository] Schedule failed, using mock:', error);
    const newSession: LiveSession = {
      id: `live-${Date.now()}`,
      ...input,
      status: LiveSessionStatus.SCHEDULED,
      stats: {
        viewers: 0,
        peakViewers: 0,
        likes: 0,
        comments: 0,
        gifts: 0,
        earnings: 0,
        duration: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { data: newSession, isMockData: true };
  }
};

export const startLive = async (
  sessionId?: string,
): Promise<LiveSessionResult> => {
  try {
    const response = await liveSessionService.startLiveSession(sessionId);
    return { data: response.liveSession, isMockData: false };
  } catch (error) {
    console.log('[LiveSessionRepository] Start failed, using mock:', error);
    const instantLive: LiveSession = {
      id: `live-instant-${Date.now()}`,
      title: 'Instant Live Session',
      scheduledAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      status: LiveSessionStatus.LIVE,
      stats: {
        viewers: 0,
        peakViewers: 0,
        likes: 0,
        comments: 0,
        gifts: 0,
        earnings: 0,
        duration: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { data: instantLive, isMockData: true };
  }
};

export const endLive = async (
  sessionId: string,
): Promise<LiveSessionResult> => {
  try {
    const response = await liveSessionService.endLiveSession(sessionId);
    return { data: response.liveSession, isMockData: false };
  } catch (error) {
    console.log('[LiveSessionRepository] End failed, using mock:', error);
    const endedLive: LiveSession = {
      ...dummyCurrentLive,
      endedAt: new Date().toISOString(),
      status: LiveSessionStatus.COMPLETED,
      updatedAt: new Date().toISOString(),
    };
    return { data: endedLive, isMockData: true };
  }
};

export const cancelLive = async (
  sessionId: string,
): Promise<LiveSessionResult> => {
  try {
    const response = await liveSessionService.cancelLiveSession(sessionId);
    return { data: response.liveSession, isMockData: false };
  } catch (error) {
    console.log('[LiveSessionRepository] Cancel failed, using mock:', error);
    const cancelledSession = dummyLiveSessions.find(s => s.id === sessionId);
    if (cancelledSession) {
      return {
        data: { ...cancelledSession, status: LiveSessionStatus.CANCELLED },
        isMockData: true,
      };
    }
    return { data: null, isMockData: true };
  }
};

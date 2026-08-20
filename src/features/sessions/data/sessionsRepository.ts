import { SessionsDashboard, SessionApiResponse, Session, Earnings, SessionsStats, SessionStatus, SessionType } from '../domain/types';
import { sessionsApi } from '../../../services/api/sessionHistory/sessions.service';
// import { earningsApi } from '../../../services/api/earning/earnings.service';

const mapSessionStatus = (status: string): SessionStatus => {
  switch (status?.toUpperCase()) {
    case 'ONGOING':
      return SessionStatus.ACTIVE;
    case 'COMPLETED':
      return SessionStatus.COMPLETED;
    case 'CANCELLED':
    case 'MISSED':
      return SessionStatus.CANCELLED;
    case 'PENDING':
      return SessionStatus.PENDING;
    default:
      return SessionStatus.PENDING;
  }
};

const mapSessionType = (type: string): SessionType => {
  switch (type?.toUpperCase()) {
    case 'CALL':
      return SessionType.CALL;
    case 'CHAT':
      return SessionType.CHAT;
    case 'VIDEO':
      return SessionType.VIDEO;
    default:
      return SessionType.CHAT;
  }
};

const mapSessionToDomain = (apiSession: any): Session => ({
  id: apiSession.sessionId || apiSession.id,
  userId: apiSession.userId,
  userName: apiSession.userName?.trim() || 'Unknown',
  userPhone: apiSession.userMobile 
    ? `${apiSession.userCountryCode || ''} ${apiSession.userMobile}` 
    : undefined,
  type: mapSessionType(apiSession.sessionType),
  status: mapSessionStatus(apiSession.status),
  startTime: apiSession.startedAt || apiSession.createdAt,
  endTime: apiSession.endedAt || undefined,
  duration: apiSession.durationSec || apiSession.durationMinutes || 0,
  durationMinutes: apiSession.durationMinutes || 0,
  durationSec: apiSession.durationSec || 0,
  earnings: apiSession.coinsEarned || apiSession.earnings || 0,
  commission:
    apiSession.commission != null ? apiSession.commission : null,
  rating: apiSession.rating || undefined,
  isLive: apiSession.status === 'ONGOING',
});

export const sessionsRepository = {
  getSessions: async (): Promise<SessionApiResponse<SessionsDashboard>> => {
    try {
      const [sessionsResponse] = await Promise.all([
        sessionsApi.getAstrologerSessions({ page: 1, limit: 50 }),
        // earningsApi.getAstrologerEarnings().catch(() => null),
      ]);
      // const [sessionsResponse, earningsResponse] = await Promise.all([
      //   sessionsApi.getAstrologerSessions({ page: 1, limit: 50 }),
      //   earningsApi.getAstrologerEarnings().catch(() => null),
      // ]);

      const apiSessions = sessionsResponse?.getAstrologerSessions?.data || [];
      const sessions = apiSessions.map(mapSessionToDomain);

      const activeSession = sessions.find(s => s.status === SessionStatus.ACTIVE) || null;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

      const completedSessions = sessions.filter(s => s.status === SessionStatus.COMPLETED);
      
      const earnings: Earnings = {
        today: completedSessions
          .filter(s => new Date(s.startTime) >= todayStart)
          .reduce((sum, s) => sum + s.earnings, 0),
        weekly: completedSessions
          .filter(s => new Date(s.startTime) >= weekAgo)
          .reduce((sum, s) => sum + s.earnings, 0),
        monthly: completedSessions
          .filter(s => new Date(s.startTime) >= monthAgo)
          .reduce((sum, s) => sum + s.earnings, 0),
        total: completedSessions.reduce((sum, s) => sum + s.earnings, 0),
        pendingPayout: 0,
      };

      const stats: SessionsStats = {
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => s.status === SessionStatus.ACTIVE).length,
        pendingSessions: sessions.filter(s => s.status === SessionStatus.PENDING).length,
        completedSessions: sessions.filter(s => s.status === SessionStatus.COMPLETED).length,
        cancelledSessions: sessions.filter(s => s.status === SessionStatus.CANCELLED).length,
      };

      return {
        data: {
          sessions,
          earnings,
          stats,
          activeSession,
        },
        isMockData: false,
      };
    } catch (error) {
      console.error('Sessions API error:', error);
      throw error;
    }
  },

  refreshSessions: async (): Promise<SessionApiResponse<SessionsDashboard>> => {
    return sessionsRepository.getSessions();
  },
};
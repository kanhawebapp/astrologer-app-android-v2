import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Session,
  SessionsDashboard,
  SessionApiResponse,
  FilterType,
  SessionTypeFilter,
  SessionStatus,
  SessionType,
  SessionsStats,
  Earnings,
} from '../../domain/types';
import { sessionsRepository } from '../../data/sessionsRepository';
import { getFilteredSessions } from '../../data/dummySessionsData';
import { sessionsApi } from '../../../../services/api/sessionHistory/sessions.service';
import { GetAstrologerSessionsResponse, AstrologerSession } from '../../../../services/api/sessionHistory/sessions.types';

interface UseSessionsReturn {
  sessions: Session[];
  filteredSessions: Session[];
  activeSession: Session | null;
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  activeSessionType: SessionTypeFilter;
  setActiveSessionType: (type: SessionTypeFilter) => void;
  isLoading: boolean;
  isMockData: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  handleSessionPress: (session: Session) => void;
  selectedSession: Session | null;
  setSelectedSession: (session: Session | null) => void;
  earningsToday: number;
  earningsWeekly: number;
  earningsMonthly: number;
  earningsTotal: number;
  earningsPendingPayout: number;
  stats: {
    totalSessions: number;
    activeSessions: number;
    pendingSessions: number;
    completedSessions: number;
    missedSessions: number;
  };
}

export const useSessions = (): UseSessionsReturn => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [earnings, setEarnings] = useState({
    today: 0,
    weekly: 0,
    monthly: 0,
    total: 0,
    pendingPayout: 0,
  });
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    pendingSessions: 0,
    completedSessions: 0,
    missedSessions: 0,
  });

  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.ALL);
  const [activeSessionType, setActiveSessionType] = useState<SessionTypeFilter>(
    SessionTypeFilter.ALL,
  );

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isMockData, setIsMockData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Try to get data from API first
      const apiResponse = await sessionsApi.getAstrologerSessions({
        page: 1,
        limit: 10,
      });

      const sessionsData = apiResponse.getAstrologerSessions;
      // console.log("checking session data", sessionsData)

      if (sessionsData?.success) {
        // Transform API response to match our expected format
        const transformedSessions: Session[] = (sessionsData.data || []).map((item: AstrologerSession) => ({
          id: item.sessionId,
          userId: item.userId,
          userName: item.userName.trim(),
          userPhone: `${item.userCountryCode} ${item.userMobile}`,
          type: item.sessionType === 'CALL' ? SessionType.CALL : SessionType.CHAT,
          status:
            item.status === 'ONGOING'
              ? SessionStatus.ACTIVE
              : item.status === 'COMPLETED'
                ? SessionStatus.COMPLETED
                : item.status === 'MISSED'
                  ? SessionStatus.MISSED
                  : SessionStatus.ACTIVE,
          startTime: item.startedAt,
          endTime: item.endedAt || undefined,
          duration: item.durationSec,
          durationMinutes: item.durationMinutes,
          durationSec: item.durationSec,
          earnings: item.coinsEarned,
          rating: item.rating ?? undefined,
          isLive: item.status === 'ONGOING',
          orderId: undefined,
          notes: undefined,
          chatId: item.chatId
        }));

        // Calculate earnings from sessions
        const calculateEarningsFromSessions = (sessions: Session[], filter: 'today' | 'weekly' | 'monthly' | 'total'): number => {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

          return sessions
            .filter(s => {
              if (s.status !== SessionStatus.COMPLETED) return false;
              const sessionDate = new Date(s.startTime);

              switch (filter) {
                case 'today':
                  return sessionDate >= today;
                case 'weekly': {
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  return sessionDate >= weekAgo;
                }
                case 'monthly': {
                  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                  return sessionDate >= monthAgo;
                }
                case 'total':
                  return true;
                default:
                  return true;
              }
            })
            .reduce((sum, s) => sum + s.earnings, 0);
        };

        const earningsToday = calculateEarningsFromSessions(transformedSessions, 'today');
        const earningsWeekly = calculateEarningsFromSessions(transformedSessions, 'weekly');
        const earningsMonthly = calculateEarningsFromSessions(transformedSessions, 'monthly');
        const earningsTotal = calculateEarningsFromSessions(transformedSessions, 'total');

        // Find active session
        const activeSession = transformedSessions.find(s => s.status === SessionStatus.ACTIVE) || null;

        // Calculate stats
        const stats: SessionsStats = {
          totalSessions: transformedSessions.length,
          activeSessions: transformedSessions.filter(s => s.status === SessionStatus.ACTIVE).length,
          pendingSessions: transformedSessions.filter(s => s.status === SessionStatus.PENDING).length,
          completedSessions: transformedSessions.filter(s => s.status === SessionStatus.COMPLETED).length,
          missedSessions: transformedSessions.filter(s => s.status === SessionStatus.MISSED).length,
        };

        setSessions(transformedSessions);
        setActiveSession(activeSession);
        setEarnings({
          today: earningsToday,
          weekly: earningsWeekly,
          monthly: earningsMonthly,
          total: earningsTotal,
          pendingPayout: 0, // This would need to come from a separate earnings API
        });
        setStats(stats);
        setIsMockData(false);
      } else {
        // Fallback to repository (which will use mock data)
        const response: SessionApiResponse<SessionsDashboard> =
          await sessionsRepository.getSessions();

        setSessions(response.data.sessions);
        setActiveSession(response.data.activeSession);
        setEarnings(response.data.earnings);
        setStats(response.data.stats);
        setIsMockData(response.isMockData);
      }
    } catch (err) {
      setError('Failed to load sessions');
      console.log('Sessions error:', err);

      // Fallback to repository on error
      try {
        const response: SessionApiResponse<SessionsDashboard> =
          await sessionsRepository.getSessions();

        setSessions(response.data.sessions);
        setActiveSession(response.data.activeSession);
        setEarnings(response.data.earnings);
        setStats(response.data.stats);
        setIsMockData(response.isMockData);
      } catch (fallbackErr) {
        console.log('Fallback also failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchSessions(true);
  }, [fetchSessions]);

  const filteredSessions = useMemo(() => {
    return getFilteredSessions(sessions, activeFilter, activeSessionType);
  }, [sessions, activeFilter, activeSessionType]);

  const handleSessionPress = useCallback((session: Session) => {
    setSelectedSession(session);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     if (!isLoading) {
  //       fetchSessions(true);
  //     }
  //   }, 30000);

  //   return () => clearInterval(intervalId);
  // }, [fetchSessions, isLoading]);

  return {
    sessions,
    filteredSessions,
    activeSession,
    activeFilter,
    setActiveFilter,
    activeSessionType,
    setActiveSessionType,
    isLoading,
    isMockData,
    refreshing,
    error,
    refresh,
    handleSessionPress,
    selectedSession,
    setSelectedSession,
    earningsToday: earnings.today,
    earningsWeekly: earnings.weekly,
    earningsMonthly: earnings.monthly,
    earningsTotal: earnings.total,
    earningsPendingPayout: earnings.pendingPayout,
    stats,
  };
};

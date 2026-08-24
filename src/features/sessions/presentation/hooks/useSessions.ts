import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Session,
  SessionsDashboard,
  SessionApiResponse,
  FilterType,
  SessionTypeFilter,
  SessionStatus,
  SessionType,
  SessionsStats,
} from '../../domain/types';
import { sessionsRepository } from '../../data/sessionsRepository';
import { getFilteredSessions } from '../../data/dummySessionsData';
import { sessionsApi } from '../../../../services/api/sessionHistory/sessions.service';
import { AstrologerSession } from '../../../../services/api/sessionHistory/sessions.types';

const PAGE_LIMIT = 10;

const mapApiStatus = (status: string): SessionStatus => {
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

const transformApiSessions = (data: AstrologerSession[]): Session[] =>
  (data || []).map((item: AstrologerSession, index: number) => {
    // Prefer sessionId; fall back so FlatList keys / dedupe never collapse on undefined
    const rawId = item.sessionId ?? (item as any).id ?? item.chatId;
    const id =
      rawId != null && String(rawId).length > 0
        ? String(rawId)
        : `session-${item.userId ?? 'u'}-${item.startedAt ?? index}-${index}`;

    return {
      id,
      userId: item.userId,
      userName: (item.userName || '').trim(),
      userPhone: `${item.userCountryCode} ${item.userMobile}`,
      type: item.sessionType === 'CALL' ? SessionType.CALL : SessionType.CHAT,
      status: mapApiStatus(item.status),
      startTime: item.startedAt,
      endTime: item.endedAt || undefined,
      duration: item.durationSec,
      durationMinutes: item.durationMinutes,
      durationSec: item.durationSec,
      earnings: item.coinsEarned,
      commission: item.commission != null ? item.commission : null,
      rating: item.rating ?? undefined,
      isLive: item.status === 'ONGOING',
      orderId: undefined,
      notes: undefined,
      chatId: item.chatId,
      birthDate: item.birthDate,
      birthPlace: item.birthPlace,
      birthTime: item.birthTime,
      ratePerMin: item.ratePerMin,
      reviewComment: item.reviewComment,
    };
  });

interface UseSessionsReturn {
  sessions: Session[];
  filteredSessions: Session[];
  activeSession: Session | null;
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  activeSessionType: SessionTypeFilter;
  setActiveSessionType: (type: SessionTypeFilter) => void;
  isLoading: boolean;
  isLoadingMore: boolean;
  isMockData: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => void;
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
    cancelledSessions: number;
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
    cancelledSessions: 0,
  });

  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.ALL);
  const [activeSessionType, setActiveSessionType] = useState<SessionTypeFilter>(
    SessionTypeFilter.ALL,
  );

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMockData, setIsMockData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPageRef = useRef(1);
  const totalPagesRef = useRef(1);
  const totalCountRef = useRef(0);
  const isLoadingMoreRef = useRef(false);
  const isLoadingRef = useRef(true);
  const refreshingRef = useRef(false);
  const isMockDataRef = useRef(false);
  // Ignore stale initial-fetch responses so they cannot wipe paginated state
  const fetchGenerationRef = useRef(0);
  // Mount effect must start page=1 only once
  const hasInitialFetchRef = useRef(false);

  const updatePaginationFromResponse = (
    currentPage: unknown,
    totalPages: unknown,
    totalCount: unknown,
    fallbackPage?: number,
  ) => {
    const page = Number(currentPage);
    const pages = Number(totalPages);
    const count = Number(totalCount);

    currentPageRef.current =
      Number.isFinite(page) && page > 0
        ? page
        : fallbackPage ?? currentPageRef.current;

    if (Number.isFinite(count) && count >= 0) {
      totalCountRef.current = count;
    }

    if (Number.isFinite(pages) && pages > 0) {
      totalPagesRef.current = pages;
    } else if (totalCountRef.current > 0) {
      totalPagesRef.current = Math.max(
        1,
        Math.ceil(totalCountRef.current / PAGE_LIMIT),
      );
    }
  };

  const fetchSessions = useCallback(async (showRefreshing = false) => {
    // Block late/duplicate initial page=1 BEFORE the network call once
    // the user has already paginated past page 1.
    if (
      !showRefreshing &&
      (currentPageRef.current > 1 || isLoadingMoreRef.current)
    ) {
      return;
    }

    const fetchGeneration = ++fetchGenerationRef.current;

    try {
      if (showRefreshing) {
        refreshingRef.current = true;
        setRefreshing(true);
      } else {
        isLoadingRef.current = true;
        setIsLoading(true);
      }
      setError(null);

      // Try to get data from API first
      const apiResponse = await sessionsApi.getAstrologerSessions({
        page: 1,
        limit: PAGE_LIMIT,
      });
// console.log('🚀 fetchSessions API response', apiResponse.getAstrologerSessions.data);
      // Stale response — a newer fetch/refresh already started
      if (fetchGeneration !== fetchGenerationRef.current) {
        console.log('⚠️ Ignoring stale fetchSessions response', {
          fetchGeneration,
          current: fetchGenerationRef.current,
        });
        return;
      }

      // Safety: do not wipe accumulated pages if pagination advanced during await
      if (!showRefreshing && currentPageRef.current > 1) {
        console.log('⚠️ Ignoring fetchSessions overwrite — pagination already active', {
          currentPage: currentPageRef.current,
        });
        return;
      }

      const sessionsData = apiResponse.getAstrologerSessions;
      // console.log("checking session data", sessionsData)

      if (sessionsData?.success) {
        const transformedSessions = transformApiSessions(sessionsData.data);

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
          totalSessions: sessionsData.totalCount ?? transformedSessions.length,
          activeSessions: transformedSessions.filter(s => s.status === SessionStatus.ACTIVE).length,
          pendingSessions: transformedSessions.filter(s => s.status === SessionStatus.PENDING).length,
          completedSessions: transformedSessions.filter(s => s.status === SessionStatus.COMPLETED).length,
          cancelledSessions: transformedSessions.filter(s => s.status === SessionStatus.CANCELLED).length,
        };

        updatePaginationFromResponse(
          sessionsData.currentPage,
          sessionsData.totalPages,
          sessionsData.totalCount,
          1,
        );

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
        isMockDataRef.current = false;
      } else {
        // Fallback to repository (which will use mock data)
        const response: SessionApiResponse<SessionsDashboard> =
          await sessionsRepository.getSessions();

        if (fetchGeneration !== fetchGenerationRef.current) {
          return;
        }

        currentPageRef.current = 1;
        totalPagesRef.current = 1;
        totalCountRef.current = response.data.sessions.length;
        setSessions(response.data.sessions);
        setActiveSession(response.data.activeSession);
        setEarnings(response.data.earnings);
        setStats(response.data.stats);
        setIsMockData(response.isMockData);
        isMockDataRef.current = response.isMockData;
      }
    } catch (err) {
      setError('Failed to load sessions');
      console.log('Sessions error:', err);

      // Fallback to repository on error
      try {
        const response: SessionApiResponse<SessionsDashboard> =
          await sessionsRepository.getSessions();

        if (fetchGeneration !== fetchGenerationRef.current) {
          return;
        }

        currentPageRef.current = 1;
        totalPagesRef.current = 1;
        totalCountRef.current = response.data.sessions.length;
        setSessions(response.data.sessions);
        setActiveSession(response.data.activeSession);
        setEarnings(response.data.earnings);
        setStats(response.data.stats);
        setIsMockData(response.isMockData);
        isMockDataRef.current = response.isMockData;
      } catch (fallbackErr) {
        console.log('Fallback also failed:', fallbackErr);
      }
    } finally {
      if (fetchGeneration === fetchGenerationRef.current) {
        isLoadingRef.current = false;
        refreshingRef.current = false;
        setIsLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const loadMore = useCallback(async () => {
    // Synchronous lock — must run before any await
    if (isLoadingMoreRef.current) {
      console.log('⛔ LOAD MORE BLOCKED: request already running');
      return;
    }

    if (isLoadingRef.current) {
      console.log('⛔ LOAD MORE BLOCKED: initial loading');
      return;
    }

    if (refreshingRef.current) {
      console.log('⛔ LOAD MORE BLOCKED: refreshing');
      return;
    }

    if (isMockDataRef.current) {
      console.log('⛔ LOAD MORE BLOCKED: mock data');
      return;
    }

    const currentPage = Number(currentPageRef.current) || 1;
    const totalPages = Number(totalPagesRef.current) || 1;

    if (currentPage >= totalPages) {
      console.log('⛔ LOAD MORE BLOCKED: no more pages', {
        currentPage,
        totalPages,
      });
      return;
    }

    // Lock BEFORE the API request so concurrent scroll events cannot race in
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    const nextPage = currentPage + 1;
    console.log('🚀 PAGINATION', {
      currentPage,
      nextPage,
      totalPages,
      isLoadingMore: true,
    });

    try {
      const apiResponse = await sessionsApi.getAstrologerSessions({
        page: nextPage,
        limit: PAGE_LIMIT,
      });

      const sessionsData = apiResponse.getAstrologerSessions;

      if (!sessionsData?.success) {
        console.log('❌ Page request failed:', nextPage);
        return;
      }

      const newSessions = transformApiSessions(sessionsData.data || []);

      setSessions(prev => {
        const existingIds = new Set(prev.map(session => session.id));
        const uniqueNewSessions = newSessions.filter(
          session => !existingIds.has(session.id),
        );
        return [...prev, ...uniqueNewSessions];
      });

      updatePaginationFromResponse(
        nextPage,
        sessionsData.totalPages,
        sessionsData.totalCount,
        nextPage,
      );

      if (sessionsData.totalCount != null) {
        // Keep same stats reference when totalCount is unchanged so
        // SessionsScreen ListHeaderComponent does not remount mid-scroll.
        setStats(prev =>
          prev.totalSessions === sessionsData.totalCount
            ? prev
            : { ...prev, totalSessions: sessionsData.totalCount },
        );
      }
    } catch (err) {
      console.log('❌ Load more sessions error:', {
        page: nextPage,
        error: err,
      });
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    currentPageRef.current = 1;
    await fetchSessions(true);
  }, [fetchSessions]);

  const filteredSessions = useMemo(() => {
    return getFilteredSessions(sessions, activeFilter, activeSessionType);
  }, [sessions, activeFilter, activeSessionType]);

  const handleSessionPress = useCallback((session: Session) => {
    setSelectedSession(session);
  }, []);

  useEffect(() => {
    if (hasInitialFetchRef.current) {
      return;
    }
    hasInitialFetchRef.current = true;
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    filteredSessions,
    activeSession,
    activeFilter,
    setActiveFilter,
    activeSessionType,
    setActiveSessionType,
    isLoading,
    isLoadingMore,
    isMockData,
    refreshing,
    error,
    refresh,
    loadMore,
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

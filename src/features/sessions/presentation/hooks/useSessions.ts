import {useState, useCallback, useEffect, useMemo, useRef} from 'react';
import {
  Session,
  FilterType,
  SessionTypeFilter,
  SessionType,
  SessionStatus,
} from '../../domain/types';
import {sessionsApi} from '../../../../services/api/sessionHistory/sessions.service';
import {AstrologerSession} from '../../../../services/api/sessionHistory/sessions.types';

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

interface TabData {
  sessions: Session[];
  page: number;
  totalPages: number;
  totalCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  refreshing: boolean;
  error: string | null;
  loaded: boolean;
}

const createEmptyTab = (): TabData => ({
  sessions: [],
  page: 0,
  totalPages: 1,
  totalCount: 0,
  isLoading: false,
  isLoadingMore: false,
  refreshing: false,
  error: null,
  loaded: false,
});

const getTabKey = (
  sessionType: SessionTypeFilter,
  filter: FilterType,
): string => `${sessionType}:${filter}`;

const buildApiFilter = (
  sessionType: SessionTypeFilter,
  page: number,
): {page: number; limit: number; sessionType?: string} => {
  const filter: {page: number; limit: number; sessionType?: string} = {
    page,
    limit: PAGE_LIMIT,
  };
  if (sessionType === SessionTypeFilter.CHAT) {
    filter.sessionType = 'CHAT';
  } else if (sessionType === SessionTypeFilter.CALL) {
    filter.sessionType = 'CALL';
  }
  return filter;
};

// Safety filter so displayed data always matches the selected tab, independent
// of how the server applies the request filter.
const matchesTab = (
  session: Session,
  sessionType: SessionTypeFilter,
  filter: FilterType,
): boolean => {
  if (sessionType !== SessionTypeFilter.ALL && session.type !== sessionType) {
    return false;
  }
  if (filter === FilterType.COMPLETED) {
    return session.status === SessionStatus.COMPLETED;
  }
  if (filter === FilterType.CANCELLED) {
    return session.status === SessionStatus.CANCELLED;
  }
  return true;
};

const dedupeById = (sessions: Session[]): Session[] => {
  const seen = new Set<string>();
  const result: Session[] = [];
  for (const session of sessions) {
    if (session.id && seen.has(session.id)) {
      continue;
    }
    if (session.id) {
      seen.add(session.id);
    }
    result.push(session);
  }
  return result;
};

export const useSessions = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.ALL);
  const [activeSessionType, setActiveSessionType] = useState<SessionTypeFilter>(
    SessionTypeFilter.ALL,
  );
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const [sessionsByTab, setSessionsByTab] = useState<Record<string, TabData>>(
    {},
  );

  // Mirror of `sessionsByTab` for synchronous reads inside async callbacks.
  const tabDataRef = useRef<Record<string, TabData>>({});
  // Monotonic request counter per tab to drop stale responses.
  const latestReqByTab = useRef<Record<string, number>>({});
  const reqCounter = useRef(0);

  const setTabState = useCallback(
    (
      key: string,
      patch: Partial<TabData> | ((prev: TabData) => Partial<TabData>),
    ) => {
      setSessionsByTab(prev => {
        const current = prev[key] || createEmptyTab();
        const next = typeof patch === 'function' ? patch(current) : patch;
        const updated = {...current, ...next};
        tabDataRef.current = {...prev, [key]: updated};
        return tabDataRef.current;
      });
    },
    [],
  );

  const fetchTab = useCallback(
    async (sessionType: SessionTypeFilter, filter: FilterType) => {
      const key = getTabKey(sessionType, filter);
      const myReq = ++reqCounter.current;
      latestReqByTab.current[key] = myReq;

      setTabState(key, {isLoading: true, error: null});

      try {
        const response = await sessionsApi.getAstrologerSessions(
          buildApiFilter(sessionType, 1),
        );
        const payload = response?.getAstrologerSessions;

        // Stale response — a newer request for this tab has started.
        if (latestReqByTab.current[key] !== myReq) {
          return;
        }

        if (!payload?.success) {
          throw new Error('Request failed');
        }

        const transformed = transformApiSessions(payload.data).filter(session =>
          matchesTab(session, sessionType, filter),
        );

        setTabState(key, {
          sessions: dedupeById(transformed),
          page: Number(payload.currentPage) || 1,
          totalPages: Number(payload.totalPages) || 1,
          totalCount: Number(payload.totalCount) || 0,
          isLoading: false,
          loaded: true,
          error: null,
        });
      } catch (err) {
        if (latestReqByTab.current[key] !== myReq) {
          return;
        }
        setTabState(key, {
          isLoading: false,
          error: 'Failed to load sessions',
        });
      }
    },
    [setTabState],
  );

  const refresh = useCallback(async () => {
    const key = getTabKey(activeSessionType, activeFilter);
    const myReq = ++reqCounter.current;
    latestReqByTab.current[key] = myReq;

    setTabState(key, {refreshing: true, error: null});

    try {
      const response = await sessionsApi.getAstrologerSessions(
        buildApiFilter(activeSessionType, 1),
      );
      const payload = response?.getAstrologerSessions;

      if (latestReqByTab.current[key] !== myReq) {
        return;
      }

      if (!payload?.success) {
        throw new Error('Request failed');
      }

      const transformed = transformApiSessions(payload.data).filter(session =>
        matchesTab(session, activeSessionType, activeFilter),
      );

      setTabState(key, {
        sessions: dedupeById(transformed),
        page: Number(payload.currentPage) || 1,
        totalPages: Number(payload.totalPages) || 1,
        totalCount: Number(payload.totalCount) || 0,
        refreshing: false,
        loaded: true,
        error: null,
      });
    } catch (err) {
      if (latestReqByTab.current[key] !== myReq) {
        return;
      }
      setTabState(key, {refreshing: false, error: 'Failed to refresh'});
    }
  }, [activeSessionType, activeFilter, setTabState]);

  const loadMore = useCallback(() => {
    const key = getTabKey(activeSessionType, activeFilter);
    const current = tabDataRef.current[key] || createEmptyTab();

    // Only one pagination request may run at a time.
    if (
      current.isLoading ||
      current.isLoadingMore ||
      current.refreshing ||
      current.page >= current.totalPages
    ) {
      return;
    }

    const nextPage = current.page + 1;
    const myReq = ++reqCounter.current;
    latestReqByTab.current[key] = myReq;

    setTabState(key, {isLoadingMore: true});

    (async () => {
      try {
        const response = await sessionsApi.getAstrologerSessions(
          buildApiFilter(activeSessionType, nextPage),
        );
        const payload = response?.getAstrologerSessions;

        if (latestReqByTab.current[key] !== myReq) {
          return;
        }

        if (!payload?.success) {
          throw new Error('Request failed');
        }

        const transformed = transformApiSessions(payload.data).filter(session =>
          matchesTab(session, activeSessionType, activeFilter),
        );

        setTabState(key, prev => ({
          sessions: dedupeById([...prev.sessions, ...transformed]),
          page: Number(payload.currentPage) || nextPage,
          totalPages: Number(payload.totalPages) || prev.totalPages,
          totalCount: Number(payload.totalCount) || prev.totalCount,
          isLoadingMore: false,
        }));
      } catch (err) {
        if (latestReqByTab.current[key] !== myReq) {
          return;
        }
        setTabState(key, {isLoadingMore: false});
      }
    })();
  }, [activeSessionType, activeFilter, setTabState]);

  // Refetch whenever the selected tab changes (reset to page 1).
  useEffect(() => {
    fetchTab(activeSessionType, activeFilter);
  }, [activeSessionType, activeFilter, fetchTab]);

  const currentKey = getTabKey(activeSessionType, activeFilter);
  const current = sessionsByTab[currentKey] || createEmptyTab();

  const filteredSessions = current.sessions;

  const stats = useMemo(
    () => ({
      totalSessions: current.totalCount,
      activeSessions: 0,
      pendingSessions: 0,
      completedSessions: 0,
      cancelledSessions: 0,
    }),
    [current.totalCount],
  );

  return {
    sessions: filteredSessions,
    filteredSessions,
    activeFilter,
    setActiveFilter,
    activeSessionType,
    setActiveSessionType,
    isLoading: current.isLoading,
    isLoadingMore: current.isLoadingMore,
    refreshing: current.refreshing,
    error: current.error,
    refresh,
    loadMore,
    selectedSession,
    setSelectedSession,
    earningsToday: 0,
    earningsWeekly: 0,
    earningsMonthly: 0,
    earningsTotal: 0,
    earningsPendingPayout: 0,
    stats,
  };
};

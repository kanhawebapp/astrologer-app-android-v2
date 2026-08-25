import {useState, useCallback, useEffect, useMemo} from 'react';
import {Session, SessionStatus, SessionType} from '../../domain/types';
import {callHistoryApi} from '../../../../services/api/callHistory/callHistory.service';
import {chatHistoryApi} from '../../../../services/api/chatHistory/chatHistory.service';
import {CallHistoryItem} from '../../../../services/api/callHistory/callHistory.types';
import {AstrologerChatHistoryItem} from '../../../../services/api/chatHistory/chatHistory.types';

const CALL_LIMIT = 10;
const CHAT_LIMIT = 12;
const MAX_AUTO_CHAT_PAGES = 5;

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

const mapCallItemToSession = (item: CallHistoryItem): Session => ({
  id: item.sessionId,
  userId: '',
  userName: item.userName || 'Unknown',
  userPhone: `${item.userCountryCode} ${item.userMobile}`.trim(),
  type: SessionType.CALL,
  status: mapApiStatus(item.status),
  startTime: item.startedAt || item.createdAt,
  endTime: item.endedAt || undefined,
  duration: item.durationSec || 0,
  durationMinutes: item.durationMinutes,
  durationSec: item.durationSec,
  earnings: item.coinsEarned,
  commission: item.commission,
  rating: undefined,
  isLive: false,
  source: item.source,
  ratePerMin: item.ratePerMin,
  coinsEarned: item.coinsEarned,
  roomId: item.roomId,
  userCountryCode: item.userCountryCode,
  userMobile: item.userMobile,
  lastMessage: item.lastMessage,
});

const mapChatItemToSession = (item: AstrologerChatHistoryItem): Session => ({
  id: item.sessionId,
  userId: '',
  userName: item.userName || 'Unknown',
  userPhone: undefined,
  type: SessionType.CHAT,
  status: mapApiStatus(item.status),
  startTime: item.createdAt,
  endTime: undefined,
  duration: (item.durationMinutes || 0) * 60,
  durationMinutes: item.durationMinutes,
  durationSec: 0,
  earnings: item.coinsEarned,
  commission: item.commission,
  rating: item.rating ?? undefined,
  isLive: false,
  source: item.source,
  ratePerMin: item.ratePerMin,
  coinsEarned: item.coinsEarned,
  roomId: item.roomId,
  birthPlace: item.birthPlace,
  reviewComment: item.reviewComment ?? undefined,
  chatId: item.sessionId,
});

export const useSessions = () => {
  const [activeType, setActiveType] = useState<'CALL' | 'CHAT'>('CALL');
  const [activeStatus, setActiveStatus] = useState<'COMPLETED' | 'CANCELLED'>(
    'COMPLETED',
  );

  const [sessions, setSessions] = useState<Session[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    setSessions([]);
    setLoaded(false);

    try {
      if (activeType === 'CALL') {
        const response = await callHistoryApi.getAstrologerCallHistory({
          page: 1,
          limit: CALL_LIMIT,
          status: activeStatus,
        });
        const payload = response?.getAstrologerCallHistory;
        if (!payload?.success) throw new Error('Failed to load call history');

        const mapped = (payload.data || []).map(mapCallItemToSession);
        setSessions(mapped);
        setTotalPages(payload.totalPages || 1);
        setTotalCount(payload.totalCount || 0);
        setHasMore((payload.currentPage || 1) < (payload.totalPages || 1));
      } else {
        let currentPage = 1;
        let allMapped: Session[] = [];
        let filtered: Session[] = [];
        let totalPages = 1;
        let totalCount = 0;

        while (currentPage <= MAX_AUTO_CHAT_PAGES) {
          const response = await chatHistoryApi.getAstrologerChatHistory({
            page: currentPage,
            limit: CHAT_LIMIT,
          });
          const payload = response?.getAstrologerChatHistory;
          if (!payload?.success) throw new Error('Failed to load chat history');

          const mapped = (payload.data || []).map(mapChatItemToSession);
          allMapped = [...allMapped, ...mapped];
          const statusFilter = activeStatus.toLowerCase() as SessionStatus;
          filtered = allMapped.filter(s => s.status === statusFilter);

          totalPages = payload.totalPages || 1;
          totalCount = payload.totalCount || 0;

          if (filtered.length > 0 || currentPage >= totalPages) {
            break;
          }
          currentPage++;
        }

        setSessions(filtered);
        setPage(currentPage);
        setTotalPages(totalPages);
        setTotalCount(totalCount);
        setHasMore(currentPage < totalPages);
      }
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
      setLoaded(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeType, activeStatus]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInitial();
  }, [fetchInitial]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || refreshing) return;
    const nextPage = page + 1;
    if (nextPage > totalPages) return;

    setLoadingMore(true);
    try {
      if (activeType === 'CALL') {
        const response = await callHistoryApi.getAstrologerCallHistory({
          page: nextPage,
          limit: CALL_LIMIT,
          status: activeStatus,
        });
        const payload = response?.getAstrologerCallHistory;
        if (!payload?.success) throw new Error('Failed to load more');

        const mapped = (payload.data || []).map(mapCallItemToSession);
        setSessions(prev => [...prev, ...mapped]);
        setTotalPages(payload.totalPages || totalPages);
        setTotalCount(payload.totalCount || totalCount);
        setPage(nextPage);
        setHasMore(nextPage < (payload.totalPages || totalPages));
      } else {
        const response = await chatHistoryApi.getAstrologerChatHistory({
          page: nextPage,
          limit: CHAT_LIMIT,
        });
        const payload = response?.getAstrologerChatHistory;
        if (!payload?.success) throw new Error('Failed to load more');

        const mapped = (payload.data || []).map(mapChatItemToSession);
        const statusFilter = activeStatus.toLowerCase() as SessionStatus;
        const filtered = mapped.filter(s => s.status === statusFilter);
        setSessions(prev => [...prev, ...filtered]);
        setTotalPages(payload.totalPages || totalPages);
        setTotalCount(payload.totalCount || totalCount);
        setPage(nextPage);
        setHasMore(nextPage < (payload.totalPages || totalPages));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  }, [
    activeType,
    activeStatus,
    page,
    totalPages,
    totalCount,
    loadingMore,
    loading,
    refreshing,
  ]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const stats = useMemo(
    () => ({
      totalSessions: totalCount,
      activeSessions: 0,
      pendingSessions: 0,
      completedSessions: 0,
      cancelledSessions: 0,
    }),
    [totalCount],
  );

  return {
    sessions,
    activeType,
    setActiveType,
    activeStatus,
    setActiveStatus,
    loading,
    loadingMore,
    refreshing,
    error,
    refresh,
    loadMore,
    hasMore,
    selectedSession,
    setSelectedSession,
    stats,
    loaded,
    totalCount,
  };
};

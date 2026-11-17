import {useCallback, useEffect, useRef, useState} from 'react';
import {liveHistoryApi} from '../../../../services/api/liveHistory/liveHistory.service';
import {
  LiveHistoryItem,
  LiveHistorySummary,
} from '../../../../services/api/liveHistory/liveHistory.types';
import {getErrorMessage} from '../../../../utils/helpers';

const PAGE_LIMIT = 10;

const EMPTY_SUMMARY: LiveHistorySummary = {
  totalCoinsCollected: 0,
  totalAstrologerEarnings: 0,
  totalAudioCalls: 0,
  totalVideoCalls: 0,
};

export const useLiveHistory = () => {
  const [items, setItems] = useState<LiveHistoryItem[]>([]);
  const [summary, setSummary] = useState<LiveHistorySummary>(EMPTY_SUMMARY);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingMoreRef = useRef(false);
  const pageRef = useRef(1);
  const totalPagesRef = useRef(1);

  const applySummary = useCallback(
    (payload: {
      totalCoinsCollected?: number | null;
      totalAstrologerEarnings?: number | null;
      totalAudioCalls?: number | null;
      totalVideoCalls?: number | null;
    }) => {
      setSummary({
        totalCoinsCollected: Number(payload.totalCoinsCollected ?? 0),
        totalAstrologerEarnings: Number(payload.totalAstrologerEarnings ?? 0),
        totalAudioCalls: Number(payload.totalAudioCalls ?? 0),
        totalVideoCalls: Number(payload.totalVideoCalls ?? 0),
      });
    },
    [],
  );

  const fetchPage = useCallback(
    async (pageToLoad: number, mode: 'initial' | 'refresh' | 'more') => {
      if (mode === 'more') {
        if (loadingMoreRef.current || pageToLoad > totalPagesRef.current) {
          return;
        }
        loadingMoreRef.current = true;
        setLoadingMore(true);
      } else if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await liveHistoryApi.getMyLiveInteractionHistory({
          searchInput: {
            limit: PAGE_LIMIT,
            page: pageToLoad,
          },
        });

        const payload = response?.getMyLiveInteractionHistory;
        if (!payload) {
          throw new Error('Failed to load live history');
        }

        const nextItems = Array.isArray(payload.data) ? payload.data : [];
        const nextTotalPages = Math.max(1, Number(payload.totalPages) || 1);
        const nextCurrentPage = Number(payload.currentPage) || pageToLoad;

        if (mode === 'more') {
          setItems(prev => [...prev, ...nextItems]);
        } else {
          setItems(nextItems);
        }

        applySummary(payload);
        setPage(nextCurrentPage);
        setTotalPages(nextTotalPages);
        pageRef.current = nextCurrentPage;
        totalPagesRef.current = nextTotalPages;
      } catch (err) {
        setError(getErrorMessage(err));
        if (mode !== 'more') {
          setItems([]);
        }
      } finally {
        if (mode === 'more') {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        } else if (mode === 'refresh') {
          setRefreshing(false);
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    },
    [applySummary],
  );

  const refresh = useCallback(async () => {
    pageRef.current = 1;
    totalPagesRef.current = 1;
    setPage(1);
    await fetchPage(1, 'refresh');
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || refreshing || loadingMoreRef.current) {
      return;
    }
    const nextPage = pageRef.current + 1;
    if (nextPage > totalPagesRef.current) {
      return;
    }
    fetchPage(nextPage, 'more');
  }, [fetchPage, loading, refreshing]);

  const retry = useCallback(() => {
    pageRef.current = 1;
    totalPagesRef.current = 1;
    setPage(1);
    fetchPage(1, 'initial');
  }, [fetchPage]);

  useEffect(() => {
    fetchPage(1, 'initial');
  }, [fetchPage]);

  return {
    items,
    summary,
    page,
    totalPages,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    retry,
    hasMore: page < totalPages,
  };
};

import {useState, useEffect, useCallback, useMemo} from 'react';
import {
  AnalyticsApiResponse,
  AstrologerAnalytics,
  FilterPeriod,
  SessionTypeFilter,
  DataTypeFilter,
} from '../../domain/types';
import {homeRepository} from '../../data/homeRepository';
import {useSelector} from 'react-redux';
import {RootState} from '../../../../store';

interface UseHomeAnalyticsReturn {
  analytics: AstrologerAnalytics | null;
  loading: boolean;
  error: string | null;
  isMockData: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  period: FilterPeriod;
  setPeriod: (period: FilterPeriod) => void;
  sessionType: SessionTypeFilter;
  setSessionType: (type: SessionTypeFilter) => void;
  dataType: DataTypeFilter;
  setDataType: (type: DataTypeFilter) => void;
  liveEarnings: number;
  activeSessionCount: number;
}

export const useHomeAnalytics = (): UseHomeAnalyticsReturn => {
  const [analytics, setAnalytics] = useState<AstrologerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<FilterPeriod>('7days');
  const [sessionType, setSessionType] = useState<SessionTypeFilter>('all');
  const [dataType, setDataType] = useState<DataTypeFilter>('earnings');

  const user = useSelector((state: RootState) => state.auth.user);

  const fetchAnalytics = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response: AnalyticsApiResponse =
          await homeRepository.getAnalytics(period, sessionType, user?.id);
        setAnalytics(response.data);
        setIsMockData(response.isMockData);
      } catch (err) {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period, sessionType, user?.id],
  );

  const handleSetPeriod = useCallback((newPeriod: FilterPeriod) => {
    setPeriod(newPeriod);
  }, []);

  const handleSetSessionType = useCallback((newType: SessionTypeFilter) => {
    setSessionType(newType);
  }, []);

  const handleSetDataType = useCallback((newType: DataTypeFilter) => {
    setDataType(newType);
  }, []);

  const refresh = useCallback(async () => {
    await fetchAnalytics(true);
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const liveEarnings = useMemo(() => {
    return 0;
  }, []);

  const activeSessionCount = useMemo(() => {
    return 0;
  }, []);

  return {
    analytics,
    loading,
    error,
    isMockData,
    refreshing,
    refresh,
    period,
    setPeriod: handleSetPeriod,
    sessionType,
    setSessionType: handleSetSessionType,
    dataType,
    setDataType: handleSetDataType,
    liveEarnings,
    activeSessionCount,
  };
};

import {useState, useEffect, useCallback} from 'react';
import {HomeDashboard, HomeApiResponse} from '../../domain/types';
import {homeRepository} from '../../data/homeRepository';

interface UseHomeReturn {
  dashboard: HomeDashboard | null;
  loading: boolean;
  error: string | null;
  isMockData: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  toggleLiveStatus: (isOnline: boolean) => Promise<void>;
}

export const useHome = (): UseHomeReturn => {
  const [dashboard, setDashboard] = useState<HomeDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response: HomeApiResponse = await homeRepository.getDashboard();
      setDashboard(response.data);
      setIsMockData(response.isMockData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.log('Home dashboard error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchDashboard(true);
  }, [fetchDashboard]);

  const toggleLiveStatus = useCallback(async (isOnline: boolean) => {
    try {
      const response = await homeRepository.updateLiveStatus(isOnline);
      setDashboard(response.data);
    } catch (err) {
      console.log('Failed to update live status:', err);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    isMockData,
    refreshing,
    refresh,
    toggleLiveStatus,
  };
};

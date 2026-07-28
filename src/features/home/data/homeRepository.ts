import {httpClient} from '../../../services/httpClient';
import {PaginatedResponse} from '../../../types';
import {
  HomeStats,
  HomeNotification,
  HomeDashboard,
  HomeApiResponse,
  AnalyticsApiResponse,
  FilterPeriod,
  SessionTypeFilter,
} from '../domain/types';
import {homeService} from './homeService';
import {analyticsApi} from '../../../services/api/analytics/analytics.service';

const getPeriodStartDate = (period: FilterPeriod): Date => {
  const now = new Date();
  switch (period) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case '7days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'custom':
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
};

const getPreviousPeriodStartDate = (period: FilterPeriod): Date => {
  const startDate = getPeriodStartDate(period);
  const prevStart = new Date(startDate);
  switch (period) {
    case 'today':
      prevStart.setDate(prevStart.getDate() - 1);
      break;
    case '7days':
      prevStart.setDate(prevStart.getDate() - 7);
      break;
    case '30days':
      prevStart.setDate(prevStart.getDate() - 30);
      break;
    case 'custom':
    default:
      prevStart.setDate(prevStart.getDate() - 7);
  }
  return prevStart;
};

export const homeRepository = {
  getDashboard: async (): Promise<HomeApiResponse> => {
    try {
      const response = await httpClient.get<HomeDashboard>('/home/dashboard');
      return {
        data: response.data,
        isMockData: false,
      };
    } catch (error) {
      console.warn('Dashboard API failed:', error);
      throw error;
    }
  },

  getAnalytics: async (
    period: FilterPeriod = '7days',
    sessionType: SessionTypeFilter = 'all',
    astrologerId?: string,
  ): Promise<AnalyticsApiResponse> => {
    try {
      const response = await analyticsApi.getAstrologerAnalytics({
        astrologerId: astrologerId || '',
      });
      return {
        data: response.getAstrologerAnalytics,
        isMockData: false,
      };
    } catch (error) {
      throw error;
    }
  },

  updateLiveStatus: async (isOnline: boolean): Promise<HomeApiResponse> => {
    const currentDashboard = await homeService.getDashboard();
    return {
      data: {
        ...currentDashboard.data,
        liveStatus: {...currentDashboard.data.liveStatus, isOnline},
        profile: {...currentDashboard.data.profile, isOnline},
      },
      isMockData: true,
    };
  },

  getStats: () => httpClient.get<HomeStats>('/home/stats'),

  getNotifications: (page = 1, limit = 20) =>
    httpClient.get<PaginatedResponse<HomeNotification>>(
      `/home/notifications?page=${page}&limit=${limit}`,
    ),

  markNotificationRead: (id: string) =>
    httpClient.patch<void>(`/home/notifications/${id}/read`),

  markAllRead: () => httpClient.post<void>('/home/notifications/read-all'),
};

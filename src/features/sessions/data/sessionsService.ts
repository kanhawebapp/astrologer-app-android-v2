import { SessionsDashboard, SessionApiResponse } from '../domain/types';
import { dummySessionsDashboard } from './dummySessionsData';

export const sessionsService = {
  getSessions: async (): Promise<SessionApiResponse<SessionsDashboard>> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: dummySessionsDashboard,
          isMockData: true,
        });
      }, 500);
    });
  },

  refreshSessions: async (): Promise<SessionApiResponse<SessionsDashboard>> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: dummySessionsDashboard,
          isMockData: true,
        });
      }, 300);
    });
  },
};

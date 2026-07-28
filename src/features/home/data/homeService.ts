import {httpClient} from '../../../services/httpClient';
import {HomeDashboard, HomeApiResponse} from '../domain/types';

export const homeService = {
  getDashboard: async (): Promise<HomeApiResponse> => {
    const response = await httpClient.get<HomeDashboard>('/home/dashboard');
    return {
      data: response.data,
      isMockData: false,
    };
  },
};

import { accountApi } from './accountService';
import { dummyDashboardData } from './dummyAccountData';
import { mapDashboard } from './accountMapper';
import {
  AccountDashboard,
  UpdateAvailabilityInput,
  UpdatePricingInput,
} from '../domain/types';
import { Config } from '../../../config/env';

let cachedDashboard: AccountDashboard | null = null;
let useMockData = false;

export const accountRepository = {
  getDashboard: async (): Promise<{
    dashboard: AccountDashboard;
    isMockData: boolean;
  }> => {
    const apiUrl = Config.API_BASE_URL;
    const hasApiUrl = !!apiUrl && apiUrl.length > 0;

    if (!hasApiUrl) {
      useMockData = true;
      return { dashboard: dummyDashboardData, isMockData: true };
    }

    try {
      const token = await getStoredToken();
      if (!token) {
        useMockData = true;
        return { dashboard: dummyDashboardData, isMockData: true };
      }

      const apiDashboard = await accountApi.getDashboard(token);
      const dashboard = mapDashboard(apiDashboard);
      cachedDashboard = dashboard;
      useMockData = false;
      return { dashboard, isMockData: false };
    } catch (error) {
      useMockData = true;
      return { dashboard: dummyDashboardData, isMockData: true };
    }
  },

  updateAvailability: async (
    input: UpdateAvailabilityInput,
  ): Promise<{ success: boolean; isMockData: boolean }> => {
    if (useMockData || !Config.API_BASE_URL) {
      if (cachedDashboard) {
        cachedDashboard.availability = {
          ...cachedDashboard.availability,
          ...input,
        };
      }
      return { success: true, isMockData: true };
    }

    try {
      const token = await getStoredToken();
      if (!token) {
        return { success: false, isMockData: true };
      }
      await accountApi.updateAvailability(token, input);
      if (cachedDashboard) {
        cachedDashboard.availability = {
          ...cachedDashboard.availability,
          ...input,
        };
      }
      return { success: true, isMockData: false };
    } catch (error) {
      if (cachedDashboard) {
        cachedDashboard.availability = {
          ...cachedDashboard.availability,
          ...input,
        };
      }
      return { success: true, isMockData: true };
    }
  },

  updatePricing: async (
    input: UpdatePricingInput,
  ): Promise<{ success: boolean; isMockData: boolean }> => {
    if (useMockData || !Config.API_BASE_URL) {
      if (cachedDashboard) {
        cachedDashboard.pricing = {
          ...cachedDashboard.pricing,
          ...input,
        };
      }
      return { success: true, isMockData: true };
    }

    try {
      const token = await getStoredToken();
      if (!token) {
        return { success: false, isMockData: true };
      }
      await accountApi.updatePricing(token, input);
      if (cachedDashboard) {
        cachedDashboard.pricing = {
          ...cachedDashboard.pricing,
          ...input,
        };
      }
      return { success: true, isMockData: false };
    } catch (error) {
      if (cachedDashboard) {
        cachedDashboard.pricing = {
          ...cachedDashboard.pricing,
          ...input,
        };
      }
      return { success: true, isMockData: true };
    }
  },

  updateProfile: async (input: {
    name?: string;
    about?: string;
    skills?: string[];
    languages?: string[];
    chatPricePerMinute?: number;
    callPricePerMinute?: number;
  }): Promise<{ success: boolean; isMockData: boolean }> => {
    if (useMockData || !Config.API_BASE_URL) {
      if (cachedDashboard) {
        if (input.name) cachedDashboard.profile.name = input.name;
        if (input.about) cachedDashboard.profile.about = input.about;
        if (input.skills) cachedDashboard.profile.skills = input.skills;
        if (input.languages)
          cachedDashboard.profile.languages = input.languages;
        if (input.chatPricePerMinute || input.callPricePerMinute) {
          cachedDashboard.pricing = {
            ...cachedDashboard.pricing,
            chatPricePerMinute:
              input.chatPricePerMinute ||
              cachedDashboard.pricing.chatPricePerMinute,
            callPricePerMinute:
              input.callPricePerMinute ||
              cachedDashboard.pricing.callPricePerMinute,
          };
        }
      }
      return { success: true, isMockData: true };
    }

    try {
      const token = await getStoredToken();
      if (!token) {
        return { success: false, isMockData: true };
      }
      await accountApi.updateProfile(token, input);
      if (cachedDashboard) {
        if (input.name) cachedDashboard.profile.name = input.name;
        if (input.about) cachedDashboard.profile.about = input.about;
        if (input.skills) cachedDashboard.profile.skills = input.skills;
        if (input.languages)
          cachedDashboard.profile.languages = input.languages;
        if (input.chatPricePerMinute || input.callPricePerMinute) {
          cachedDashboard.pricing = {
            ...cachedDashboard.pricing,
            chatPricePerMinute:
              input.chatPricePerMinute ||
              cachedDashboard.pricing.chatPricePerMinute,
            callPricePerMinute:
              input.callPricePerMinute ||
              cachedDashboard.pricing.callPricePerMinute,
          };
        }
      }
      return { success: true, isMockData: false };
    } catch (error) {
      if (cachedDashboard) {
        if (input.name) cachedDashboard.profile.name = input.name;
        if (input.about) cachedDashboard.profile.about = input.about;
        if (input.skills) cachedDashboard.profile.skills = input.skills;
        if (input.languages)
          cachedDashboard.profile.languages = input.languages;
      }
      return { success: true, isMockData: true };
    }
  },

  getCachedDashboard: (): AccountDashboard | null => {
    return cachedDashboard;
  },

  isUsingMockData: (): boolean => {
    return useMockData;
  },

  clearCache: (): void => {
    cachedDashboard = null;
    useMockData = false;
  },
};

async function getStoredToken(): Promise<string | null> {
  try {
    const AsyncStorage =
      require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem(Config.TOKEN_KEY);
    console.log('[ASYNCSTORAGE] Read token from Config.TOKEN_KEY:', token ? 'YES' : 'NO');
    if (token) {
      console.log(`[ASYNCSTORAGE] Token Preview: ${token.substring(0, 20)}...`);
    }
    return token;
  } catch {
    console.log('[ASYNCSTORAGE] Read token from Config.TOKEN_KEY: ERROR');
    return null;
  }
}
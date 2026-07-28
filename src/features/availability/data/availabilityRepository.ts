import {
  Availability,
  UpdateAvailabilityInput,
  AvailabilityResponse,
} from '../domain/types';
import {
  dummyAvailabilityData,
  getDefaultAvailability,
} from './dummyAvailabilityData';
import * as availabilityService from './availabilityService';

export interface AvailabilityResult {
  data: Availability;
  isMockData: boolean;
}

export const getAvailability = async (): Promise<AvailabilityResult> => {
  try {
    const response = await availabilityService.fetchAvailability();
    return { data: response.availability, isMockData: false };
  } catch (error) {
    console.log('[AvailabilityRepository] Using fallback dummy data:', error);
    return { data: getDefaultAvailability(), isMockData: true };
  }
};

export const updateAvailability = async (
  input: UpdateAvailabilityInput,
): Promise<AvailabilityResult> => {
  try {
    const response = await availabilityService.updateAvailability(input);
    return { data: response.availability, isMockData: false };
  } catch (error) {
    console.log(
      '[AvailabilityRepository] Update failed, using mock update:',
      error,
    );
    const updatedDummy = {
      ...dummyAvailabilityData,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return { data: updatedDummy, isMockData: true };
  }
};

export const toggleOnlineStatus = async (
  isOnline: boolean,
): Promise<AvailabilityResult> => {
  return updateAvailability({ isOnline });
};

export const toggleChat = async (
  chatEnabled: boolean,
): Promise<AvailabilityResult> => {
  return updateAvailability({ chatEnabled });
};

export const toggleCall = async (
  callEnabled: boolean,
): Promise<AvailabilityResult> => {
  return updateAvailability({ callEnabled });
};

export const toggleBusyMode = async (
  busyMode: boolean,
): Promise<AvailabilityResult> => {
  return updateAvailability({ busyMode });
};

export const toggleAutoAccept = async (
  autoAccept: boolean,
): Promise<AvailabilityResult> => {
  return updateAvailability({ autoAccept });
};

export const updateMaxSessions = async (
  maxSessions: number,
): Promise<AvailabilityResult> => {
  return updateAvailability({ maxSessions });
};

export const updateWorkingHours = async (workingHours: {
  start: string;
  end: string;
}): Promise<AvailabilityResult> => {
  return updateAvailability({ workingHours });
};

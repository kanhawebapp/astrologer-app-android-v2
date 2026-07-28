import {
  AvailabilityStatus,
  SessionMode,
  SessionType,
  WorkingDay,
} from './enums';

export interface WorkingHours {
  start: string;
  end: string;
}

export interface DaySchedule {
  day: WorkingDay;
  isAvailable: boolean;
  workingHours: WorkingHours;
}

export interface Availability {
  id: string;
  isOnline: boolean;
  chatEnabled: boolean;
  callEnabled: boolean;
  busyMode: boolean;
  autoAccept: boolean;
  maxSessions: number;
  currentSessions: number;
  status: AvailabilityStatus;
  mode: SessionMode;
  workingHours: WorkingHours;
  schedule: DaySchedule[];
  autoOfflineMinutes: number;
  doNotDisturbStart: string;
  doNotDisturbEnd: string;
  peakHourSuggestion: string | null;
  lowResponseWarning: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityState {
  availability: Availability;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  isMockData: boolean;
}

export interface UpdateAvailabilityInput {
  isOnline?: boolean;
  chatEnabled?: boolean;
  callEnabled?: boolean;
  busyMode?: boolean;
  autoAccept?: boolean;
  maxSessions?: number;
  workingHours?: WorkingHours;
}

export interface AvailabilityResponse {
  availability: Availability;
}

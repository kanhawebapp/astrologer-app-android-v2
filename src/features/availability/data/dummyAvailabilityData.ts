import { Availability } from '../domain/types';
import { AvailabilityStatus, SessionMode, WorkingDay } from '../domain/enums';

export const dummyAvailabilityData: Availability = {
  id: 'astrologer-001',
  isOnline: true,
  chatEnabled: true,
  callEnabled: false,
  busyMode: false,
  autoAccept: true,
  maxSessions: 3,
  currentSessions: 1,
  status: AvailabilityStatus.ONLINE,
  mode: SessionMode.AUTO,
  workingHours: {
    start: '10:00',
    end: '20:00',
  },
  schedule: [
    {
      day: WorkingDay.MONDAY,
      isAvailable: true,
      workingHours: { start: '10:00', end: '20:00' },
    },
    {
      day: WorkingDay.TUESDAY,
      isAvailable: true,
      workingHours: { start: '10:00', end: '20:00' },
    },
    {
      day: WorkingDay.WEDNESDAY,
      isAvailable: true,
      workingHours: { start: '10:00', end: '20:00' },
    },
    {
      day: WorkingDay.THURSDAY,
      isAvailable: true,
      workingHours: { start: '10:00', end: '20:00' },
    },
    {
      day: WorkingDay.FRIDAY,
      isAvailable: true,
      workingHours: { start: '10:00', end: '20:00' },
    },
    {
      day: WorkingDay.SATURDAY,
      isAvailable: false,
      workingHours: { start: '00:00', end: '00:00' },
    },
    {
      day: WorkingDay.SUNDAY,
      isAvailable: false,
      workingHours: { start: '00:00', end: '00:00' },
    },
  ],
  autoOfflineMinutes: 30,
  doNotDisturbStart: '22:00',
  doNotDisturbEnd: '06:00',
  peakHourSuggestion: 'Peak hours: 6PM - 9PM may have high demand',
  lowResponseWarning: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const getDefaultAvailability = (): Availability => ({
  ...dummyAvailabilityData,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

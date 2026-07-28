import { LiveSession, LiveSessionStatus } from '../domain/liveTypes';

export const createDefaultStats = () => ({
  viewers: 0,
  peakViewers: 0,
  likes: 0,
  comments: 0,
  gifts: 0,
  earnings: 0,
  duration: 0,
});

export const dummyLiveSessions: LiveSession[] = [
  {
    id: 'live-001',
    title: 'Daily Horoscope & Astrology Reading',
    description: 'Join me for daily predictions and personalized readings',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: LiveSessionStatus.SCHEDULED,
    stats: createDefaultStats(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'live-002',
    title: 'Weekend Special: Tarot & Numerology',
    description: 'Special weekend session with tarot cards and number readings',
    scheduledAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    status: LiveSessionStatus.SCHEDULED,
    stats: createDefaultStats(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'live-003',
    title: 'Career & Business Astrology',
    description: 'Guidance on career decisions and business investments',
    scheduledAt: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
    status: LiveSessionStatus.SCHEDULED,
    stats: createDefaultStats(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'live-004',
    title: 'Morning Astrology Q&A',
    scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000,
    ).toISOString(),
    status: LiveSessionStatus.COMPLETED,
    stats: {
      viewers: 127,
      peakViewers: 89,
      likes: 234,
      comments: 45,
      gifts: 12,
      earnings: 1850,
      duration: 45,
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const dummyCurrentLive: LiveSession = {
  id: 'live-current-001',
  title: 'Live Now: Astrology Q&A Session',
  description: 'Interactive session with live predictions',
  scheduledAt: new Date().toISOString(),
  startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  status: LiveSessionStatus.LIVE,
  stats: {
    viewers: 47,
    peakViewers: 62,
    likes: 156,
    comments: 28,
    gifts: 5,
    earnings: 720,
    duration: 15,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const getDefaultLiveSessions = (): LiveSession[] => [
  ...dummyLiveSessions,
];

export const getCurrentLiveSession = (): LiveSession | null => dummyCurrentLive;

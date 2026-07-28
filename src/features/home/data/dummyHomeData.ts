import {
  HomeDashboard,
  Session,
  Activity,
  QuickAction,
  AstrologerProfile,
  Earnings,
  HomeStats,
  LiveStatus,
} from '../domain/types';

export const dummyProfile: AstrologerProfile = {
  id: 'astrologer_001',
  name: 'Sarjeet kr Satyam',
  profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
  isOnline: true,
  rating: 4.8,
  responseRate: 98,
  totalSessions: 15420,
  languages: ['Hindi', 'English', 'Sanskrit'],
  specialties: ['Vedic Astrology', 'Palmistry', 'Vastu'],
};

export const dummyEarnings: Earnings = {
  today: 0,
  weekly: 0,
  monthly: 0,
  total: 40,
  pendingPayout: 0,
};

export const dummyStats: HomeStats = {
  active: 3,
  pending: 5,
  completed: 28,
};

export const dummyLiveStatus: LiveStatus = {
  isOnline: true,
  chatEnabled: true,
  callEnabled: true,
  videoEnabled: false,
};

export const dummySessions: Session[] = [
  {
    id: 'session_001',
    userId: 'user_001',
    userName: 'Amit Sharma',
    userImage: 'https://randomuser.me/api/portraits/men/11.jpg',
    type: 'chat',
    status: 'active',
    duration: 15,
    amount: 300,
    createdAt: '2026-04-13T16:30:00Z',
  },
  {
    id: 'session_002',
    userId: 'user_002',
    userName: 'Priya Singh',
    userImage: 'https://randomuser.me/api/portraits/women/22.jpg',
    type: 'call',
    status: 'pending',
    duration: 0,
    amount: 0,
    createdAt: '2026-04-13T16:35:00Z',
  },
  {
    id: 'session_003',
    userId: 'user_003',
    userName: 'Raj Kumar',
    userImage: 'https://randomuser.me/api/portraits/men/45.jpg',
    type: 'video',
    status: 'active',
    duration: 25,
    amount: 1200,
    createdAt: '2026-04-13T16:20:00Z',
  },
  {
    id: 'session_004',
    userId: 'user_004',
    userName: 'Sneha Reddy',
    userImage: 'https://randomuser.me/api/portraits/women/33.jpg',
    type: 'chat',
    status: 'completed',
    duration: 30,
    amount: 450,
    createdAt: '2026-04-13T15:45:00Z',
  },
  {
    id: 'session_005',
    userId: 'user_005',
    userName: 'Vikram Mehta',
    userImage: 'https://randomuser.me/api/portraits/men/55.jpg',
    type: 'call',
    status: 'completed',
    duration: 20,
    amount: 600,
    createdAt: '2026-04-13T14:30:00Z',
  },
];

export const dummyActivities: Activity[] = [
  {
    id: 'activity_001',
    type: 'session_booked',
    title: 'New Session Booked',
    description: 'Priya Singh booked a 30-min call session',
    timestamp: '2026-04-13T16:35:00Z',
    amount: 0,
  },
  {
    id: 'activity_002',
    type: 'payment_received',
    title: 'Payment Received',
    description: '₹450 received from Sneha Reddy',
    timestamp: '2026-04-13T16:20:00Z',
    amount: 450,
  },
  {
    id: 'activity_003',
    type: 'chat_started',
    title: 'Chat Started',
    description: 'Chat session started with Amit Sharma',
    timestamp: '2026-04-13T16:15:00Z',
  },
  {
    id: 'activity_004',
    type: 'call_ended',
    title: 'Call Ended',
    description: 'Video call ended with Raj Kumar (25 min)',
    timestamp: '2026-04-13T16:00:00Z',
    amount: 1200,
  },
  {
    id: 'activity_005',
    type: 'rating_received',
    title: 'New Review',
    description: 'Sneha Reddy gave 5-star rating',
    timestamp: '2026-04-13T15:50:00Z',
  },
  {
    id: 'activity_006',
    type: 'payment_received',
    title: 'Payment Received',
    description: '₹600 received from Vikram Mehta',
    timestamp: '2026-04-13T15:00:00Z',
    amount: 600,
  },
  {
    id: 'activity_007',
    type: 'session_booked',
    title: 'New Session Booked',
    description: 'Raj Kumar booked a 40-min video call',
    timestamp: '2026-04-13T14:45:00Z',
    amount: 0,
  },
  {
    id: 'activity_008',
    type: 'call_ended',
    title: 'Call Ended',
    description: 'Call ended with Deepak Joshi (15 min)',
    timestamp: '2026-04-13T14:00:00Z',
    amount: 450,
  },
];

export const dummyQuickActions: QuickAction[] = [
  {
    id: 'action_001',
    label: 'Go Live',
    icon: 'broadcast',
    action: 'go_live',
  },
  {
    id: 'action_002',
    label: 'Sessions',
    icon: 'chat',
    action: 'sessions',
  },
  {
    id: 'action_003',
    label: 'Wallet',
    icon: 'account-balance-wallet',
    action: 'wallet',
  },
  {
    id: 'action_004',
    label: 'Availability',
    icon: 'event-available',
    action: 'availability',
  },
];

export const dummyHomeDashboard: HomeDashboard = {
  profile: dummyProfile,
  stats: dummyStats,
  earnings: dummyEarnings,
  liveStatus: dummyLiveStatus,
  sessions: dummySessions,
  recentActivities: dummyActivities,
  quickActions: dummyQuickActions,
};

export const updateLiveStatus = (
  dashboard: HomeDashboard,
  isOnline: boolean,
): HomeDashboard => ({
  ...dashboard,
  liveStatus: { ...dashboard.liveStatus, isOnline },
  profile: { ...dashboard.profile, isOnline },
});

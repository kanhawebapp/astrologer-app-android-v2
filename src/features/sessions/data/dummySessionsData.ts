import {
  Session,
  Earnings,
  SessionsStats,
  SessionsDashboard,
  SessionType,
  SessionStatus,
  FilterType,
  SessionTypeFilter,
} from '../domain/types';

const now = new Date();
const formatISOTime = (date: Date): string => {
  return date.toISOString();
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const dummySessions: Session[] = [
  // {
  //   id: 'session_001',
  //   userId: 'user_001',
  //   userName: 'Amit Sharma',
  //   userAvatar: 'https://randomuser.me/api/portraits/men/11.jpg',
  //   userPhone: '+91 9876543210',
  //   type: SessionType.CHAT,
  //   status: SessionStatus.ACTIVE,
  //   startTime: formatISOTime(new Date(now.getTime() - 5 * 60000)),
  //   duration: 5,
  //   earnings: 150,
  //   rating: 0,
  //   isLive: true,
  //   orderId: 'ORD_2026_001',
  // },
  // {
  //   id: 'session_002',
  //   userId: 'user_002',
  //   userName: 'Priya Singh',
  //   userAvatar: 'https://randomuser.me/api/portraits/women/22.jpg',
  //   userPhone: '+91 9876543211',
  //   type: SessionType.CALL,
  //   status: SessionStatus.PENDING,
  //   startTime: formatISOTime(new Date(now.getTime() + 10 * 60000)),
  //   duration: 0,
  //   earnings: 0,
  //   isLive: false,
  //   orderId: 'ORD_2026_002',
  // },
  // {
  //   id: 'session_003',
  //   userId: 'user_003',
  //   userName: 'Raj Kumar',
  //   userAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  //   userPhone: '+91 9876543212',
  //   type: SessionType.CALL,
  //   status: SessionStatus.COMPLETED,
  //   startTime: formatISOTime(new Date(now.getTime() - 60 * 60000)),
  //   endTime: formatISOTime(new Date(now.getTime() - 30 * 60000)),
  //   duration: 30,
  //   earnings: 900,
  //   rating: 5,
  //   isLive: false,
  //   orderId: 'ORD_2026_003',
  // },
  // {
  //   id: 'session_004',
  //   userId: 'user_004',
  //   userName: 'Sneha Reddy',
  //   userAvatar: 'https://randomuser.me/api/portraits/women/33.jpg',
  //   userPhone: '+91 9876543213',
  //   type: SessionType.CHAT,
  //   status: SessionStatus.COMPLETED,
  //   startTime: formatISOTime(new Date(now.getTime() - 120 * 60000)),
  //   endTime: formatISOTime(new Date(now.getTime() - 90 * 60000)),
  //   duration: 30,
  //   earnings: 450,
  //   rating: 4.5,
  //   isLive: false,
  //   orderId: 'ORD_2026_004',
  // },
  // {
  //   id: 'session_005',
  //   userId: 'user_005',
  //   userName: 'Vikram Mehta',
  //   userAvatar: 'https://randomuser.me/api/portraits/men/55.jpg',
  //   userPhone: '+91 9876543214',
  //   type: SessionType.CALL,
  //   status: SessionStatus.CANCELLED,
  //   startTime: formatISOTime(new Date(now.getTime() - 180 * 60000)),
  //   duration: 0,
  //   earnings: 0,
  //   isLive: false,
  //   orderId: 'ORD_2026_005',
  // },
  // {
  //   id: 'session_006',
  //   userId: 'user_006',
  //   userName: 'Anjali Patel',
  //   userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  //   userPhone: '+91 9876543215',
  //   type: SessionType.CHAT,
  //   status: SessionStatus.COMPLETED,
  //   startTime: formatISOTime(new Date(now.getTime() - 240 * 60000)),
  //   endTime: formatISOTime(new Date(now.getTime() - 210 * 60000)),
  //   duration: 30,
  //   earnings: 450,
  //   rating: 5,
  //   isLive: false,
  //   orderId: 'ORD_2026_006',
  // },
  // {
  //   id: 'session_007',
  //   userId: 'user_007',
  //   userName: 'Deepak Joshi',
  //   userAvatar: 'https://randomuser.me/api/portraits/men/66.jpg',
  //   userPhone: '+91 9876543216',
  //   type: SessionType.CALL,
  //   status: SessionStatus.ACTIVE,
  //   startTime: formatISOTime(new Date(now.getTime() - 15 * 60000)),
  //   duration: 15,
  //   earnings: 450,
  //   rating: 0,
  //   isLive: true,
  //   orderId: 'ORD_2026_007',
  // },
  // {
  //   id: 'session_008',
  //   userId: 'user_008',
  //   userName: 'Kavita Iyer',
  //   userAvatar: 'https://randomuser.me/api/portraits/women/55.jpg',
  //   userPhone: '+91 9876543217',
  //   type: SessionType.CHAT,
  //   status: SessionStatus.PENDING,
  //   startTime: formatISOTime(new Date(now.getTime() + 5 * 60000)),
  //   duration: 0,
  //   earnings: 0,
  //   isLive: false,
  //   orderId: 'ORD_2026_008',
  // },
  // {
  //   id: 'session_009',
  //   userId: 'user_009',
  //   userName: 'Rahul Verma',
  //   userAvatar: 'https://randomuser.me/api/portraits/men/77.jpg',
  //   userPhone: '+91 9876543218',
  //   type: SessionType.CALL,
  //   status: SessionStatus.COMPLETED,
  //   startTime: formatISOTime(new Date(now.getTime() - 300 * 60000)),
  //   endTime: formatISOTime(new Date(now.getTime() - 270 * 60000)),
  //   duration: 30,
  //   earnings: 900,
  //   rating: 4,
  //   isLive: false,
  //   orderId: 'ORD_2026_009',
  // },
  // {
  //   id: 'session_010',
  //   userId: 'user_010',
  //   userName: 'Meera Nair',
  //   userAvatar: 'https://randomuser.me/api/portraits/women/66.jpg',
  //   userPhone: '+91 9876543219',
  //   type: SessionType.CHAT,
  //   status: SessionStatus.COMPLETED,
  //   startTime: formatISOTime(new Date(now.getTime() - 360 * 60000)),
  //   endTime: formatISOTime(new Date(now.getTime() - 330 * 60000)),
  //   duration: 30,
  //   earnings: 450,
  //   rating: 5,
  //   isLive: false,
  //   orderId: 'ORD_2026_010',
  // },
];

export const dummyEarnings: Earnings = {
  today: 2850,
  weekly: 18500,
  monthly: 72000,
  total: 485000,
  pendingPayout: 2500,
};

export const dummyStats: SessionsStats = {
  totalSessions: 10,
  activeSessions: 2,
  pendingSessions: 2,
  completedSessions: 5,
  cancelledSessions: 1,
};

export const getActiveSession = (): Session | null => {
  const activeSession = dummySessions.find(
    s => s.status === SessionStatus.ACTIVE,
  );
  return activeSession || null;
};

export const dummySessionsDashboard: SessionsDashboard = {
  sessions: dummySessions,
  earnings: dummyEarnings,
  stats: dummyStats,
  activeSession: getActiveSession(),
};

export const getFilteredSessions = (
  sessions: Session[],
  statusFilter: FilterType | string,
  typeFilter: SessionTypeFilter | string,
): Session[] => {
  let filtered = [...sessions];

  if (typeFilter !== SessionTypeFilter.ALL && typeFilter !== 'all') {
    filtered = filtered.filter(s => s.type === typeFilter);
  }

  if (statusFilter !== FilterType.ALL && statusFilter !== 'all') {
    filtered = filtered.filter(s => s.status === statusFilter);
  }

  return filtered;
};

export const calculateEarnings = (
  sessions: Session[],
  filter: 'today' | 'weekly' | 'monthly' | 'total',
): number => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return sessions
    .filter(s => {
      if (s.status !== SessionStatus.COMPLETED) return false;
      const sessionDate = new Date(s.startTime);

      switch (filter) {
        case 'today':
          return sessionDate >= today;
        case 'weekly': {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return sessionDate >= weekAgo;
        }
        case 'monthly': {
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return sessionDate >= monthAgo;
        }
        case 'total':
          return true;
        default:
          return true;
      }
    })
    .reduce((sum, s) => sum + s.earnings, 0);
};

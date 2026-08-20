import {
  SessionType,
  SessionStatus,
  FilterType,
  SessionTypeFilter,
  DateFilter,
  AmountFilter,
} from './enums';

export enum RemedyType {
  FREE = 'FREE',
  PAID = 'PAID',
}

export interface SessionRemedy {
  id: string;
  sessionId: string;
  title: string;
  description: string;
  type: RemedyType;
  price?: number;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userPhone?: string;
  type: SessionType;
  status: SessionStatus;
  startTime: string;
  endTime?: string;
  duration: number;
  durationMinutes?: number;
  durationSec?: number;
  earnings: number;
  commission?: number | null;
  rating?: number;
  orderId?: string;
  isLive: boolean;
  notes?: string;
}

export interface Earnings {
  today: number;
  weekly: number;
  monthly: number;
  total: number;
  pendingPayout: number;
}

export interface SessionsStats {
  totalSessions: number;
  activeSessions: number;
  pendingSessions: number;
  completedSessions: number;
  cancelledSessions: number;
}

export interface SessionsDashboard {
  sessions: Session[];
  earnings: Earnings;
  stats: SessionsStats;
  activeSession: Session | null;
}

export type SessionApiResponse<T> = {
  data: T;
  isMockData: boolean;
};

export {
  SessionType,
  SessionStatus,
  FilterType,
  SessionTypeFilter,
  DateFilter,
  AmountFilter,
};

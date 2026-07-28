export interface HomeStats {
  active: number;
  pending: number;
  completed: number;
}

export interface HomeNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AstrologerProfile {
  id: string;
  name: string;
  profileImage: string;
  isOnline: boolean;
  rating: number;
  responseRate: number;
  totalSessions: number;
  languages: string[];
  specialties: string[];
}

export interface Earnings {
  today: number;
  weekly: number;
  monthly: number;
  total: number;
  pendingPayout: number;
}

export interface Session {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  type: 'chat' | 'call' | 'video';
  status: 'pending' | 'active' | 'completed';
  duration: number;
  amount: number;
  createdAt: string;
}

export interface Activity {
  id: string;
  type:
    | 'session_booked'
    | 'payment_received'
    | 'chat_started'
    | 'call_ended'
    | 'rating_received';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: 'go_live' | 'sessions' | 'wallet' | 'availability';
}

export interface LiveStatus {
  isOnline: boolean;
  chatEnabled: boolean;
  callEnabled: boolean;
  videoEnabled: boolean;
}

export interface HomeDashboard {
  profile: AstrologerProfile;
  stats: HomeStats;
  earnings: Earnings;
  liveStatus: LiveStatus;
  sessions: Session[];
  recentActivities: Activity[];
  quickActions: QuickAction[];
}

export interface HomeApiResponse {
  data: HomeDashboard;
  isMockData: boolean;
}

export type FilterPeriod = 'today' | '7days' | '30days' | 'custom';
export type SessionTypeFilter = 'all' | 'chat' | 'call' | 'video';
export type DataTypeFilter = 'earnings' | 'sessions' | 'both';

export interface TimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {data: number[]; color?: string}[];
}

export interface KPIMetric {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
}

export interface Insight {
  id: string;
  type: 'achievement' | 'tip' | 'alert' | 'trend';
  title: string;
  description: string;
  value?: string | number;
  timestamp?: string;
}

export interface SessionAnalytics {
  chatCount: number;
  callCount: number;
  videoCount: number;
  completedCount: number;
  cancelledCount: number;
  peakHours: {hour: string; count: number}[];
}

export interface EarningsTrend {
  current: TimeSeriesPoint[];
  previous: TimeSeriesPoint[];
  totalCurrent: number;
  totalPrevious: number;
  percentageChange: number;
}

export interface AnalyticsDashboard {
  kpis: KPIMetric[];
  earningsTrend: EarningsTrend;
  sessionAnalytics: SessionAnalytics;
  insights: Insight[];
  liveStatus: LiveStatus;
  recentActivities: Activity[];
}

export { AstrologerAnalytics, MonthlyAnalytics } from '../../../services/api/analytics/analytics.types';

export interface AnalyticsApiResponse {
  data: AstrologerAnalytics;
  isMockData: boolean;
}

import {
  AnalyticsDashboard,
  TimeSeriesPoint,
  KPIMetric,
  Insight,
  SessionAnalytics,
  EarningsTrend,
  Activity,
  LiveStatus,
} from '../domain/types';

const generateDateLabels = (days: number): string[] => {
  const labels: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    labels.push(
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    );
  }
  return labels;
};

const generateTimeSeriesData = (
  days: number,
  baseValue: number,
  variance: number,
): TimeSeriesPoint[] => {
  const labels = generateDateLabels(days);
  return labels.map((label, index) => ({
    date: label,
    value: Math.floor(baseValue + Math.random() * variance - variance / 2),
    label,
  }));
};

export const dummyKPIs: KPIMetric[] = [
  {
    id: 'total_earnings',
    label: 'Total Earnings',
    value: '₹72,000',
    change: 12.5,
    changeType: 'positive',
    icon: 'account-balance-wallet',
  },
  {
    id: 'total_sessions',
    label: 'Total Sessions',
    value: 156,
    change: 8.2,
    changeType: 'positive',
    icon: 'chat',
  },
  {
    id: 'active_sessions',
    label: 'Active Sessions',
    value: 3,
    change: 0,
    changeType: 'neutral',
    icon: 'video-call',
  },
  {
    id: 'rating',
    label: 'Rating',
    value: 4.8,
    change: 0.1,
    changeType: 'positive',
    icon: 'star',
  },
  {
    id: 'response_rate',
    label: 'Response Rate',
    value: '98%',
    change: 2.5,
    changeType: 'positive',
    icon: 'quickreply',
  },
  {
    id: 'conversion_rate',
    label: 'Conversion',
    value: '72%',
    change: -3.2,
    changeType: 'negative',
    icon: 'trending-up',
  },
];

export const dummyEarningsTrend: EarningsTrend = {
  current: [
    { date: 'Apr 8', value: 2800, label: 'Apr 8' },
    { date: 'Apr 9', value: 3200, label: 'Apr 9' },
    { date: 'Apr 10', value: 2500, label: 'Apr 10' },
    { date: 'Apr 11', value: 4100, label: 'Apr 11' },
    { date: 'Apr 12', value: 3800, label: 'Apr 12' },
    { date: 'Apr 13', value: 4500, label: 'Apr 13' },
    { date: 'Apr 14', value: 2450, label: 'Apr 14' },
  ],
  previous: [
    { date: 'Apr 1', value: 2200, label: 'Apr 1' },
    { date: 'Apr 2', value: 2800, label: 'Apr 2' },
    { date: 'Apr 3', value: 2400, label: 'Apr 3' },
    { date: 'Apr 4', value: 3100, label: 'Apr 4' },
    { date: 'Apr 5', value: 3500, label: 'Apr 5' },
    { date: 'Apr 6', value: 2900, label: 'Apr 6' },
    { date: 'Apr 7', value: 3800, label: 'Apr 7' },
  ],
  totalCurrent: 23350,
  totalPrevious: 20700,
  percentageChange: 12.8,
};

export const dummySessionAnalytics: SessionAnalytics = {
  chatCount: 68,
  callCount: 52,
  videoCount: 36,
  completedCount: 142,
  cancelledCount: 14,
  peakHours: [
    { hour: '8 AM', count: 8 },
    { hour: '10 AM', count: 12 },
    { hour: '12 PM', count: 15 },
    { hour: '2 PM', count: 11 },
    { hour: '6 PM', count: 18 },
    { hour: '8 PM', count: 22 },
    { hour: '10 PM', count: 16 },
  ],
};

export const dummyInsights: Insight[] = [
  // {
  //   id: 'insight_001',
  //   type: 'achievement',
  //   title: 'Peak Earnings Hour',
  //   description: 'Your peak earning time is 8-10 PM with ₹8,500 earned',
  // },
  // {
  //   id: 'insight_002',
  //   type: 'trend',
  //   title: 'Call Sessions Up',
  //   description:
  //     'Call sessions increased by 20% this week compared to last week',
  //   value: '+20%',
  // },
  // {
  //   id: 'insight_003',
  //   type: 'tip',
  //   title: 'Response Time',
  //   description:
  //     'Your response rate is 98%. Keep it up! Top performers average 95%',
  // },
  // {
  //   id: 'insight_004',
  //   type: 'achievement',
  //   title: 'Best Day',
  //   description:
  //     'Saturday was your best day with 28 sessions and ₹12,400 earnings',
  // },
  // {
  //   id: 'insight_005',
  //   type: 'alert',
  //   title: 'Conversion Drop',
  //   description:
  //     'Conversion rate dropped 3% this week. Consider improving initial response',
  //   value: '-3%',
  // },
];

export const dummyLiveStatusAnalytics: LiveStatus = {
  isOnline: true,
  chatEnabled: true,
  callEnabled: true,
  videoEnabled: false,
};

export const dummyActivitiesAnalytics: Activity[] = [
  // {
  //   id: 'activity_001',
  //   type: 'session_booked',
  //   title: 'Session Booked',
  //   description: 'New chat session from Priya Singh',
  //   timestamp: '2026-04-14T10:30:00Z',
  // },
  // {
  //   id: 'activity_002',
  //   type: 'payment_received',
  //   title: 'Payment Received',
  //   description: '₹450 received from Sneha Reddy',
  //   timestamp: '2026-04-14T10:15:00Z',
  //   amount: 450,
  // },
  // {
  //   id: 'activity_003',
  //   type: 'chat_started',
  //   title: 'Chat Started',
  //   description: 'Chat session started with Amit Sharma',
  //   timestamp: '2026-04-14T09:45:00Z',
  // },
  // {
  //   id: 'activity_004',
  //   type: 'call_ended',
  //   title: 'Call Ended',
  //   description: 'Video call ended with Raj Kumar (25 min)',
  //   timestamp: '2026-04-14T09:30:00Z',
  //   amount: 1200,
  // },
  // {
  //   id: 'activity_005',
  //   type: 'rating_received',
  //   title: 'New Review',
  //   description: 'Sneha Reddy gave 5-star rating',
  //   timestamp: '2026-04-14T09:00:00Z',
  // },
  // {
  //   id: 'activity_006',
  //   type: 'payment_received',
  //   title: 'Payment Received',
  //   description: '₹600 received from Vikram Mehta',
  //   timestamp: '2026-04-14T08:30:00Z',
  //   amount: 600,
  // },
];

export const generateAnalyticsData = (
  period: 'today' | '7days' | '30days',
): AnalyticsDashboard => {
  const days = period === 'today' ? 1 : period === '7days' ? 7 : 30;
  const multiplier = period === '30days' ? 4 : period === '7days' ? 1 : 0.14;

  return {
    kpis: [
      // {
      //   id: 'total_earnings',
      //   label: 'Total Earnings',
      //   value: `₹${Math.floor(72000 * multiplier)}`,
      //   change: 12.5,
      //   changeType: 'positive',
      //   icon: 'account-balance-wallet',
      // },
      // {
      //   id: 'total_sessions',
      //   label: 'Total Sessions',
      //   value: Math.floor(156 * multiplier),
      //   change: 8.2,
      //   changeType: 'positive',
      //   icon: 'chat',
      // },
      // {
      //   id: 'active_sessions',
      //   label: 'Active Sessions',
      //   value: 3,
      //   change: 0,
      //   changeType: 'neutral',
      //   icon: 'video-call',
      // },
      // {
      //   id: 'rating',
      //   label: 'Rating',
      //   value: 4.8,
      //   change: 0.1,
      //   changeType: 'positive',
      //   icon: 'star',
      // },
      // {
      //   id: 'response_rate',
      //   label: 'Response Rate',
      //   value: '98%',
      //   change: 2.5,
      //   changeType: 'positive',
      //   icon: 'quickreply',
      // },
      // {
      //   id: 'conversion_rate',
      //   label: 'Conversion',
      //   value: '72%',
      //   change: -3.2,
      //   changeType: 'negative',
      //   icon: 'trending-up',
      // },
    ],
    earningsTrend: {
      current: generateTimeSeriesData(days, 3000, 1500),
      previous: generateTimeSeriesData(days, 2500, 1200),
      totalCurrent: Math.floor(23350 * multiplier),
      totalPrevious: Math.floor(20700 * multiplier),
      percentageChange: 12.8,
    },
    sessionAnalytics: {
      chatCount: Math.floor(68 * multiplier),
      callCount: Math.floor(52 * multiplier),
      videoCount: Math.floor(36 * multiplier),
      completedCount: Math.floor(142 * multiplier),
      cancelledCount: Math.floor(14 * multiplier),
      peakHours: dummySessionAnalytics.peakHours,
    },
    insights: dummyInsights,
    liveStatus: dummyLiveStatusAnalytics,
    recentActivities: dummyActivitiesAnalytics,
  };
};

export const dummyAnalyticsDashboard: AnalyticsDashboard = {
  kpis: dummyKPIs,
  earningsTrend: dummyEarningsTrend,
  sessionAnalytics: dummySessionAnalytics,
  insights: dummyInsights,
  liveStatus: dummyLiveStatusAnalytics,
  recentActivities: dummyActivitiesAnalytics,
};

import {
  WalletDashboard,
  Transaction,
  Earnings,
  ChartData,
} from '../domain/types';

const generateChartData = (): ChartData[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    label: day,
    value: Math.floor(Math.random() * 2000) + 500,
  }));
};

export const dummyTransactions: Transaction[] = [
  {
    id: 'txn_001',
    type: 'credit',
    amount: 450,
    status: 'success',
    date: '2026-04-09T14:30:00Z',
    title: 'Chat Session',
    description: '30 min chat with Amit Sharma',
    icon: 'chat',
  },
  {
    id: 'txn_002',
    type: 'debit',
    amount: 2000,
    status: 'success',
    date: '2026-04-08T10:00:00Z',
    title: 'Withdrawal',
    description: 'Transferred to UPI ***@oksbi',
    icon: 'withdrawal',
  },
  {
    id: 'txn_003',
    type: 'credit',
    amount: 750,
    status: 'success',
    date: '2026-04-08T09:15:00Z',
    title: 'Call Session',
    description: '25 min call with Priya Singh',
    icon: 'call',
  },
  {
    id: 'txn_004',
    type: 'credit',
    amount: 300,
    status: 'pending',
    date: '2026-04-07T16:45:00Z',
    title: 'Chat Session',
    description: '20 min chat pending completion',
    icon: 'chat',
  },
  {
    id: 'txn_005',
    type: 'credit',
    amount: 1200,
    status: 'success',
    date: '2026-04-07T11:30:00Z',
    title: 'Video Session',
    description: '40 min video call with Raj Kumar',
    icon: 'video',
  },
  {
    id: 'txn_006',
    type: 'debit',
    amount: 5000,
    status: 'success',
    date: '2026-04-05T09:00:00Z',
    title: 'Withdrawal',
    description: 'Transferred to Bank A/C ***1234',
    icon: 'withdrawal',
  },
  {
    id: 'txn_007',
    type: 'credit',
    amount: 600,
    status: 'success',
    date: '2026-04-04T14:20:00Z',
    title: 'Chat Session',
    description: '40 min chat with Sneha Reddy',
    icon: 'chat',
  },
  {
    id: 'txn_008',
    type: 'debit',
    amount: 1500,
    status: 'failed',
    date: '2026-04-03T08:45:00Z',
    title: 'Withdrawal',
    description: 'Failed - Invalid UPI ID',
    icon: 'withdrawal',
  },
  {
    id: 'txn_009',
    type: 'credit',
    amount: 850,
    status: 'success',
    date: '2026-04-02T17:10:00Z',
    title: 'Call Session',
    description: '35 min call with Vikram Mehta',
    icon: 'call',
  },
  {
    id: 'txn_010',
    type: 'credit',
    amount: 200,
    status: 'success',
    date: '2026-04-01T12:00:00Z',
    title: 'Bonus',
    description: 'Performance bonus - 10 sessions',
    icon: 'bonus',
  },
  {
    id: 'txn_011',
    type: 'credit',
    amount: 550,
    status: 'success',
    date: '2026-03-31T15:30:00Z',
    title: 'Chat Session',
    description: '25 min chat with Deepak Joshi',
    icon: 'chat',
  },
  {
    id: 'txn_012',
    type: 'credit',
    amount: 900,
    status: 'success',
    date: '2026-03-30T10:45:00Z',
    title: 'Call Session',
    description: '45 min call with Anjali Pandey',
    icon: 'call',
  },
];

export const dummyEarnings: Earnings = {
  daily: 450,
  weekly: 4200,
  monthly: 18500,
  total: 125000,
  today: 450,
  lastPayout: {
    amount: 5000,
    date: '2026-04-05T09:00:00Z',
    status: 'completed',
  },
  pendingPayout: {
    amount: 0,
    date: '',
    status: '',
  },
};

export const dummyChartData: ChartData[] = generateChartData();

export const dummyWalletDashboard: WalletDashboard = {
  balance: 12450,
  earnings: dummyEarnings,
  transactions: dummyTransactions,
  chartData: dummyChartData,
};

export const mockWithdrawResponse = {
  success: true,
  message: 'Withdrawal request submitted successfully',
  transactionId: 'withdraw_001',
};

export const failedWithdrawResponse = {
  success: false,
  message: 'Insufficient balance for withdrawal',
};

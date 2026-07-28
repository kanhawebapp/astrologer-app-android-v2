import {
  WalletDashboard,
  WithdrawRequest,
  WithdrawResponse,
  Transaction,
  ChartData,
} from '../domain/types';
import {earningsApi} from '../../../services/api/earning/earnings.service';
import {walletTransactionsApi} from '../../../services/api/walletTransactions/walletTransactions.service';
import {WalletTransaction} from '../../../services/api/walletTransactions/walletTransactions.type';

const generateChartData = (): ChartData[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    label: day,
    value: Math.floor(Math.random() * 2000) + 500,
  }));
};

const mapTransactionType = (
  type: WalletTransaction['type'],
): 'credit' | 'debit' => {
  if (
    type === 'CREDIT' ||
    type === 'CHAT_EARNING' ||
    type === 'CALL_EARNING' ||
    type === 'BONUS'
  ) {
    return 'credit';
  }
  return 'debit';
};

const mapTransactionStatus = (
  type: WalletTransaction['type'],
): 'success' | 'pending' | 'failed' => {
  return 'success';
};

const mapTransactionToDomain = (tx: WalletTransaction): Transaction => ({
  id: tx.id,
  type: mapTransactionType(tx.type),
  amount: tx.coins ?? tx.amount,
  coins: tx.coins,
  status: mapTransactionStatus(tx.type),
  date: tx.createdAt,
  createdAt: tx.createdAt,
  title:
    tx.description ||
    (mapTransactionType(tx.type) === 'credit' ? 'Credit' : 'Debit'),
  description: tx.description,
});

export const walletService = {
  async getWalletDashboard(): Promise<WalletDashboard> {
    console.log('🔥 walletService.getWalletDashboard', {
      timestamp: new Date().toISOString(),
    });
    const earningsResponse = await earningsApi.getAstrologerEarnings();
    const earningsData = earningsResponse.getAstrologerEarnings;
    
    const transactionsResponse =
      await walletTransactionsApi.getAstrologerWalletTransactions({
        page: 1,
        limit: 10,
      });
    const transactionsData =
      transactionsResponse.getAstrologerWalletTransactions;

    const transactions: Transaction[] = (transactionsData?.data || []).map(
      mapTransactionToDomain,
    );

    const chartData: ChartData[] = generateChartData();

    return {
      balance: earningsData?.summary?.currentBalance || 0,
      earnings: {
        daily: earningsData?.summary?.totalEarnings || 0,
        weekly: earningsData?.summary?.totalEarnings || 0,
        monthly: earningsData?.summary?.totalEarnings || 0,
        total: earningsData?.summary?.totalEarnings || 0,
        today: earningsData?.summary?.totalEarnings || 0,
      },
      transactions,
      chartData,
    };
  },

  async requestWithdrawal(request: WithdrawRequest): Promise<WithdrawResponse> {
    if (request.amount < 100) {
      return {
        success: false,
        message: 'Minimum withdrawal amount is ₹100',
      };
    }
    return {
      success: true,
      message: 'Withdrawal request submitted successfully',
      transactionId: `withdraw_${Date.now()}`,
    };
  },
};

export const walletQueries = {
  getWalletDashboard: `
    query GetWalletDashboard {
      walletDashboard {
        balance
        totalEarnings
        weeklyEarnings
        monthlyEarnings
        todayEarnings
        transactions {
          id
          type
          amount
          status
          date
          title
          description
        }
        chartData {
          label
          value
        }
        lastPayout {
          amount
          date
          status
        }
      }
    }
  `,
};

export const walletMutations = {
  requestWithdrawal: `
    mutation RequestWithdrawal($input: WithdrawInput!) {
      requestWithdrawal(input: $input) {
        success
        message
        transactionId
      }
    }
  `,
};

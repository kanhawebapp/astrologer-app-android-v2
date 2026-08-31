import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {walletRepository} from '../../features/wallet/data/walletRepository';
import {
  WalletDashboard,
  WithdrawRequest,
  WithdrawResponse,
  Earnings,
  Transaction,
} from '../../features/wallet/domain/types';
import {RootState} from '../index';

interface WalletState {
  dashboard: WalletDashboard | null;
  earnings: Earnings | null;
  transactions: Transaction[];
  balance: number;
  loading: boolean;
  withdrawing: boolean;
  withdrawError: string | null;
  withdrawSuccess: boolean;
  error: string | null;
  isMockData: boolean;
  selectedPeriod: 'daily' | 'weekly' | 'monthly';
  transactionsPage: number;
  transactionsTotalPages: number;
  transactionsTotalCount: number;
  loadingMoreTransactions: boolean;
  hasMoreTransactions: boolean;
}

const initialState: WalletState = {
  dashboard: null,
  earnings: null,
  transactions: [],
  balance: 0,
  loading: false,
  withdrawing: false,
  withdrawError: null,
  withdrawSuccess: false,
  error: null,
  isMockData: false,
  selectedPeriod: 'weekly',
  transactionsPage: 1,
  transactionsTotalPages: 1,
  transactionsTotalCount: 0,
  loadingMoreTransactions: false,
  hasMoreTransactions: false,
};

export const fetchWalletData = createAsyncThunk(
  'wallet/fetchData',
  async (_, {rejectWithValue}) => {
    try {
      const {dashboard, isMockData} = await walletRepository.getDashboard();
      console.log('🔥 fetchWalletData thunk');
      return {dashboard, isMockData};
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch wallet data',
      );
    }
  },
);

export const requestWithdrawal = createAsyncThunk(
  'wallet/requestWithdrawal',
  async (request: WithdrawRequest, {rejectWithValue}) => {
    try {
      const {response, isMockData} = await walletRepository.requestWithdrawal(
        request,
      );
      return {response, isMockData};
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to request withdrawal',
      );
    }
  },
);

export const loadMoreTransactions = createAsyncThunk(
  'wallet/loadMoreTransactions',
  async (_, {getState, rejectWithValue}) => {
    try {
      const state = getState() as RootState;
      const {transactionsPage, transactionsTotalPages} = state.wallet;

      const nextPage = transactionsPage + 1;
      if (nextPage > transactionsTotalPages) {
        return rejectWithValue('No more pages');
      }

      const result = await walletRepository.getTransactionsPage(nextPage, 10);
      return {
        transactions: result.transactions,
        totalCount: result.totalCount,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to load more transactions',
      );
    }
  },
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setSelectedPeriod: (state, action) => {
      state.selectedPeriod = action.payload;
    },
    clearWithdrawState: state => {
      state.withdrawError = null;
      state.withdrawSuccess = false;
    },
    clearWalletError: state => {
      state.error = null;
    },
    clearDashboard: state => {
      state.dashboard = null;
      state.earnings = null;
      state.transactions = [];
      state.balance = 0;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchWalletData.pending, state => {
        state.loading = true;
        state.error = null;
        state.transactionsPage = 1;
        state.transactionsTotalPages = 1;
        state.transactionsTotalCount = 0;
        state.loadingMoreTransactions = false;
        state.hasMoreTransactions = false;
      })
      .addCase(fetchWalletData.fulfilled, (state, action) => {
        state.loading = false;
        const {dashboard, isMockData} = action.payload;
        state.dashboard = dashboard;
        state.balance = dashboard.balance;
        state.earnings = dashboard.earnings;
        state.transactions = dashboard.transactions;
        state.isMockData = isMockData;
        const pagination = dashboard.transactionsPagination;
        if (pagination) {
          state.transactionsPage = pagination.currentPage;
          state.transactionsTotalPages = pagination.totalPages;
          state.transactionsTotalCount = pagination.totalCount;
          state.hasMoreTransactions =
            pagination.currentPage < pagination.totalPages;
        } else {
          state.transactionsPage = 1;
          state.transactionsTotalPages = 1;
          state.transactionsTotalCount = dashboard.transactions.length;
          state.hasMoreTransactions = false;
        }
      })
      .addCase(fetchWalletData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loadMoreTransactions.pending, state => {
        state.loadingMoreTransactions = true;
      })
      .addCase(loadMoreTransactions.fulfilled, (state, action) => {
        state.loadingMoreTransactions = false;
        const {transactions, totalCount, currentPage, totalPages} =
          action.payload;
        state.transactions = [...state.transactions, ...transactions];
        state.transactionsTotalCount = totalCount;
        state.transactionsPage = currentPage;
        state.transactionsTotalPages = totalPages;
        state.hasMoreTransactions = currentPage < totalPages;
      })
      .addCase(loadMoreTransactions.rejected, state => {
        state.loadingMoreTransactions = false;
      })
      .addCase(requestWithdrawal.pending, state => {
        state.withdrawing = true;
        state.withdrawError = null;
        state.withdrawSuccess = false;
      })
      .addCase(requestWithdrawal.fulfilled, (state, action) => {
        state.withdrawing = false;
        const {response} = action.payload as {response: WithdrawResponse};
        if (response.success) {
          state.withdrawSuccess = true;
          state.balance -= response.success ? 0 : 0;
        } else {
          state.withdrawError = response.message;
        }
      })
      .addCase(requestWithdrawal.rejected, state => {
        state.withdrawing = false;
      });
  },
});

export const {
  setSelectedPeriod,
  clearWithdrawState,
  clearWalletError,
  clearDashboard,
} = walletSlice.actions;

export default walletSlice.reducer;

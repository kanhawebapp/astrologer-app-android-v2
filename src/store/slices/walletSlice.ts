import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { walletRepository } from '../../features/wallet/data/walletRepository';
import {
  WalletDashboard,
  WithdrawRequest,
  WithdrawResponse,
  Earnings,
  Transaction,
} from '../../features/wallet/domain/types';

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
};

export const fetchWalletData = createAsyncThunk(
  'wallet/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const { dashboard, isMockData } = await walletRepository.getDashboard();
      console.log('🔥 fetchWalletData thunk');
      return { dashboard, isMockData };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch wallet data',
      );
    }
  },
);

export const requestWithdrawal = createAsyncThunk(
  'wallet/requestWithdrawal',
  async (request: WithdrawRequest, { rejectWithValue }) => {
    try {
      const { response, isMockData } = await walletRepository.requestWithdrawal(
        request,
      );
      return { response, isMockData };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to request withdrawal',
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
      })
      .addCase(fetchWalletData.fulfilled, (state, action) => {
        state.loading = false;
        const { dashboard, isMockData } = action.payload;
        state.dashboard = dashboard;
        state.balance = dashboard.balance;
        state.earnings = dashboard.earnings;
        state.transactions = dashboard.transactions;
        state.isMockData = isMockData;
      })
      .addCase(fetchWalletData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(requestWithdrawal.pending, state => {
        state.withdrawing = true;
        state.withdrawError = null;
        state.withdrawSuccess = false;
      })
      .addCase(requestWithdrawal.fulfilled, (state, action) => {
        state.withdrawing = false;
        const { response } = action.payload as { response: WithdrawResponse };
        if (response.success) {
          state.withdrawSuccess = true;
          state.balance -= response.success ? 0 : 0;
        } else {
          state.withdrawError = response.message;
        }
      })
      .addCase(requestWithdrawal.rejected, (state, action) => {
        state.withdrawing = false;
        state.withdrawError = action.payload as string;
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

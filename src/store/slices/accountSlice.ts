import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { accountRepository } from '../../features/account/data/accountRepository';
import {
  AccountDashboard,
  AccountState,
  UpdateAvailabilityInput,
  UpdatePricingInput,
} from '../../features/account/domain/types';

const initialState: AccountState = {
  dashboard: null,
  profile: null,
  pricing: null,
  availability: null,
  stats: null,
  loading: false,
  updating: false,
  error: null,
  isMockData: false,
};

export const fetchAccountDashboard = createAsyncThunk(
  'account/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const { dashboard, isMockData } = await accountRepository.getDashboard();
      return { dashboard, isMockData };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch dashboard',
      );
    }
  },
);

export const updateAvailability = createAsyncThunk(
  'account/updateAvailability',
  async (input: UpdateAvailabilityInput, { rejectWithValue }) => {
    try {
      const { success, isMockData } =
        await accountRepository.updateAvailability(input);
      if (success) {
        const dashboard = accountRepository.getCachedDashboard();
        return { dashboard, isMockData };
      }
      return rejectWithValue('Failed to update availability');
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to update availability',
      );
    }
  },
);

export const updatePricing = createAsyncThunk(
  'account/updatePricing',
  async (input: UpdatePricingInput, { rejectWithValue }) => {
    try {
      const { success, isMockData } = await accountRepository.updatePricing(
        input,
      );
      if (success) {
        const dashboard = accountRepository.getCachedDashboard();
        return { dashboard, isMockData };
      }
      return rejectWithValue('Failed to update pricing');
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update pricing',
      );
    }
  },
);

export const updateAstrologerProfile = createAsyncThunk(
  'account/updateProfile',
  async (
    input: {
      name?: string;
      about?: string;
      skills?: string[];
      languages?: string[];
      chatPricePerMinute?: number;
      callPricePerMinute?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const { success, isMockData } = await accountRepository.updateProfile(
        input,
      );
      if (success) {
        const dashboard = accountRepository.getCachedDashboard();
        return { dashboard, isMockData };
      }
      return rejectWithValue('Failed to update profile');
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update profile',
      );
    }
  },
);

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    clearAccountError: state => {
      state.error = null;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
      if (state.dashboard) {
        state.dashboard.profile = action.payload;
      }
    },
    setMockData: (state, action) => {
      state.isMockData = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAccountDashboard.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountDashboard.fulfilled, (state, action) => {
        state.loading = false;
        const { dashboard, isMockData } = action.payload;
        state.dashboard = dashboard;
        state.profile = dashboard.profile;
        state.pricing = dashboard.pricing;
        state.availability = dashboard.availability;
        state.stats = dashboard.stats;
        state.isMockData = isMockData;
      })
      .addCase(fetchAccountDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateAvailability.pending, state => {
        state.updating = true;
      })
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.updating = false;
        const { dashboard, isMockData } = action.payload;
        if (dashboard) {
          state.dashboard = dashboard;
          state.availability = dashboard.availability;
          state.isMockData = isMockData;
        }
      })
      .addCase(updateAvailability.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      .addCase(updatePricing.pending, state => {
        state.updating = true;
      })
      .addCase(updatePricing.fulfilled, (state, action) => {
        state.updating = false;
        const { dashboard, isMockData } = action.payload;
        if (dashboard) {
          state.dashboard = dashboard;
          state.pricing = dashboard.pricing;
          state.isMockData = isMockData;
        }
      })
      .addCase(updatePricing.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      .addCase(updateAstrologerProfile.pending, state => {
        state.updating = true;
      })
      .addCase(updateAstrologerProfile.fulfilled, (state, action) => {
        state.updating = false;
        const { dashboard, isMockData } = action.payload;
        if (dashboard) {
          state.dashboard = dashboard;
          state.profile = dashboard.profile;
          state.pricing = dashboard.pricing;
          state.isMockData = isMockData;
        }
      })
      .addCase(updateAstrologerProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAccountError, setProfile, setMockData } =
  accountSlice.actions;
export default accountSlice.reducer;

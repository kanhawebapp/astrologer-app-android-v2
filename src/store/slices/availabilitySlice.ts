import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  Availability,
  UpdateAvailabilityInput,
  AvailabilityState,
  WorkingHours,
} from '../../features/availability/domain/types';
import {
  AvailabilityStatus,
  SessionMode,
} from '../../features/availability/domain/enums';
import { getDefaultAvailability } from '../../features/availability/data/dummyAvailabilityData';
import * as availabilityRepo from '../../features/availability/data/availabilityRepository';

const initialState: AvailabilityState = {
  availability: {
    ...getDefaultAvailability(),
    status: AvailabilityStatus.OFFLINE,
    mode: SessionMode.MANUAL,
  },
  isLoading: false,
  isUpdating: false,
  error: null,
  isMockData: true,
};

export const fetchAvailabilityThunk = createAsyncThunk(
  'availability/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const result = await availabilityRepo.getAvailability();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch availability');
    }
  },
);

export const updateAvailabilityThunk = createAsyncThunk(
  'availability/update',
  async (input: UpdateAvailabilityInput, { rejectWithValue }) => {
    try {
      const result = await availabilityRepo.updateAvailability(input);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update availability');
    }
  },
);

export const toggleOnlineThunk = createAsyncThunk(
  'availability/toggleOnline',
  async (isOnline: boolean, { rejectWithValue }) => {
    try {
      const result = await availabilityRepo.toggleOnlineStatus(isOnline);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle online status');
    }
  },
);

export const toggleChatThunk = createAsyncThunk(
  'availability/toggleChat',
  async (chatEnabled: boolean, { rejectWithValue }) => {
    try {
      const result = await availabilityRepo.toggleChat(chatEnabled);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle chat');
    }
  },
);

export const toggleCallThunk = createAsyncThunk(
  'availability/toggleCall',
  async (callEnabled: boolean, { rejectWithValue }) => {
    try {
      const result = await availabilityRepo.toggleCall(callEnabled);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle call');
    }
  },
);

export const toggleBusyModeThunk = createAsyncThunk(
  'availability/toggleBusyMode',
  async (busyMode: boolean, { rejectWithValue }) => {
    try {
      const result = await availabilityRepo.toggleBusyMode(busyMode);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle busy mode');
    }
  },
);

export const toggleAutoAcceptThunk = createAsyncThunk(
  'availability/toggleAutoAccept',
  async (autoAccept: boolean, { rejectWithValue }) => {
    try {
      const result = await availabilityRepo.toggleAutoAccept(autoAccept);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle auto accept');
    }
  },
);

export const updateMaxSessionsThunk = createAsyncThunk(
  'availability/updateMaxSessions',
  async (maxSessions: number, { rejectWithValue }) => {
    try {
      const result = await availabilityRepo.updateMaxSessions(maxSessions);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update max sessions');
    }
  },
);

export const updateWorkingHoursThunk = createAsyncThunk(
  'availability/updateWorkingHours',
  async (workingHours: WorkingHours, { rejectWithValue }) => {
    try {
      const result = await availabilityRepo.updateWorkingHours(workingHours);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update working hours');
    }
  },
);

const availabilitySlice = createSlice({
  name: 'availability',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setMockDataMode: (state, action) => {
      state.isMockData = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAvailabilityThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailabilityThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availability = action.payload.data;
        state.isMockData = action.payload.isMockData;
      })
      .addCase(fetchAvailabilityThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isMockData = true;
      })
      .addCase(updateAvailabilityThunk.pending, state => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateAvailabilityThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.availability = action.payload.data;
        state.isMockData = action.payload.isMockData;
      })
      .addCase(updateAvailabilityThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      .addCase(toggleOnlineThunk.pending, state => {
        state.isUpdating = true;
      })
      .addCase(toggleOnlineThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.availability = action.payload.data;
        state.isMockData = action.payload.isMockData;
      })
      .addCase(toggleOnlineThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      .addCase(toggleChatThunk.fulfilled, (state, action) => {
        state.availability = action.payload.data;
        state.isMockData = action.payload.isMockData;
      })
      .addCase(toggleCallThunk.fulfilled, (state, action) => {
        state.availability = action.payload.data;
        state.isMockData = action.payload.isMockData;
      })
      .addCase(toggleBusyModeThunk.fulfilled, (state, action) => {
        state.availability = action.payload.data;
        state.isMockData = action.payload.isMockData;
      })
      .addCase(toggleAutoAcceptThunk.fulfilled, (state, action) => {
        state.availability = action.payload.data;
        state.isMockData = action.payload.isMockData;
      })
      .addCase(updateMaxSessionsThunk.fulfilled, (state, action) => {
        state.availability = action.payload.data;
        state.isMockData = action.payload.isMockData;
      })
      .addCase(updateWorkingHoursThunk.fulfilled, (state, action) => {
        state.availability = action.payload.data;
        state.isMockData = action.payload.isMockData;
      });
  },
});

export const { clearError, setMockDataMode } = availabilitySlice.actions;
export default availabilitySlice.reducer;

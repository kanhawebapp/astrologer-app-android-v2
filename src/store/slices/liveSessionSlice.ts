import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  LiveSession,
  LiveSessionState,
  ScheduleLiveInput,
  LiveSessionStatus,
} from '../../features/availability/domain/liveTypes';
import { getDefaultLiveSessions } from '../../features/availability/data/dummyLiveData';
import * as liveSessionRepo from '../../features/availability/data/liveSessionRepository';

const initialState: LiveSessionState = {
  liveSessions: getDefaultLiveSessions(),
  currentLive: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  isMockData: true,
};

export const fetchLiveSessionsThunk = createAsyncThunk(
  'liveSession/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const result = await liveSessionRepo.getLiveSessions();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch live sessions');
    }
  },
);

export const fetchCurrentLiveThunk = createAsyncThunk(
  'liveSession/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const result = await liveSessionRepo.getCurrentLive();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch current live');
    }
  },
);

export const scheduleLiveThunk = createAsyncThunk(
  'liveSession/schedule',
  async (input: ScheduleLiveInput, { rejectWithValue }) => {
    try {
      const result = await liveSessionRepo.scheduleNewLive(input);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to schedule live');
    }
  },
);

export const startLiveThunk = createAsyncThunk(
  'liveSession/start',
  async (sessionId: string | undefined, { rejectWithValue }) => {
    try {
      const result = await liveSessionRepo.startLive(sessionId);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to start live');
    }
  },
);

export const endLiveThunk = createAsyncThunk(
  'liveSession/end',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const result = await liveSessionRepo.endLive(sessionId);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to end live');
    }
  },
);

export const cancelLiveThunk = createAsyncThunk(
  'liveSession/cancel',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const result = await liveSessionRepo.cancelLive(sessionId);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel live');
    }
  },
);

const liveSessionSlice = createSlice({
  name: 'liveSession',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setCurrentLive: (state, action) => {
      state.currentLive = action.payload;
    },
    updateLiveStats: (state, action) => {
      if (state.currentLive) {
        state.currentLive.stats = {
          ...state.currentLive.stats,
          ...action.payload,
        };
      }
    },
    clearCurrentLive: state => {
      state.currentLive = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchLiveSessionsThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLiveSessionsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.liveSessions = action.payload.data as LiveSession[];
        state.isMockData = action.payload.isMockData;
      })
      .addCase(fetchLiveSessionsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCurrentLiveThunk.pending, state => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentLiveThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload.data;
        if (data && typeof data !== 'object' && !Array.isArray(data)) {
          state.currentLive = data as LiveSession;
        }
        state.isMockData = action.payload.isMockData;
      })
      .addCase(fetchCurrentLiveThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(scheduleLiveThunk.pending, state => {
        state.isUpdating = true;
      })
      .addCase(scheduleLiveThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const newSession = action.payload.data as LiveSession;
        if (newSession) {
          state.liveSessions = [...state.liveSessions, newSession];
        }
        state.isMockData = action.payload.isMockData;
      })
      .addCase(scheduleLiveThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      .addCase(startLiveThunk.pending, state => {
        state.isUpdating = true;
      })
      .addCase(startLiveThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const newLive = action.payload.data as LiveSession;
        if (newLive) {
          state.currentLive = newLive;
          const index = state.liveSessions.findIndex(s => s.id === newLive.id);
          if (index >= 0) {
            state.liveSessions[index] = newLive;
          } else {
            state.liveSessions = [newLive, ...state.liveSessions];
          }
        }
        state.isMockData = action.payload.isMockData;
      })
      .addCase(startLiveThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      .addCase(endLiveThunk.pending, state => {
        state.isUpdating = true;
      })
      .addCase(endLiveThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const endedLive = action.payload.data as LiveSession;
        if (endedLive && endedLive.status === LiveSessionStatus.COMPLETED) {
          const index = state.liveSessions.findIndex(
            s => s.id === endedLive.id,
          );
          if (index >= 0) {
            state.liveSessions[index] = endedLive;
          }
        }
        state.currentLive = null;
        state.isMockData = action.payload.isMockData;
      })
      .addCase(endLiveThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      .addCase(cancelLiveThunk.pending, state => {
        state.isUpdating = true;
      })
      .addCase(cancelLiveThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const cancelled = action.payload.data as LiveSession;
        if (cancelled) {
          const index = state.liveSessions.findIndex(
            s => s.id === cancelled.id,
          );
          if (index >= 0) {
            state.liveSessions[index] = {
              ...state.liveSessions[index],
              status: LiveSessionStatus.CANCELLED,
            };
          }
        }
        state.isMockData = action.payload.isMockData;
      })
      .addCase(cancelLiveThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentLive, updateLiveStats, clearCurrentLive } =
  liveSessionSlice.actions;
export default liveSessionSlice.reducer;

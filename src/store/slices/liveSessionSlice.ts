import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  LiveSession,
  LiveSessionState,
  ScheduleLiveInput,
} from '../../features/availability/domain/liveTypes';
import * as liveSessionRepo from '../../features/availability/data/liveSessionRepository';
import {getErrorMessage} from '../../utils/helpers';

const initialState: LiveSessionState = {
  scheduledLives: [],
  activeLive: null,
  isLoading: false,
  hasLoaded: false,
  listError: null,
  isScheduling: false,
  isStarting: false,
  isEnding: false,
  updatingLiveId: null,
  deletingLiveId: null,
};

export const fetchScheduledLivesThunk = createAsyncThunk<
  LiveSession[],
  void,
  {rejectValue: string}
>('liveSession/fetchScheduled', async (_, {rejectWithValue}) => {
  try {
    return await liveSessionRepo.getMyScheduledLives();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const scheduleLiveThunk = createAsyncThunk<
  LiveSession,
  ScheduleLiveInput,
  {rejectValue: string}
>('liveSession/schedule', async (input, {rejectWithValue}) => {
  try {
    return await liveSessionRepo.scheduleLive(input);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const startLiveThunk = createAsyncThunk<
  LiveSession,
  string,
  {rejectValue: string}
>('liveSession/start', async (title, {rejectWithValue}) => {
  try {
    return await liveSessionRepo.startLive(title);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const endLiveThunk = createAsyncThunk<
  string,
  string,
  {rejectValue: string}
>('liveSession/end', async (streamId, {rejectWithValue}) => {
  try {
    await liveSessionRepo.endLive(streamId);
    return streamId;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateScheduledLiveThunk = createAsyncThunk<
  LiveSession | null,
  {id: string; title: string; scheduledAt: string; scheduledEndAt: string},
  {rejectValue: string}
>(
  'liveSession/updateScheduled',
  async ({id, title, scheduledAt, scheduledEndAt}, {rejectWithValue}) => {
    try {
      return await liveSessionRepo.updateScheduledLive(id, {
        title,
        scheduledAt,
        scheduledEndAt,
      });
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteScheduledLiveThunk = createAsyncThunk<
  boolean,
  string,
  {rejectValue: string}
>('liveSession/deleteScheduled', async (id, {rejectWithValue}) => {
  try {
    return await liveSessionRepo.deleteScheduledLive(id);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const liveSessionSlice = createSlice({
  name: 'liveSession',
  initialState,
  reducers: {
    clearActiveLive: state => {
      state.activeLive = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchScheduledLivesThunk.pending, state => {
        state.isLoading = true;
        state.listError = null;
      })
      .addCase(fetchScheduledLivesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasLoaded = true;
        state.scheduledLives = action.payload;
      })
      .addCase(fetchScheduledLivesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.listError = action.payload ?? 'Failed to load scheduled lives';
      })
      .addCase(scheduleLiveThunk.pending, state => {
        state.isScheduling = true;
      })
      .addCase(scheduleLiveThunk.fulfilled, (state, action) => {
        state.isScheduling = false;
        const session = action.payload;
        const exists = state.scheduledLives.some(
          item => item.id === session.id,
        );
        if (!exists) {
          state.scheduledLives = [session, ...state.scheduledLives];
        } else {
          state.scheduledLives = state.scheduledLives.map(item =>
            item.id === session.id ? session : item,
          );
        }
      })
      .addCase(scheduleLiveThunk.rejected, state => {
        state.isScheduling = false;
      })
      .addCase(startLiveThunk.pending, state => {
        state.isStarting = true;
      })
      .addCase(startLiveThunk.fulfilled, (state, action) => {
        state.isStarting = false;
        state.activeLive = action.payload;
      })
      .addCase(startLiveThunk.rejected, state => {
        state.isStarting = false;
      })
      .addCase(endLiveThunk.pending, state => {
        state.isEnding = true;
      })
      .addCase(endLiveThunk.fulfilled, state => {
        state.isEnding = false;
      })
      .addCase(endLiveThunk.rejected, state => {
        state.isEnding = false;
      })
      .addCase(updateScheduledLiveThunk.pending, (state, action) => {
        state.updatingLiveId = action.meta.arg.id;
      })
      .addCase(updateScheduledLiveThunk.fulfilled, state => {
        state.updatingLiveId = null;
      })
      .addCase(updateScheduledLiveThunk.rejected, state => {
        state.updatingLiveId = null;
      })
      .addCase(deleteScheduledLiveThunk.pending, (state, action) => {
        state.deletingLiveId = action.meta.arg;
      })
      .addCase(deleteScheduledLiveThunk.fulfilled, state => {
        state.deletingLiveId = null;
      })
      .addCase(deleteScheduledLiveThunk.rejected, state => {
        state.deletingLiveId = null;
      });
  },
});

export const {clearActiveLive} = liveSessionSlice.actions;
export default liveSessionSlice.reducer;

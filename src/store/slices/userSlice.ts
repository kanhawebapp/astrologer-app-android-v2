import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { userApi } from '../../services/userService';

interface ChatUserData {
  userId: string;
  userName: string;
  userProfilePic?: string;
}

interface ChatRequestData {
  [key: string]: any;
}

interface UserState {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
  chatUser?: ChatUserData;
  chatRequest?: ChatRequestData;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
};

export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  },
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await userApi.updateProfile(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: state => {
      state.error = null;
    },
    setProfile: (state, action: PayloadAction<User>) => {
      state.profile = action.payload;
    },
    setChatUser: (state, action: PayloadAction<ChatUserData>) => {
      state.chatUser = action.payload;
    },
    clearChatUser: state => {
      state.chatUser = undefined;
    },
    setChatRequest: (state, action: PayloadAction<ChatRequestData>) => {
      state.chatRequest = action.payload;
    },
    clearChatRequest: state => {
      state.chatRequest = undefined;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserError, setProfile, setChatUser, clearChatUser, setChatRequest, clearChatRequest } = userSlice.actions;
export default userSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GlobalState {
  isAppReady: boolean;
  globalLoading: boolean;
  globalError: string | null;
  globalSuccess: string | null;
  networkStatus: 'online' | 'offline';
}

const initialState: GlobalState = {
  isAppReady: false,
  globalLoading: false,
  globalError: null,
  globalSuccess: null,
  networkStatus: 'online',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppReady: state => {
      state.isAppReady = true;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    setGlobalError: (state, action: PayloadAction<string | null>) => {
      state.globalError = action.payload;
    },
    setGlobalSuccess: (state, action: PayloadAction<string | null>) => {
      state.globalSuccess = action.payload;
    },
    setNetworkStatus: (state, action: PayloadAction<'online' | 'offline'>) => {
      state.networkStatus = action.payload;
    },
    clearGlobalMessages: state => {
      state.globalError = null;
      state.globalSuccess = null;
    },
  },
});

export const {
  setAppReady,
  setGlobalLoading,
  setGlobalError,
  setGlobalSuccess,
  setNetworkStatus,
  clearGlobalMessages,
} = appSlice.actions;
export default appSlice.reducer;

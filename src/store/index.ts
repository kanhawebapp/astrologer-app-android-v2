import { configureStore, Middleware } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import userReducer from './slices/userSlice';
import appReducer from './slices/appSlice';
import chatReducer from './slices/chatSlice';
import accountReducer from './slices/accountSlice';
import walletReducer from './slices/walletSlice';
import availabilityReducer from './slices/availabilitySlice';
import liveSessionReducer from './slices/liveSessionSlice';
import liveInteractionReducer from './slices/liveInteractionSlice';
import socketReducer from './slices/socketSlice';
import callReducer from './slices/callSlice';

const logger: Middleware = _store => next => action => {
  if (__DEV__) {
    return next(action);
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    user: userReducer,
    app: appReducer,
    chat: chatReducer,
    account: accountReducer,
    wallet: walletReducer,
    availability: availabilityReducer,
    liveSession: liveSessionReducer,
    liveInteraction: liveInteractionReducer,
    socket: socketReducer,
    call: callReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(logger),
  devTools: __DEV__,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

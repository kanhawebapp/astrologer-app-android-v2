import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  requestOtpThunk,
  verifyOtpThunk,
  logoutThunk,
  restoreSession,
  clearError,
} from '../store/slices/authSlice';
import { socketClient } from '../services/socket';


export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  // const navigation = useNavigation<any>();

  const requestOtp = useCallback(
    async (contactNo: string) => {
      return dispatch(requestOtpThunk(contactNo)).unwrap();
    },
    [dispatch],
  );

  const verifyOtp = useCallback(
    async (contactNo: string, otp: string) => {
      return dispatch(verifyOtpThunk({ contactNo, otp })).unwrap();
    },
    [dispatch],
  );
  
  // const logout = useCallback(async () => {
  //   return dispatch(logoutThunk()).unwrap();
  // }, [dispatch]);

  const logout = useCallback(async () => {
  try {
    await dispatch(logoutThunk()).unwrap();

    // 🔥 VERY IMPORTANT (your app)
    socketClient.disconnectSocket();

  } catch (error) {
    console.log('Logout error:', error);
  }

  
}, [dispatch]);



  const restore = useCallback(async () => {
    // console.log('[AUTH STEP 3] restoreSession Started');
    return dispatch(restoreSession()).unwrap();
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    ...auth,
    requestOtp,
    verifyOtp,
    logout,
    restore,
    clearError: clearAuthError,
  };
};

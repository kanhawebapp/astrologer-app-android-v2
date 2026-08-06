import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, Astrologer } from '../../types';
import { authApi } from '../../services/api/auth/authService';
import { Config } from '../../config/env';
import { logoutApi } from '../../services/api/logoutAstro/logout.service';
import { refreshTokenApi } from '../../services/api/refreshToken/refreshToken.service';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const requestOtpThunk = createAsyncThunk(
  'auth/requestOtp',
  async (contactNo: string, { rejectWithValue }) => {
    try {
      const response = await authApi.requestOtp(contactNo);
      // console.log('=== SEND OTP RESPONSE ===');
      // console.log('Response:', JSON.stringify(response, null, 2));
      // console.log('Message:', response.requestAstrologerOtp.message);
      // console.log('=========================');
      return response.requestAstrologerOtp.message;
    } catch (error: any) {
      // console.log('=== SEND OTP ERROR ===');
      // console.log('Error:', error.message);
      // console.log('=====================');
      return rejectWithValue(error.message || 'Failed to request OTP');
    }
  },
);

export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async (
    { contactNo, otp }: { contactNo: string; otp: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authApi.verifyOtp(contactNo, otp);

      // [LOGIN] Section 1: Login API Response
      // console.log('[LOGIN] Login successful');
      // console.log('[LOGIN] Full login response:', JSON.stringify(response, null, 2));
      const loginData: any = response?.verifyAstrologerOtp;
      // console.log(`[LOGIN] Access Token Exists: ${loginData?.accessToken ? 'YES' : 'NO'}`);
      // console.log(`[LOGIN] Refresh Token Exists: ${loginData?.refreshToken ? 'YES' : 'NO'}`);
      if (loginData?.accessToken) {
        // console.log(`[LOGIN] Access token (first 20): ${loginData.accessToken.substring(0, 20)}...`);
      }
      if (loginData?.refreshToken) {
        // console.log(`[LOGIN] Refresh token (first 20): ${loginData.refreshToken.substring(0, 20)}...`);
      }

      // console.log('=== VERIFY OTP RESPONSE ===');
      // console.log('Response:', JSON.stringify(response, null, 2));
      const { accessToken, refreshToken, astrologer } = response.verifyAstrologerOtp;

      // [LOGIN] Section 4: Storage Keys
      // console.log('[LOGIN] Storage keys used:');
      // console.log(`Config.TOKEN_KEY = ${Config.TOKEN_KEY}`);
      // console.log(`refreshToken key = 'refreshToken'`);

      // [LOGIN] Section 2: Saving Tokens
      // console.log('[LOGIN] Saving access token...');
      // console.log(`[LOGIN] Access token key: ${Config.TOKEN_KEY}`);
      // console.log(`[LOGIN] Access token (first 20): ${accessToken.substring(0, 20)}...`);
      await AsyncStorage.setItem(Config.TOKEN_KEY, accessToken);
      // console.log('[LOGIN] Access token save complete');

      // console.log('[LOGIN] Saving refresh token...');
      // console.log(`[LOGIN] Refresh token key: 'refreshToken'`);
      if (refreshToken) {
        // console.log(`[LOGIN] Refresh token (first 20): ${refreshToken.substring(0, 20)}...`);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        // console.log('[LOGIN] Refresh token save complete');
      } else {
        // console.log('[LOGIN] Refresh token NOT present in login response — nothing to save');
      }

      // [LOGIN] Section 3: Verify Storage
      const verifyAccess = await AsyncStorage.getItem(Config.TOKEN_KEY);
      // console.log(`[LOGIN] Access token verified: ${verifyAccess ? 'YES' : 'NO'}`);
      if (verifyAccess) {
        // console.log(`[LOGIN] Verified access token (first 20): ${verifyAccess.substring(0, 20)}...`);
      }
      const verifyRefresh = await AsyncStorage.getItem('refreshToken');
      // console.log(`[LOGIN] Refresh token verified: ${verifyRefresh ? 'YES' : 'NO'}`);
      if (verifyRefresh) {
        // console.log(`[LOGIN] Verified refresh token (first 20): ${verifyRefresh.substring(0, 20)}...`);
      }

      // console.log('[ASYNCSTORAGE] Writing user data to Config.USER_KEY');
      await AsyncStorage.setItem(Config.USER_KEY, JSON.stringify(astrologer));
      // console.log('[ASYNCSTORAGE] User data write success');

      await AsyncStorage.setItem('@onboarding_done', 'true');
      // console.log('[ONBOARDING] Marking onboarding done');

      return { token: accessToken, user: astrologer };
    } catch (error: any) {
      // console.log('=== VERIFY OTP ERROR ===');
      // console.log('Error:', error.message);
      // console.log('========================');
      return rejectWithValue(error.message || 'OTP verification failed');
    }
  },
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    // console.log('[AUTH] restoreSession started');

    let refreshAPICalled = false;
    let refreshSuccess = false;
    let savedSuccessfully = false;
    let oldAccessToken: string | null = null;
    let newAccessToken: string | null = null;

    try {
      // console.log('[AUTH STEP 4] Reading Tokens from AsyncStorage');
      const token = await AsyncStorage.getItem(Config.TOKEN_KEY);
      // console.log('[ASYNCSTORAGE] Read @auth_token:', token ? 'YES' : 'NO');
      // console.log(`[AUTH] Access token exists: ${token ? 'YES' : 'NO'}`);
      if (token) {
        // console.log(`[ASYNCSTORAGE] Access Token Preview: ${token.substring(0, 20)}...`);
        // console.log(`[AUTH] Access token (first 20): ${token.substring(0, 20)}...`);
      }

      const userData = await AsyncStorage.getItem(Config.USER_KEY);
      // console.log('[ASYNCSTORAGE] Read @user_data:', userData ? 'YES' : 'NO');

      const refreshToken = await AsyncStorage.getItem('refreshToken');
      // console.log('[ASYNCSTORAGE] Read refreshToken:', refreshToken ? 'YES' : 'NO');
      // console.log(`[AUTH] Refresh token exists: ${refreshToken ? 'YES' : 'NO'}`);
      if (refreshToken) {
        // console.log(`[ASYNCSTORAGE] Refresh Token Preview: ${refreshToken.substring(0, 20)}...`);
        // console.log(`[AUTH] Refresh token (first 20): ${refreshToken.substring(0, 20)}...`);
      }

      if (!token || !userData) {
        // console.log('[AUTH STEP 4] No stored session, rejecting');
        return rejectWithValue('No stored session');
      }

      let currentToken = token;
      // console.log(`[AUTH STEP 4] Existing Access Token Preview: ${token.substring(0, 20)}...`);
      oldAccessToken = token;

      // [AUTH] Section 5: App Startup - refresh decision
      // console.log(`[AUTH] Access token exists: ${token ? 'YES' : 'NO'}`);
      // console.log(`[AUTH] Refresh token exists: ${refreshToken ? 'YES' : 'NO'}`);
      if (!refreshToken) {
        // console.log('[AUTH] Refresh token missing. Refresh API will NOT be called.');
      }

      if (refreshToken) {
        // console.log('[AUTH] Refresh token found -> Calling refresh API');
        refreshAPICalled = true;
        // console.log('[AUTH STEP 5] Refresh Token exists, calling refresh API');
        // console.log('[AUTH STEP 5] Calling refreshTokenApi.refreshAstrologerToken()');
        try {
          // console.log('[AUTH] Refresh API request started');
          const response =
            await refreshTokenApi.refreshAstrologerToken();

          // console.log('[AUTH STEP 5] Raw API Response:', JSON.stringify(response, null, 2));
          // console.log('[AUTH] Refresh API raw response:', JSON.stringify(response));
          // console.log('[AUTH STEP 5] Parsed Response:', JSON.stringify(response, null, 2));
          // console.log('[AUTH] Refresh API parsed response:', JSON.stringify(response));

          const result =
            response?.refreshAstrologerToken;

          // console.log('[AUTH] Refresh API success status:', result ? 'YES' : 'NO');
          // console.log('[AUTH STEP 5] New Access Token Received:', result?.accessToken ? 'YES' : 'NO');
          // console.log(`[AUTH] New access token exists: ${result?.accessToken ? 'YES' : 'NO'}`);
          if (result?.accessToken) {
            // console.log(`[AUTH STEP 5] New Access Token Preview: ${result.accessToken.substring(0, 20)}...`);
          }

          if (result?.accessToken) {
            refreshSuccess = true;
            newAccessToken = result.accessToken;
            // console.log(`[AUTH] Old access token (first 20): ${oldAccessToken ? oldAccessToken.substring(0, 20) + '...' : 'null'}`);
            // console.log(`[AUTH] New access token (first 20): ${newAccessToken.substring(0, 20)}...`);
            // console.log(`[AUTH] Access token changed: ${oldAccessToken === newAccessToken ? 'NO' : 'YES'}`);

            currentToken = result.accessToken;
            // console.log('[AUTH] Saving new access token...');
            // console.log('[AUTH STEP 6] Saving New Access Token to AsyncStorage');
            await AsyncStorage.setItem(Config.TOKEN_KEY, currentToken);
            savedSuccessfully = true;
            // console.log('[AUTH STEP 6] Saved New Access Token');

            const savedToken = await AsyncStorage.getItem(Config.TOKEN_KEY);
            // console.log('[AUTH] Saved token verified');
            // console.log(`[AUTH] Saved token (first 20): ${savedToken ? savedToken.substring(0, 20) + '...' : 'null'}`);
            // console.log('[AUTH STEP 6] Re-read Token from AsyncStorage');
            // console.log(`[AUTH STEP 6] Saved Token Preview: ${savedToken ? savedToken.substring(0, 20) + '...' : 'null'}`);
            // console.log(`[AUTH STEP 6] Token Match: ${savedToken === currentToken ? 'YES' : 'NO'}`);
          } else {
            newAccessToken = oldAccessToken;
          }
        } catch (error) {
          // console.log('[AUTH STEP 5] Refresh Token API Error:', error);
          // console.log('[AUTH] Refresh API success status: NO');
          // console.log('[AUTH STEP 5] Continuing with existing token');
          newAccessToken = oldAccessToken;
        }
      } else {
        // console.log('[AUTH] No refresh token -> Skipping refresh');
        newAccessToken = oldAccessToken;
      }

      const user: Astrologer = JSON.parse(userData);
      // console.log(
      //   '[ONBOARDING] Restoring session — marking onboarding done',
      // );
      await AsyncStorage.setItem('@onboarding_done', 'true');
      // console.log('[AUTH STEP 7] Final Token Returning from restoreSession:', currentToken.substring(0, 20) + '...');

      // console.log('========== AUTH SUMMARY ==========');
      // console.log(`Refresh API Called: ${refreshAPICalled ? 'YES' : 'NO'}`);
      // console.log(`Refresh Success: ${refreshSuccess ? 'YES' : 'NO'}`);
      // console.log(`Old Token: ${oldAccessToken ? oldAccessToken.substring(0, 20) + '...' : 'null'}`);
      // console.log(`New Token: ${newAccessToken ? newAccessToken.substring(0, 20) + '...' : 'null'}`);
      // console.log(`Saved Successfully: ${savedSuccessfully ? 'YES' : 'NO'}`);
      // console.log('Redux Updated: YES');
      // console.log('==================================');

      return { token: currentToken, user };
    } catch (error: any) {
      // console.log('[AUTH STEP ERROR] Session restore failed:', error);
      return rejectWithValue(error.message || 'Session restore failed');
    }
  },
);


// export const logoutThunk = createAsyncThunk(
//   'auth/logout',
//   async (_, { rejectWithValue }) => {
//     try {
//       const token =
//         (await AsyncStorage.getItem(Config.TOKEN_KEY)) ||
//         (await AsyncStorage.getItem('accessToken'));

//       if (token) {
//         try {
//           await logoutApi(token);
//           console.log('Server logout success');
//         } catch (e) {
//           console.log('Server logout failed, continue locally');
//         }
//       }

//       await AsyncStorage.multiRemove([
//         Config.TOKEN_KEY,
//         Config.USER_KEY,
//         'accessToken',
//         'refreshToken',
//       ]);

//       console.log('Local logout success');

//       return true;
//     } catch (error: any) {
//       console.log('Logout thunk error:', error);
//       return rejectWithValue(error.message || 'Logout failed');
//     }
//   },
// );

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token =
        (await AsyncStorage.getItem(Config.TOKEN_KEY)) ||
        (await AsyncStorage.getItem('accessToken'));

      // console.log('[ASYNCSTORAGE] Read token from Config.TOKEN_KEY:', token ? 'YES' : 'NO');
      if (token) {
        // console.log(`[ASYNCSTORAGE] Token Preview: ${token.substring(0, 20)}...`);
      }

      if (token) {
        // Existing logout API
        try {
          await logoutApi(token);
          // console.log('Server logout success');
        } catch (e) {
          // console.log('Server logout failed, continue locally');
        }

        //  New GraphQL Logout API
        try {
          const response = await logoutApi.logoutAstrologer();

          // console.log(
          //   'Logout Astrologer Response:',
          //   JSON.stringify(response, null, 2),
          // );

          const result = response?.data?.logoutAstrologer;

          if (result?.success) {
            // console.log(result.message);
          }
        } catch (e) {
          // console.log(
          //   'Logout Astrologer API failed, continue locally:',
          //   e,
          // );
        }
      }

      // Clear local storage
      // console.log('[ASYNCSTORAGE] Clearing storage keys:', [Config.TOKEN_KEY, Config.USER_KEY, 'accessToken', 'refreshToken', '@onboarding_done']);
      await AsyncStorage.multiRemove([
        Config.TOKEN_KEY,
        Config.USER_KEY,
        'accessToken',
        'refreshToken',
        '@onboarding_done',
      ]);

      // console.log('[ASYNCSTORAGE] Storage cleared');

      // console.log('Local logout success');

      return true;
    } catch (error: any) {
      // console.log('Logout thunk error:', error);
      return rejectWithValue(error.message || 'Logout failed');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(requestOtpThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestOtpThunk.fulfilled, state => {
        state.isLoading = false;
      })
      .addCase(requestOtpThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyOtpThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        // console.log('[AUTH STEP 8] Redux Updated');
        // console.log(`[AUTH STEP 8] Token: ${action.payload.token ? action.payload.token.substring(0, 20) + '...' : 'null'}`);
        // console.log(`[AUTH STEP 8] isAuthenticated: true`);
        // console.log('=== OTP VERIFIED - TOKEN SET ===');
        // console.log(
        //   'Token:',
        //   action.payload.token
        //     ? `${action.payload.token.substring(0, 20)}...`
        //     : 'null',
        // );
        // console.log('===================================');
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        // console.log('[AUTH STEP 8] Redux Updated');
        // console.log(`[AUTH STEP 8] Token: ${action.payload.token ? action.payload.token.substring(0, 20) + '...' : 'null'}`);
        // console.log(`[AUTH STEP 8] isAuthenticated: true`);
        // console.log('[AUTH] token returned from restoreSession:', action.payload.token ? `${action.payload.token.substring(0, 20)}...` : 'null');
        // console.log('[AUTH] token stored in Redux:', state.token ? `${state.token.substring(0, 20)}...` : 'null');
        // console.log('[AUTH] isAuthenticated:', state.isAuthenticated);
        // console.log('[AUTH] isInitialized: n/a (not tracked by auth slice)');
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        // console.log('=== RESTORE SESSION ===');
        // console.log(
        //   'Token:',
        //   action.payload.token
        //     ? `${action.payload.token.substring(0, 20)}...`
        //     : 'null',
        // );
        // console.log('======================');
      })
      .addCase(restoreSession.rejected, (state, action) => {
        // console.log('[AUTH STEP 8] Redux Updated');
        // console.log('[AUTH STEP 8] isAuthenticated: false');
        // console.log('[AUTH STEP 8] Token: null');
        // console.log('[AUTH] token returned from restoreSession: null (rejected)');
        // console.log('[AUTH] token stored in Redux:', state.token ? `${state.token.substring(0, 20)}...` : 'null');
        // console.log('[AUTH] isAuthenticated:', state.isAuthenticated);
        // console.log('[AUTH] isInitialized: n/a (not tracked by auth slice)');
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      .addCase(logoutThunk.fulfilled, state => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

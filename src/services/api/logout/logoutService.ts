import AsyncStorage from '@react-native-async-storage/async-storage';
import { logoutApi } from './logoutApi';

export const logoutService = async () => {
  try {
    console.log('=== LOGOUT SERVICE START ===');

    const token = await AsyncStorage.getItem('accessToken');
    console.log('[ASYNCSTORAGE] Read token from accessToken:', token ? 'YES' : 'NO');
    if (token) {
      console.log(`[ASYNCSTORAGE] Token Preview: ${token.substring(0, 20)}...`);
    }

    if (token) {
      try {
        await logoutApi(token);
        console.log('Server logout success');
      } catch (e) {
        console.log('Server logout failed, continue locally');
      }
    }

    // 🔥 Always clear storage
    console.log('[ASYNCSTORAGE] Clearing storage keys: accessToken, refreshToken');
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);

    console.log('[ASYNCSTORAGE] Storage cleared');

    console.log('Local logout done');

    return true;
  } catch (error) {
    console.log('Logout Service Error:', error);
    return false;
  }
};

import { store } from '../store';
import { logoutThunk } from '../store/slices/authSlice';
import { socketClient } from './socket';

let isLogoutInProgress = false;

export const handleUnauthorized = async (): Promise<void> => {
  if (isLogoutInProgress) {
    return;
  }

  isLogoutInProgress = true;

  try {
    console.log('🔐 Unauthorized → Logging out user');

    await store.dispatch(logoutThunk()).unwrap();

    socketClient.disconnectSocket();

    console.log('✅ Session cleared → Redirecting to Login');
  } catch (error) {
    console.log('Error during unauthorized logout:', error);
  } finally {
    isLogoutInProgress = false;
  }
};

export const isUnauthorizedError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const isGraphQLError = error.name === 'GraphQLClientError';
    const isUnauthorized =
      error.message === 'Unauthorized' ||
      error.message.includes('Unauthorized');

    return isGraphQLError && isUnauthorized;
  }
  return false;
};

import { graphqlRequest } from '../../../services/graphqlClient';
import {
  Availability,
  UpdateAvailabilityInput,
  AvailabilityResponse,
} from '../domain/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../../../config/env';

const GET_AVAILABILITY_QUERY = `
  query GetAvailability {
    availability {
      id
      isOnline
      chatEnabled
      callEnabled
      busyMode
      autoAccept
      maxSessions
      currentSessions
      status
      mode
      workingHours {
        start
        end
      }
      autoOfflineMinutes
      doNotDisturbStart
      doNotDisturbEnd
      peakHourSuggestion
      lowResponseWarning
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_AVAILABILITY_MUTATION = `
  mutation UpdateAvailability($input: AvailabilityInput!) {
    updateAvailability(input: $input) {
      id
      isOnline
      chatEnabled
      callEnabled
      busyMode
      autoAccept
      maxSessions
      currentSessions
      status
      mode
      workingHours {
        start
        end
      }
      autoOfflineMinutes
      doNotDisturbStart
      doNotDisturbEnd
      peakHourSuggestion
      lowResponseWarning
      createdAt
      updatedAt
    }
  }
`;

const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(Config.TOKEN_KEY);
    console.log('[ASYNCSTORAGE] Read token from Config.TOKEN_KEY:', token ? 'YES' : 'NO');
    if (token) {
      console.log(`[ASYNCSTORAGE] Token Preview: ${token.substring(0, 20)}...`);
    }
    return token;
  } catch {
    console.log('[ASYNCSTORAGE] Read token from Config.TOKEN_KEY: ERROR');
    return null;
  }
};

export const fetchAvailability = async (): Promise<AvailabilityResponse> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token');
  }
  return graphqlRequest<AvailabilityResponse>({
    query: GET_AVAILABILITY_QUERY,
    token,
  });
};

export const updateAvailability = async (
  input: UpdateAvailabilityInput,
): Promise<AvailabilityResponse> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token');
  }
  return graphqlRequest<AvailabilityResponse>({
    query: UPDATE_AVAILABILITY_MUTATION,
    variables: { input },
    token,
  });
};

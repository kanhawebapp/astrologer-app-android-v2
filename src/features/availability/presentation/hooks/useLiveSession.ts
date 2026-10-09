import { useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../../../../store';
import {
  fetchScheduledLivesThunk,
  scheduleLiveThunk,
  startLiveThunk,
  endLiveThunk,
  clearActiveLive,
} from '../../../../store/slices/liveSessionSlice';
import { LiveSession, ScheduleLiveInput } from '../../domain/liveTypes';
import { useToast } from '../../../../hooks/useToast';
import {
  usePermissions,
  showPermissionDeniedAlert,
} from '../../../../hooks/permissions';
import { getErrorMessage } from '../../../../utils/helpers';
import { RootNavigationProp } from '../../../../navigation/types';
import { liveLog } from '../../data/liveLogger';

export const useMediaPermissions = () => {
  const { checkPermissions, requestPermissions, openSettings } =
    usePermissions();

  const ensureMediaPermissions = useCallback(async (): Promise<boolean> => {
    // iOS prompts when Agora first captures media; denial surfaces via Agora callbacks.
    if (Platform.OS !== 'android') {
      liveLog('Permission request skipped: handled by Agora on iOS');
      return true;
    }
    const current = await checkPermissions();
    if (current.camera === 'granted' && current.microphone === 'granted') {
      liveLog('Permission check', { camera: 'granted', microphone: 'granted' });
      return true;
    }
    const requested = await requestPermissions();
    liveLog('Permission request result', {
      camera: requested.camera,
      microphone: requested.microphone,
    });
    return requested.camera === 'granted' && requested.microphone === 'granted';
  }, [checkPermissions, requestPermissions]);

  return { ensureMediaPermissions, openSettings };
};

export const useEndLive = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useToast();
  const activeLiveId = useSelector(
    (state: RootState) => state.liveSession.activeLive?.id,
  );
  const isEnding = useSelector((state: RootState) => state.liveSession.isEnding);
  const endingRef = useRef(false);

  const endSession = useCallback(
    async (session: LiveSession, onEnded?: () => void) => {
      if (endingRef.current) {
        return;
      }
      endingRef.current = true;
      try {
        await dispatch(endLiveThunk(session.id)).unwrap();
        onEnded?.();
        if (activeLiveId === session.id) {
          dispatch(clearActiveLive());
        }
        liveLog('EndLive cleanup completed', { streamId: session.id });
        showSuccess('Live session ended');
        dispatch(fetchScheduledLivesThunk());
      } catch (error) {
        showError(getErrorMessage(error), 'Could not end live');
      } finally {
        endingRef.current = false;
      }
    },
    [activeLiveId, dispatch, showError, showSuccess],
  );

  const confirmEndLive = useCallback(
    (session: LiveSession, onEnded?: () => void) => {
      if (endingRef.current) {
        return;
      }
      Alert.alert(
        'End Live Session',
        `Are you sure you want to end "${session.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'End Live',
            style: 'destructive',
            onPress: () => {
              endSession(session, onEnded);
            },
          },
        ],
      );
    },
    [endSession],
  );

  return { confirmEndLive, isEnding };
};

export const useLiveSession = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<RootNavigationProp>();
  const { showSuccess, showError } = useToast();
  const { ensureMediaPermissions, openSettings } = useMediaPermissions();
  const { confirmEndLive, isEnding } = useEndLive();
  const {
    scheduledLives,
    activeLive,
    isLoading,
    hasLoaded,
    listError,
    isScheduling,
    isStarting,
  } = useSelector((state: RootState) => state.liveSession);
  const startingRef = useRef(false);

  const refresh = useCallback(() => {
    dispatch(fetchScheduledLivesThunk());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const openBroadcast = useCallback(
    (session: LiveSession) => {
      navigation.navigate('LiveBroadcast', { streamId: session.id });
    },
    [navigation],
  );

  const startLive = useCallback(
    async (title: string): Promise<boolean> => {
      const trimmed = title.trim();
      if (!trimmed) {
        showError('Please enter a title for your live session.');
        return false;
      }
      if (startingRef.current || activeLive) {
        return false;
      }
      startingRef.current = true;
      try {
        if (!(await ensureMediaPermissions())) {
          showPermissionDeniedAlert(openSettings);
          return false;
        }
        const session = await dispatch(startLiveThunk(trimmed)).unwrap();
        refresh();
        openBroadcast(session);
        return true;
      } catch (error) {
        showError(getErrorMessage(error), 'Could not start live');
        return false;
      } finally {
        startingRef.current = false;
      }
    },
    [
      activeLive,
      dispatch,
      ensureMediaPermissions,
      openSettings,
      openBroadcast,
      refresh,
      showError,
    ],
  );

  const scheduleLive = useCallback(
    async (input: ScheduleLiveInput): Promise<boolean> => {
      const title = input.title.trim();
      const scheduledAt = new Date(input.scheduledAt);
      if (!title) {
        showError('Please enter a title for your live session.');
        return false;
      }
      if (isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
        showError('Please select a future date and time.');
        return false;
      }
      try {
        await dispatch(
          scheduleLiveThunk({ title, scheduledAt: scheduledAt.toISOString() }),
        ).unwrap();
        showSuccess('Live session scheduled');
        refresh();
        return true;
      } catch (error) {
        showError(getErrorMessage(error), 'Could not schedule live');
        return false;
      }
    },
    [dispatch, refresh, showError, showSuccess],
  );

  return {
    scheduledLives,
    activeLive,
    isLoading,
    hasLoaded,
    listError,
    isScheduling,
    isStarting,
    isEnding,
    scheduleLive,
    startLive,
    openBroadcast,
    confirmEndLive,
    refresh,
  };
};

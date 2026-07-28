import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../store';
import {
  fetchLiveSessionsThunk,
  fetchCurrentLiveThunk,
  scheduleLiveThunk,
  startLiveThunk,
  endLiveThunk,
  cancelLiveThunk,
  clearError,
} from '../../../../store/slices/liveSessionSlice';
import { ScheduleLiveInput } from '../../domain/liveTypes';
import { useToast } from '../../../../hooks/useToast';

export const useLiveSession = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useToast();
  const {
    liveSessions,
    currentLive,
    isLoading,
    isUpdating,
    error,
    isMockData,
  } = useSelector((state: RootState) => state.liveSession);

  const [elapsedTime, setElapsedTime] = useState(0);

  const loadLiveSessions = useCallback(() => {
    dispatch(fetchLiveSessionsThunk());
    dispatch(fetchCurrentLiveThunk());
  }, [dispatch]);

  useEffect(() => {
    loadLiveSessions();
  }, [loadLiveSessions]);

  useEffect(() => {
    if (error) {
      showError(error, 'Live Session Error');
      dispatch(clearError());
    }
  }, [error, dispatch, showError]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (currentLive?.startedAt && currentLive.status === 'LIVE') {
      interval = setInterval(() => {
        const startTime = new Date(currentLive.startedAt!).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentLive]);

  const scheduledSessions = liveSessions.filter(s => s.status === 'SCHEDULED');
  const completedSessions = liveSessions.filter(s => s.status === 'COMPLETED');

  const scheduleLive = useCallback(
    async (input: ScheduleLiveInput) => {
      await dispatch(scheduleLiveThunk(input));
      showSuccess('Live session scheduled successfully');
    },
    [dispatch, showSuccess],
  );

  const goLiveNow = useCallback(
    async (sessionId?: string) => {
      await dispatch(startLiveThunk(sessionId));
      showSuccess('You are now live!');
    },
    [dispatch, showSuccess],
  );

  const endLive = useCallback(
    async (sessionId: string) => {
      await dispatch(endLiveThunk(sessionId));
      showSuccess('Live session ended');
    },
    [dispatch, showSuccess],
  );

  const cancelScheduledLive = useCallback(
    async (sessionId: string) => {
      await dispatch(cancelLiveThunk(sessionId));
      showSuccess('Live session cancelled');
    },
    [dispatch, showSuccess],
  );

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    liveSessions,
    currentLive,
    scheduledSessions,
    completedSessions,
    isLoading,
    isUpdating,
    isMockData,
    elapsedTime,
    formattedDuration: formatDuration(elapsedTime),
    scheduleLive,
    goLiveNow,
    endLive,
    cancelScheduledLive,
    refresh: loadLiveSessions,
  };
};

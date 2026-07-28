import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { RootState, AppDispatch } from '../../../../store';
import { decrementSessionTime } from '../../../../store/slices/chatSlice';

export const useChatTimer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeSession = useSelector(
    (state: RootState) => state.chat.activeSession,
    shallowEqual,
  );
  const chatStatus = useSelector(
    (state: RootState) => state.chat.chatStatus,
    shallowEqual,
  ); 

  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      dispatch(decrementSessionTime());
    }, 1000);
  }, [dispatch]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pauseTimer = useCallback(() => {
    stopTimer();
  }, [stopTimer]);

  const resumeTimer = useCallback(() => {
    if (activeSession && activeSession.remainingTime > 0) {
      startTimer();
    }
  }, [activeSession, startTimer]);

  useEffect(() => {
    if (
      chatStatus === 'ACTIVE' &&
      activeSession &&
      activeSession.remainingTime > 0
    ) {
      startTimer();
    } else {
      stopTimer();
    }

    return () => {
      stopTimer();
    };
  }, [chatStatus, activeSession?.sessionId, startTimer, stopTimer]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const isTimeLow = useCallback((): boolean => {
    return activeSession !== null && activeSession.remainingTime <= 60;
  }, [activeSession]);

  const isTimeCritical = useCallback((): boolean => {
    return activeSession !== null && activeSession.remainingTime <= 30;
  }, [activeSession]);

  const getProgress = useCallback((): number => {
    if (!activeSession || activeSession.maximumTime === 0) return 0;
    return (activeSession.remainingTime / activeSession.maximumTime) * 100;
  }, [activeSession]);

  return {
    remainingTime: activeSession?.remainingTime ?? 0,
    maximumTime: activeSession?.maximumTime ?? 0,
    formattedTime: formatTime(activeSession?.remainingTime ?? 0),
    isTimeLow: isTimeLow(),
    isTimeCritical: isTimeCritical(),
    progress: getProgress(),
    isActive: chatStatus === 'ACTIVE',
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    formatTime,
  };
};

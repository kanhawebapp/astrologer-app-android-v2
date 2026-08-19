import { useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { RootState, AppDispatch } from '../../../../store';
import { decrementSessionTime, updateSessionTime } from '../../../../store/slices/chatSlice';

export const useChatTimer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Timestamp (ms) when app entered background; null when app is active.
  const bgTimestampRef = useRef<number | null>(null);
  // Always holds the latest remainingTime so the AppState handler avoids
  // a stale closure without needing it as a dependency.
  const remainingTimeRef = useRef<number>(0);

  const activeSession = useSelector(
    (state: RootState) => state.chat.activeSession,
    shallowEqual,
  );
  const chatStatus = useSelector(
    (state: RootState) => state.chat.chatStatus,
    shallowEqual,
  );

  // Keep remainingTimeRef in sync on every render.
  remainingTimeRef.current = activeSession?.remainingTime ?? 0;
  console.log('[CHAT_DEBUG] hook=useChatTimer render', {
    appState: AppState.currentState,
    roomId: activeSession?.roomId,
    activeChat: !!activeSession,
    chatStatus,
    displayTime: activeSession?.remainingTime,
    startTime: activeSession?.startedAt,
    endTime: activeSession?.startedAt
      ? activeSession.startedAt + (activeSession.remainingTime ?? 0) * 1000
      : null,
    remainingTime: activeSession?.remainingTime,
    timerId: intervalRef.current,
    intervalRunning: !!intervalRef.current,
  });

  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      console.log(
        '[TIMER_DEBUG] tick | intervalRunning: true | remainingTime:',
        remainingTimeRef.current,
      );
      dispatch(decrementSessionTime());
    }, 1000);
    console.log('[TIMER_DEBUG] startTimer called | intervalRef set');
  }, [dispatch]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      console.log('[TIMER_DEBUG] stopTimer called — clearing interval');
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
    console.log('[TIMER_DEBUG] timer effect fired | chatStatus:', chatStatus, '| sessionId:', activeSession?.sessionId, '| remainingTime:', activeSession?.remainingTime);
    if (
      chatStatus === 'ACTIVE' &&
      activeSession &&
      activeSession.remainingTime > 0
    ) {
      startTimer();
    } else {
      console.log('[TIMER_DEBUG] timer effect — NOT starting timer | chatStatus:', chatStatus, '| activeSession:', !!activeSession, '| remainingTime:', activeSession?.remainingTime);
      stopTimer();
    }

    return () => {
      console.log('[TIMER_DEBUG] timer effect cleanup (stopTimer) | chatStatus:', chatStatus, '| sessionId:', activeSession?.sessionId);
      stopTimer();
    };
  }, [chatStatus, activeSession?.sessionId, startTimer, stopTimer]);

  // AppState listener: account for time spent in background.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      console.log('[TIMER_DEBUG] AppState changed to:', nextState, '| chatStatus (closure):', chatStatus, '| remainingTime:', remainingTimeRef.current, '| intervalRunning:', !!intervalRef.current);
      if (nextState === 'background' || nextState === 'inactive') {
        // Record when we left foreground.
        bgTimestampRef.current = Date.now();
      } else if (nextState === 'active') {
        if (bgTimestampRef.current !== null) {
          const elapsedSec = Math.floor(
            (Date.now() - bgTimestampRef.current) / 1000,
          );
          const corrected = Math.max(0, remainingTimeRef.current - elapsedSec);
          console.log('[TIMER_DEBUG] foreground | chatStatus:', chatStatus, '| elapsedSec:', elapsedSec, '| remainingBefore:', remainingTimeRef.current, '| corrected:', corrected, '| intervalRunning:', !!intervalRef.current);
          if (chatStatus === 'ACTIVE') {
            dispatch(updateSessionTime(corrected));
          } else {
            console.log('[TIMER_DEBUG] foreground — chatStatus is NOT ACTIVE, skipping updateSessionTime. chatStatus:', chatStatus);
          }
        }
        bgTimestampRef.current = null;
      }
    });
    return () => subscription.remove();
    // chatStatus intentionally in deps so the closure captures the latest status.
  }, [chatStatus, dispatch]);

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

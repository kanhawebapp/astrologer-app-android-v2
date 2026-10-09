import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import {
  joinLiveAsPublisher,
  parseLiveTimestamp,
} from '../../data/liveSessionRepository';
import { getErrorMessage } from '../../../../utils/helpers';
import { useAgoraBroadcast } from './useAgoraBroadcast';
import { useEndLive, useMediaPermissions } from './useLiveSession';

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

export const useLiveBroadcast = (streamId: string) => {
  const activeLive = useSelector(
    (state: RootState) => state.liveSession.activeLive,
  );
  const session = activeLive?.id === streamId ? activeLive : null;
  const agora = useAgoraBroadcast();
  const { start: startBroadcast, leave: leaveBroadcast } = agora;
  const { ensureMediaPermissions, openSettings } = useMediaPermissions();
  const { confirmEndLive, isEnding } = useEndLive();

  const [isJoining, setIsJoining] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const joiningRef = useRef(false);
  const autoStartedRef = useRef(false);

  const connect = useCallback(async () => {
    if (!session || joiningRef.current) {
      return;
    }
    joiningRef.current = true;
    setIsJoining(true);
    setConnectError(null);
    setPermissionBlocked(false);
    try {
      if (!(await ensureMediaPermissions())) {
        setPermissionBlocked(true);
        setConnectError(
          'Camera and microphone access are required to broadcast.',
        );
        return;
      }
      const credentials = await joinLiveAsPublisher(session.channelName);
      await startBroadcast(credentials);
    } catch (error) {
      setConnectError(getErrorMessage(error));
    } finally {
      joiningRef.current = false;
      setIsJoining(false);
    }
  }, [session, ensureMediaPermissions, startBroadcast]);

  useEffect(() => {
    if (session && !autoStartedRef.current) {
      autoStartedRef.current = true;
      connect();
    }
  }, [session, connect]);

  const isBroadcasting = agora.broadcastState === 'live';

  useEffect(() => {
    const startedAt = parseLiveTimestamp(session?.createdAt);
    if (!isBroadcasting || !startedAt) {
      setElapsedSeconds(0);
      return;
    }
    const tick = () =>
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000)),
      );
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isBroadcasting, session?.createdAt]);

  const endLive = useCallback(
    (onEnded: () => void) => {
      if (!session) {
        return;
      }
      confirmEndLive(session, () => {
        leaveBroadcast();
        onEnded();
      });
    },
    [session, confirmEndLive, leaveBroadcast],
  );

  return {
    session,
    broadcastState: agora.broadcastState,
    error: agora.broadcastError ?? connectError,
    permissionDenied: permissionBlocked || agora.permissionDenied,
    hasPreview: agora.hasEngine,
    isLocalVideoReady: agora.isLocalVideoReady,
    isJoining,
    isEnding,
    isMicMuted: agora.isMicMuted,
    isCameraOff: agora.isCameraOff,
    formattedDuration: formatDuration(elapsedSeconds),
    toggleMic: agora.toggleMic,
    toggleCamera: agora.toggleCamera,
    switchCamera: agora.switchCamera,
    retry: connect,
    openSettings,
    endLive,
  };
};

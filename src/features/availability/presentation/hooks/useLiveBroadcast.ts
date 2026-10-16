import {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../../../../store';
import {
  joinLiveAsPublisher,
  parseLiveTimestamp,
  toLiveChatCredentials,
} from '../../data/liveSessionRepository';
import {LiveChatCredentials} from '../../domain/liveTypes';
import {getErrorMessage} from '../../../../utils/helpers';
import {useAgoraBroadcast} from './useAgoraBroadcast';
import {useEndLive, useMediaPermissions} from './useLiveSession';

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

const isSameChatRoom = (
  a: LiveChatCredentials | null,
  b: LiveChatCredentials | null,
): boolean =>
  !!a &&
  !!b &&
  a.chatAppKey === b.chatAppKey &&
  a.chatUserId === b.chatUserId &&
  a.chatRoomId === b.chatRoomId;

export const useLiveBroadcast = (streamId: string) => {
  const activeLive = useSelector(
    (state: RootState) => state.liveSession.activeLive,
  );
  const session = activeLive?.id === streamId ? activeLive : null;
  const chatSenderName = useSelector(
    (state: RootState) =>
      state.account.profile?.displayName?.trim() ||
      state.account.profile?.name?.trim() ||
      state.auth.user?.name?.trim() ||
      undefined,
  );
  const agora = useAgoraBroadcast();
  const {start: startBroadcast, leave: leaveBroadcast} = agora;
  const {ensureMediaPermissions, openSettings} = useMediaPermissions();
  const {confirmEndLive, isEnding} = useEndLive();

  const [isJoining, setIsJoining] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [chatCredentials, setChatCredentials] =
    useState<LiveChatCredentials | null>(null);
  const [isChatUnavailable, setIsChatUnavailable] = useState(false);
  const joiningRef = useRef(false);
  const autoStartedRef = useRef(false);
  const channelName = session?.channelName;

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
      const nextChat = toLiveChatCredentials(credentials);
      setIsChatUnavailable(nextChat === null);
      // Keep the existing chat connection when an RTC retry returns the same room.
      setChatCredentials(prev =>
        isSameChatRoom(prev, nextChat) ? prev : nextChat,
      );
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
        setChatCredentials(null);
        leaveBroadcast();
        onEnded();
      });
    },
    [session, confirmEndLive, leaveBroadcast],
  );

  const refreshChatCredentials = useCallback(async () => {
    if (!channelName) {
      throw new Error('Live session is no longer active');
    }
    const fresh = toLiveChatCredentials(await joinLiveAsPublisher(channelName));
    if (!fresh) {
      throw new Error('Server did not return chat credentials');
    }
    return fresh;
  }, [channelName]);

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
    /** Unique remote RTC UIDs in the channel (excludes local broadcaster). */
    rtcViewerCount: agora.viewerCount,
    formattedDuration: formatDuration(elapsedSeconds),
    toggleMic: agora.toggleMic,
    toggleCamera: agora.toggleCamera,
    switchCamera: agora.switchCamera,
    retry: connect,
    openSettings,
    endLive,
    chatCredentials: session ? chatCredentials : null,
    isChatUnavailable,
    chatSenderName,
    refreshChatCredentials,
  };
};

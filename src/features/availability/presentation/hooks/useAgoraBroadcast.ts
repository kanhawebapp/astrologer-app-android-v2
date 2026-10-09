import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  ConnectionChangedReasonType,
  ConnectionStateType,
  IRtcEngine,
  IRtcEngineEventHandler,
  LocalAudioStreamReason,
  LocalAudioStreamState,
  LocalVideoStreamReason,
  LocalVideoStreamState,
} from 'react-native-agora';
import { JoinLiveCredentials } from '../../domain/liveTypes';
import { getErrorMessage } from '../../../../utils/helpers';
import {
  describeError,
  liveLog,
  liveWarn,
} from '../../data/liveLogger';

export type BroadcastState =
  | 'idle'
  | 'connecting'
  | 'live'
  | 'reconnecting'
  | 'failed';

const describeConnectionFailure = (
  reason: ConnectionChangedReasonType,
): string => {
  switch (reason) {
    case ConnectionChangedReasonType.ConnectionChangedInvalidAppId:
    case ConnectionChangedReasonType.ConnectionChangedInconsistentAppid:
      return 'Invalid streaming App ID received from server.';
    case ConnectionChangedReasonType.ConnectionChangedInvalidToken:
      return 'Invalid streaming token received from server.';
    case ConnectionChangedReasonType.ConnectionChangedTokenExpired:
      return 'Streaming token expired. Please reconnect.';
    case ConnectionChangedReasonType.ConnectionChangedInvalidChannelName:
      return 'Invalid live channel name.';
    case ConnectionChangedReasonType.ConnectionChangedBannedByServer:
    case ConnectionChangedReasonType.ConnectionChangedRejectedByServer:
      return 'Streaming server rejected the connection.';
    case ConnectionChangedReasonType.ConnectionChangedJoinFailed:
      return 'Could not join the live channel.';
    default:
      return `Live connection failed (reason ${reason}).`;
  }
};

export const useAgoraBroadcast = () => {
  const engineRef = useRef<IRtcEngine | null>(null);
  const handlerRef = useRef<IRtcEngineEventHandler | null>(null);
  const isStartingRef = useRef(false);
  const [broadcastState, setBroadcastState] = useState<BroadcastState>('idle');
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  // RtcSurfaceView binds via setupLocalVideo only once on mount, so it must not mount before the engine is initialized.
  const [isLocalVideoReady, setIsLocalVideoReady] = useState(false);

  const releaseEngine = useCallback(() => {
    const engine = engineRef.current;
    engineRef.current = null;
    setIsLocalVideoReady(false);
    if (!engine) {
      return;
    }
    try {
      if (handlerRef.current) {
        engine.unregisterEventHandler(handlerRef.current);
      }
      engine.stopPreview();
      engine.leaveChannel();
      engine.release();
      liveLog('Agora engine released');
    } catch (error) {
      liveWarn('Agora engine release failed', describeError(error));
    }
    handlerRef.current = null;
  }, []);

  const start = useCallback(
    async (credentials: JoinLiveCredentials) => {
      if (isStartingRef.current) {
        liveWarn('Agora start ignored: already starting');
        return;
      }
      isStartingRef.current = true;
      releaseEngine();
      setBroadcastError(null);
      setPermissionDenied(false);
      setBroadcastState('connecting');
      setIsMicMuted(false);
      setIsCameraOff(false);

      try {
        liveLog('Agora initialization started');
        const engine = createAgoraRtcEngine();
        const initResult = engine.initialize({
          appId: credentials.appId,
          channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
        });
        if (initResult < 0) {
          throw new Error(
            `Streaming engine failed to start (code ${initResult}).`,
          );
        }
        liveLog('Agora initialization succeeded');
        engineRef.current = engine;

        const handler: IRtcEngineEventHandler = {
          onJoinChannelSuccess: (_connection, elapsed) => {
            liveLog('Agora channel join succeeded', { elapsedMs: elapsed });
            setBroadcastState('live');
          },
          onRejoinChannelSuccess: (_connection, elapsed) => {
            liveLog('Agora channel rejoin succeeded', { elapsedMs: elapsed });
          },
          onLeaveChannel: () => {
            liveLog('Agora channel left');
          },
          onError: (err, msg) => {
            liveWarn('Agora error', { code: err, message: msg });
          },
          onConnectionStateChanged: (_connection, state, reason) => {
            liveLog('Agora connection state changed', { state, reason });
            if (state === ConnectionStateType.ConnectionStateConnected) {
              setBroadcastState('live');
              setBroadcastError(null);
            } else if (
              state === ConnectionStateType.ConnectionStateReconnecting
            ) {
              setBroadcastState('reconnecting');
            } else if (state === ConnectionStateType.ConnectionStateFailed) {
              setBroadcastState('failed');
              setBroadcastError(describeConnectionFailure(reason));
              // Agora must not be released from inside its own callback.
              setTimeout(() => {
                if (engineRef.current === engine) {
                  releaseEngine();
                }
              }, 0);
            }
          },
          onLocalVideoStateChanged: (source, state, reason) => {
            liveLog('Camera state changed', { source, state, reason });
            if (state === LocalVideoStreamState.LocalVideoStreamStateFailed) {
              const noPermission =
                reason ===
                LocalVideoStreamReason.LocalVideoStreamReasonDeviceNoPermission;
              setPermissionDenied(prev => prev || noPermission);
              setBroadcastError(
                noPermission
                  ? 'Camera permission is denied. Enable it in Settings to broadcast video.'
                  : `Camera could not be started (reason ${reason}).`,
              );
            }
          },
          onLocalAudioStateChanged: (_connection, state, reason) => {
            liveLog('Microphone state changed', { state, reason });
            if (state === LocalAudioStreamState.LocalAudioStreamStateFailed) {
              const noPermission =
                reason ===
                LocalAudioStreamReason.LocalAudioStreamReasonDeviceNoPermission;
              setPermissionDenied(prev => prev || noPermission);
              setBroadcastError(
                noPermission
                  ? 'Microphone permission is denied. Enable it in Settings to broadcast audio.'
                  : `Microphone could not be started (reason ${reason}).`,
              );
            }
          },
        };
        engine.registerEventHandler(handler);
        handlerRef.current = handler;

        const roleResult = engine.setClientRole(
          ClientRoleType.ClientRoleBroadcaster,
        );
        const videoResult = engine.enableVideo();
        engine.enableAudio();
        liveLog('Video enabled', { roleResult, videoResult });
        const previewResult = engine.startPreview();
        if (previewResult < 0) {
          liveWarn('Camera preview failed to start', { code: previewResult });
        } else {
          liveLog('Camera preview started');
        }
        setIsLocalVideoReady(true);
        liveLog('Local video view ready');

        liveLog('Agora channel join started', {
          hasChannelName: credentials.channelName.length > 0,
          role: 'broadcaster',
        });
        const joinResult = engine.joinChannel(
          credentials.token,
          credentials.channelName,
          credentials.uid,
          {
            channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
            clientRoleType: ClientRoleType.ClientRoleBroadcaster,
            publishCameraTrack: true,
            publishMicrophoneTrack: true,
            autoSubscribeAudio: false,
            autoSubscribeVideo: false,
          },
        );
        if (joinResult < 0) {
          throw new Error(
            `Could not join the live channel (code ${joinResult}).`,
          );
        }
      } catch (error) {
        liveWarn('Agora start failed', describeError(error));
        releaseEngine();
        setBroadcastState('failed');
        setBroadcastError(getErrorMessage(error));
      } finally {
        isStartingRef.current = false;
      }
    },
    [releaseEngine],
  );

  const leave = useCallback(() => {
    releaseEngine();
    setBroadcastState('idle');
    setBroadcastError(null);
    setPermissionDenied(false);
    setIsMicMuted(false);
    setIsCameraOff(false);
  }, [releaseEngine]);

  const toggleMic = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    const next = !isMicMuted;
    const result = engine.muteLocalAudioStream(next);
    liveLog('Microphone toggled', { muted: next, result });
    if (result === 0) {
      setIsMicMuted(next);
    }
  }, [isMicMuted]);

  const toggleCamera = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    const next = !isCameraOff;
    const result = engine.enableLocalVideo(!next);
    liveLog('Camera toggled', {
      cameraOffBefore: isCameraOff,
      cameraOffAfter: result === 0 ? next : isCameraOff,
      result,
    });
    if (result === 0) {
      setIsCameraOff(next);
    }
  }, [isCameraOff]);

  const switchCamera = useCallback(() => {
    const result = engineRef.current?.switchCamera();
    liveLog('Camera switched', { result });
  }, []);

  // Release media on unmount; the server-side session is intentionally left running.
  useEffect(() => releaseEngine, [releaseEngine]);

  return {
    broadcastState,
    broadcastError,
    permissionDenied,
    isMicMuted,
    isCameraOff,
    isLocalVideoReady,
    hasEngine: broadcastState !== 'idle' && broadcastState !== 'failed',
    start,
    leave,
    toggleMic,
    toggleCamera,
    switchCamera,
  };
};

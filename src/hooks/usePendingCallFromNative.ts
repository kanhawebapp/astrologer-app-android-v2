import {useEffect, useRef} from 'react';
import {AppState, AppStateStatus, NativeModules} from 'react-native';
import {store} from '../store';
import {
  setRoomId,
  setCallId,
  setCallerId,
  setParticipant,
  setCallState,
  setCallTime,
  setError,
} from '../store/slices/callSlice';
import {ringtoneManager} from '../services/call/ringtoneManager';
import {callSocketEmitters} from '../features/call/data/callSocketEmitters';
import {triggerAccept} from '../services/call/callAcceptTrigger';
import {
  handleChatAcceptFromNative,
  handleChatRejectFromNative,
} from '../components/common/chatRequestCardNativeHandlers';
import {socketManager} from '../services/socket/socketManager';
import {navigationService} from '../services/navigation/navigationService';

const DEBUG_PREFIX = '[PendingCallFromNative]';

export const usePendingCallFromNative = () => {
  const processedRef = useRef(false);
  const mountedRef = useRef(false);

  const processPending = async () => {
    if (!mountedRef.current || processedRef.current) {
      return;
    }

    const CallNotificationModule = NativeModules.CallNotificationModule as
      | {
          getPendingAction: () => Promise<{
            action: string;
            data: Record<string, any>;
          } | null>;
          clearPendingAction: () => Promise<void>;
        }
      | undefined;

    if (!CallNotificationModule?.getPendingAction) {
      return;
    }

    try {
      const pending = await CallNotificationModule.getPendingAction();
      if (!mountedRef.current || !pending?.action) {
        return;
      }

      console.log('[TRACE 3] pending raw');
      console.log(JSON.stringify(pending, null, 2));

      processedRef.current = true;
      console.log(
        `${DEBUG_PREFIX} Processing pending action: ${pending.action}`,
      );
      console.log(
        `${DEBUG_PREFIX} [DEBUG] pending.action read from native = "${pending.action}"`,
      );
      console.log(
        `${DEBUG_PREFIX} [DEBUG] pending.data keys = ${Object.keys(
          pending.data || {},
        ).join(', ')}`,
      );

      if (pending.action === 'call_request') {
        console.log(`${DEBUG_PREFIX} [DEBUG] -> calling handleCallRequest`);
        handleCallRequest(pending.data);
      } else if (pending.action === 'com.dhwaniastrologer.ACCEPT_CALL') {
        console.log(`${DEBUG_PREFIX} [DEBUG] -> calling handleAcceptCall`);
        handleAcceptCall(pending.data);
      } else if (pending.action === 'com.dhwaniastrologer.REJECT_CALL') {
        console.log(`${DEBUG_PREFIX} [DEBUG] -> calling handleRejectRequest`);
        handleRejectRequest(pending.data);
      } else if (pending.action === 'com.dhwaniastrologer.ACCEPT_CHAT') {
        console.log(`${DEBUG_PREFIX} [DEBUG] -> calling handleAcceptChat`);
        handleAcceptChat(pending.data);
      } else if (pending.action === 'com.dhwaniastrologer.REJECT_CHAT') {
        console.log(`${DEBUG_PREFIX} [DEBUG] -> calling handleRejectChat`);
        handleRejectChat(pending.data);
      } else {
        console.log(
          `${DEBUG_PREFIX} [DEBUG] -> NO HANDLER for action "${pending.action}"`,
        );
      }

      try {
        await CallNotificationModule.clearPendingAction();
      } catch (e) {
        console.log(`${DEBUG_PREFIX} clearPendingAction error:`, e);
      }
    } catch (e) {
      console.log(`${DEBUG_PREFIX} Error reading pending action:`, e);
    }
  };

  const handleCallRequest = (data: Record<string, any>): void => {
    const receiverId = data.receiverId || data.receiver_id || data.receiverid;
    const callerId = data.callerId || data.caller_id;
    const roomId = data.room_id || data.roomId;
    const callId = data.callId || data.call_id;
    const callTime =
      data.callTime || data.call_time || Number(data.maximumTime) || 0;
    const callerName =
      data.callerName ||
      data.caller_name ||
      data.userName ||
      data.user_name ||
      'Unknown';
    const callerAvatar =
      data.callerAvatar ||
      data.caller_avatar ||
      data.userAvatar ||
      data.user_avatar;

    const astroId = store.getState().auth.user?.id;
    if (receiverId && astroId && receiverId !== astroId) {
      console.log(`${DEBUG_PREFIX} call_request: receiver mismatch, ignoring`);
      return;
    }

    const currentCallState = store.getState().call.callState;
    if (
      currentCallState === 'ringing' ||
      currentCallState === 'connecting' ||
      currentCallState === 'connected'
    ) {
      console.log(
        `${DEBUG_PREFIX} call_request: call UI already active, ignoring`,
      );
      return;
    }

    store.dispatch(setRoomId(roomId));
    store.dispatch(setCallId(callId));
    store.dispatch(setCallerId(callerId));
    store.dispatch(
      setParticipant({id: callerId, name: callerName, avatar: callerAvatar}),
    );
    store.dispatch(setCallState('ringing'));
    store.dispatch(setError(null));
    store.dispatch(setCallTime(Number(callTime) * 60));

    ringtoneManager.startRingtone();

    console.log(
      `${DEBUG_PREFIX} call_request: dispatched incoming call UI for room ${roomId}`,
    );

    console.log(
      `${DEBUG_PREFIX} Pending call restored (call_request) for room ${roomId}`,
    );
    navigationService.navigateWhenReady('IncomingCallFullscreen', {
      roomId,
      callId,
      callerId,
      callerName,
      callTime: Number(callTime),
    });
  };

  const handleAcceptCall = async (data: Record<string, any>) => {
    const roomId = data.roomId || data.room_id;
    const callId = data.callId || data.call_id;
    const callerName =
      data.callerName ||
      data.caller_name ||
      data.userName ||
      data.user_name ||
      'Unknown';
    const callerId = data.callerId || data.caller_id;
    const callTime =
      data.callTime || data.call_time || Number(data.maximumTime) || 0;

    if (!roomId) {
      console.log(`${DEBUG_PREFIX} accept: missing roomId, ignoring`);
      return;
    }

    ringtoneManager.stopRingtone();

    store.dispatch(setRoomId(roomId));
    store.dispatch(setCallId(callId));
    store.dispatch(setCallerId(callerId));
    store.dispatch(
      setParticipant({id: callerId, name: callerName, avatar: undefined}),
    );
    store.dispatch(setCallState('ringing'));
    store.dispatch(setError(null));
    store.dispatch(setCallTime(Number(callTime) * 60));

    console.log(
      `${DEBUG_PREFIX} Pending call restored (ACCEPT_CALL) for room ${roomId}`,
    );
    console.log(
      `${DEBUG_PREFIX} Pending call data: callTime(notif)=${JSON.stringify(
        data.callTime ?? data.call_time ?? data.maximumTime ?? null,
      )} resolvedCallTimeMin=${callTime} storedSeconds=${
        Number(callTime) * 60
      }`,
    );

    // Open the incoming call UI as soon as navigation is ready. The screen
    // registers the accept trigger that triggerAccept() below invokes, so the
    // auto-accept from the notification button goes through the exact same
    // handler as an in-app Accept press.
    navigationService.navigateWhenReady('IncomingCallFullscreen', {
      roomId,
      callId,
      callerId,
      callerName,
      callTime: Number(callTime),
    });

    console.log(
      `${DEBUG_PREFIX} accept: prepared call state for room ${roomId}, waiting for socket ready`,
    );

    // Guarantee the socket is connected AND the OneSignal `register` emit has
    // completed before starting the accept flow. Otherwise join_call /
    // callAcceptedByAstrologer are emitted on a reconnecting socket and lost.
    // This mirrors the chat notification click flow's "wait until socket ready"
    // sequencing (connectAndWait -> connected -> register) without retrying
    // emits blindly. Zero delay when the socket is already connected+registered.
    await socketManager.ensureSocketReady();

    // Wait until navigation is fully initialized so the IncomingCallFullscreen
    // screen is mounted and its accept trigger registered. Without this the
    // triggerAccept() retry window (20 x 100ms) can be exhausted on a slow cold
    // launch and the accepted call is silently dropped.
    await navigationService.waitUntilReady();

    console.log(`${DEBUG_PREFIX} PendingCall accept starts`);

    triggerAccept();
  };

  const handleRejectRequest = (data: Record<string, any> | undefined): void => {
    if (!data || typeof data !== 'object') {
      return;
    }

    const roomId = data.roomId || data.room_id;

    if (!roomId) {
      console.log(`${DEBUG_PREFIX} reject: missing roomId, ignoring`);
      return;
    }

    const astroId = (store.getState().auth.user as any)?.id;

    ringtoneManager.stopRingtone();

    if (astroId) {
      callSocketEmitters
        .rejectCall(astroId, roomId)
        .catch(err => console.log(`${DEBUG_PREFIX} reject socket error:`, err));
    }

    store.dispatch(setCallState('idle'));
  };

  const handleAcceptChat = async (data: Record<string, any>): Promise<void> => {
    // Must behave exactly like pressing ChatRequestCard "Accept".
    // Business logic lives in ChatRequestCard handlers.
    ringtoneManager.stopRingtone();
    console.log('[TRACE 3A] pending.data');
    console.log(JSON.stringify(data, null, 2));
    handleChatAcceptFromNative(data);
  };

  const handleRejectChat = async (
    data: Record<string, any> | undefined,
  ): Promise<void> => {
    // Must behave exactly like pressing ChatRequestCard "Reject".
    // Business logic lives in ChatRequestCard handlers.
    if (!data || typeof data !== 'object') {
      return;
    }
    ringtoneManager.stopRingtone();
    handleChatRejectFromNative(data);
  };

  useEffect(() => {
    mountedRef.current = true;

    processPending();

    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          processedRef.current = false;
          processPending();
        }
      },
    );

    return () => {
      mountedRef.current = false;
      subscription.remove();
    };
  }, []);
};

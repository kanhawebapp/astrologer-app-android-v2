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

// Cold start: the Decline tap launches the app and processPending() runs on
// mount, but auth (restoreSession) hydrates asynchronously and the socket is
// not connected yet. These waits make the reject emit happen only once the
// prerequisites exist (otherwise rejectCall is silently skipped/dropped).

const waitForAuthUserId = (timeoutMs = 15000): Promise<string | null> => {
  return new Promise(resolve => {
    const getUserId = (): string | null =>
      (store.getState().auth.user as {id?: string} | null)?.id ?? null;

    const existing = getUserId();
    if (existing) {
      resolve(existing);
      return;
    }

    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let unsubscribe: () => void = () => {};

    unsubscribe = store.subscribe(() => {
      if (settled) {
        return;
      }
      const userId = getUserId();
      if (userId) {
        settled = true;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        unsubscribe();
        resolve(userId);
      }
    });

    timeoutId = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      unsubscribe();
      resolve(null);
    }, timeoutMs);
  });
};

const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  onTimeout?: () => void,
): Promise<T | null> => {
  return new Promise(resolve => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      onTimeout?.();
      resolve(null);
    }, timeoutMs);
    promise.then(
      value => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeoutId);
        resolve(value);
      },
      error => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeoutId);
        console.log(`${DEBUG_PREFIX} withTimeout: promise rejected`, error);
        resolve(null);
      },
    );
  });
};

export const usePendingCallFromNative = () => {
  const processedRef = useRef(false);
  const mountedRef = useRef(false);
  const processingRef = useRef(false);

  const processPending = async () => {
    if (!mountedRef.current || processedRef.current || processingRef.current) {
      return;
    }

    processingRef.current = true;

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
      processingRef.current = false;
      return;
    }

    try {
      const pending = await CallNotificationModule.getPendingAction();
      console.log(
        `[REJECT_FLOW] getPendingAction() resolved at ${new Date().toISOString()}`,
      );
      console.log("🚀 Pending =", JSON.stringify(pending, null, 2));
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
        await handleRejectRequest(pending.data);
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
    } finally {
      processingRef.current = false;
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

    console.log("🔥 handleAcceptCall");
console.log(JSON.stringify(data, null, 2));

console.log("maximumTime ===", data.maximumTime);
console.log("callTime ===", data.callTime);

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

  const handleRejectRequest = async (
    data: Record<string, any> | undefined,
  ): Promise<void> => {
    if (!data || typeof data !== 'object') {
      return;
    }

    const roomId = data.roomId || data.room_id;

    if (!roomId) {
      console.log(`${DEBUG_PREFIX} reject: missing roomId, ignoring`);
      return;
    }

    console.log(
      `[REJECT_FLOW] handleRejectRequest entered at ${new Date().toISOString()} roomId=${roomId} callState=${
        store.getState().call.callState
      }`,
    );

    ringtoneManager.stopRingtone();

    // Cold start: auth is not hydrated yet, so astroId may be null here.
    // Wait for hydration before emitting (fall back to the notification
    // payload's astrologerId as a secondary source).
    const astroId =
      (await waitForAuthUserId()) || data.astrologerId || data.astro_id;

    if (!astroId) {
      console.log(
        `${DEBUG_PREFIX} reject: astroId unavailable after auth wait, aborting reject emit`,
      );
      store.dispatch(setCallState('idle'));
      return;
    }

    console.log(
      `[REJECT_FLOW] astroId=${astroId} (auth hydrated after cold start)`,
    );

    // socketManager.emit() silently drops the packet when the socket is not
    // connected. Wait until it is connected (and registered) before sending
    // call_cancel_by_astrologer.
    console.log(
      `[REJECT_FLOW] Waiting for socket ready... connected=${socketManager.isConnected()} at ${new Date().toISOString()}`,
    );
    await withTimeout(socketManager.ensureSocketReady(), 25000, () => {
      console.log(
        `${DEBUG_PREFIX} reject: socket not ready within 25s, proceeding anyway`,
      );
    });

    console.log(
      `[REJECT_FLOW] Emitting call_cancel_by_astrologer at ${new Date().toISOString()} roomId=${roomId} socketConnected=${socketManager.isConnected()}`,
    );
    try {
      await callSocketEmitters.rejectCall(astroId, roomId);
      console.log(
        `[REJECT_FLOW] call_cancel_by_astrologer emitted successfully roomId=${roomId}`,
      );
    } catch (error) {
      console.log(`${DEBUG_PREFIX} reject socket error:`, error);
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

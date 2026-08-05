import {Platform} from 'react-native';
import {store} from '../store';
import {NativeModules} from 'react-native';
import {addChatRequest} from '../store/slices/chatSlice';
import {
  setRoomId,
  setCallId,
  setCallerId,
  setParticipant,
  setCallState,
  setCallTime,
  setError,
  resetCall,
} from '../store/slices/callSlice';
import {ringtoneManager} from '../services/call/ringtoneManager';
import {callSocketEmitters} from '../features/call/data/callSocketEmitters';
import {navigationService} from '../services/navigation/navigationService';

const DEBUG_PREFIX = '[NotificationRequestHandler]';

export const handleRejectRequest = (
  data: Record<string, any> | undefined,
): void => {
  if (!data || typeof data !== 'object') {
    return;
  }

  const roomId = data.roomId || data.room_id;
  const callId = data.callId || data.call_id;

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

  store.dispatch(resetCall());

  if (Platform.OS === 'android') {
    setTimeout(() => {
      const CallNotificationModule = NativeModules.CallNotificationModule as
        | {minimizeApp: () => Promise<void>}
        | undefined;
      CallNotificationModule?.minimizeApp?.().catch((e: any) =>
        console.log('[NotificationRequestHandler] minimize error:', e),
      );
    }, 500);
  }
};

export const handleRequestNotification = (
  additionalData: Record<string, any> | undefined,
): void => {
  console.log('[TRACE 2] handleRequestNotification');
  console.log(JSON.stringify(additionalData, null, 2));

  if (!additionalData || typeof additionalData !== 'object') {
    return;
  }

  const type =
    additionalData.type ||
    additionalData.notificationType ||
    additionalData.requestType;

  if (type === 'chat_request') {
    handleChatRequest(additionalData);
  } else if (type === 'call_request') {
    handleCallRequest(additionalData);
  } else {
    console.log(`${DEBUG_PREFIX} Unhandled notification type:`, type);
  }
};

const handleChatRequest = (data: Record<string, any>): void => {
  // Backend OneSignal additionalData is NOW the exact same normalized
  // ChatRequest the foreground socket flow uses. Dispatch it as-is so Redux
  // (latestRequest + chatStatus=REQUEST) drives the SAME ChatRequestCard.
  const {roomId, sessionId, userId, astrologerId} = data;
  if (!roomId || !sessionId || !userId || !astrologerId) {
    console.log(
      `${DEBUG_PREFIX} chat_request: missing required fields, ignoring`,
    );
    return;
  }

  const astroId = store.getState().auth.user?.id;
  if (!astroId || astroId !== astrologerId) {
    console.log(`${DEBUG_PREFIX} chat_request: astrologer mismatch, ignoring`);
    return;
  }

  console.log('[TRACE 2A] dispatching');
  console.log(JSON.stringify(data, null, 2));

  store.dispatch(addChatRequest(data as any));
  console.log(
    `${DEBUG_PREFIX} chat_request: dispatched incoming chat UI for session ${sessionId}`,
  );
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
    `${DEBUG_PREFIX} Pending call restored (notification click) for room ${roomId}`,
  );
  navigationService.navigateWhenReady('IncomingCallFullscreen', {
    roomId,
    callId,
    callerId,
    callerName,
    callTime: Number(callTime),
  });
};

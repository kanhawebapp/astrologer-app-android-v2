import {store} from '../../store';
import {addChatRequest} from '../../store/slices/chatSlice';
import {
  triggerAcceptChat,
  triggerRejectChat,
} from './chatRequestCardTriggers';
import {ringtoneManager} from '../../services/call/ringtoneManager';
import { setChatRequest } from '../../store/slices/userSlice';

// The backend OneSignal additionalData is NOW the exact same normalized
// ChatRequest used by the foreground socket flow. We therefore feed that
// object straight into Redux (latestRequest + chatStatus=REQUEST) and then
// let ChatRequestCard's registered trigger run the EXACT SAME accept/reject
// handlers the in-app popup buttons use. No duplicated socket/business logic.

// Wait one tick so the freshly dispatched latestRequest propagates and
// ChatRequestCard re-registers its trigger with the new closure, THEN fire
// the trigger. The trigger mechanism itself falls back to retries if the
// registration has not completed yet.
const fireAfterTriggerRegistered = (fire: () => void): void => {
  setTimeout(fire, 100);
};

const isCompleteChatRequest = (data: Record<string, any>): boolean => {
  const roomId = data.roomId || data.room_id || '';
  let sessionId = data.sessionId || data.session_id || '';
  if (!sessionId && roomId) {
    sessionId = `session_${roomId}`;
  }

  const normalized = {
    ...data,
    roomId,
    sessionId,
  };

  console.log('[CHAT_REQUEST_CHECK]', {
    roomId: normalized.roomId,
    sessionId: normalized.sessionId,
    userId: normalized.userId,
    astrologerId: normalized.astrologerId,
    maximumTime: normalized.maximumTime,
    pricePerMinute: normalized.pricePerMinute,
    callerId: normalized.callerId,
    callId: normalized.callId,
    issue: normalized.issue,
  });

  if (!data) {
    console.log('[CHAT_REQUEST_CHECK] FAIL: data is null/undefined');
    return false;
  }

  if (!normalized.roomId) {
    console.log('[CHAT_REQUEST_CHECK] FAIL: missing roomId');
    return false;
  }

  if (!normalized.userId) {
    console.log('[CHAT_REQUEST_CHECK] FAIL: missing userId');
    return false;
  }

  if (!normalized.astrologerId) {
    console.log('[CHAT_REQUEST_CHECK] FAIL: missing astrologerId');
    return false;
  }

  console.log('[TRACE 5]');
  console.log(JSON.stringify(normalized, null, 2));
  console.log({
    roomId: normalized.roomId,
    sessionId: normalized.sessionId,
    userId: normalized.userId,
    astrologerId: normalized.astrologerId,
  });

  return true;
};

// export const handleChatAcceptFromNative = async (
//   data: Record<string, any>,
// ): Promise<void> => {
//   console.log('[TRACE 4] received',data);
//   console.log(JSON.stringify(data, null, 2));

//   console.log('[NATIVE_HANDLERS] handleChatAcceptFromNative START');
//   console.log(
//     '[NATIVE_HANDLERS] [DEBUG] data keys =',
//     Object.keys(data).join(', '),
//   );

//   ringtoneManager.stopRingtone();

//   console.log('[TRACE 4A]');
//   console.log({
//     roomId: data.roomId,
//     sessionId: data.sessionId,
//     userId: data.userId,
//     astrologerId: data.astrologerId,
//     maximumTime: data.maximumTime,
//     pricePerMinute: data.pricePerMinute,
//   });

//   // sessionId is OPTIONAL. Reuse the exact convention from addChatRequest():
//   // generate it before any validation or trigger execution.
//   if (!data.sessionId) {
//     data.sessionId = `session_${data.roomId}`;
//   }

//   if (!isCompleteChatRequest(data)) {
//     console.log(
//       '[NATIVE_HANDLERS] ABORT accept: incomplete ChatRequest payload',
//     );
//     return;
//   }

//   // Reuse the SAME ChatRequest object the foreground flow uses.
//   // addChatRequest sets latestRequest AND chatStatus='REQUEST'.
//   store.dispatch(addChatRequest(data as any));

//   console.log(
//     '[NATIVE_HANDLERS] [DEBUG] dispatched addChatRequest, invoking accept trigger',
//   );

//   // Runs ChatRequestCard.handleAccept() -> navigation + acceptChatAstrologer().
//   fireAfterTriggerRegistered(triggerAcceptChat);
// };


export const handleChatAcceptFromNative = async (
  data: Record<string, any>,
): Promise<void> => {
  console.log('[TRACE 4] received', data);
  console.log('[TRACE 4] JSON', JSON.stringify(data, null, 2));

  console.log('[NATIVE_HANDLERS] handleChatAcceptFromNative START');
  console.log(
    '[NATIVE_HANDLERS] [DEBUG] data keys =',
    Object.keys(data).join(', '),
  );

  ringtoneManager.stopRingtone();

  // sessionId fallback
  if (!data.sessionId) {
    data.sessionId = `session_${data.roomId}`;
  }

  // Normalize native data
  const chatRequestData = {
    ...data,

    roomId: data.roomId ?? data.room_id ?? '',
    sessionId: data.sessionId ?? data.session_id ?? '',
    userId: data.userId ?? data.user_id ?? '',
    astrologerId: data.astrologerId ?? data.astrologer_id ?? data.astro_id ?? '',

    userName: data.userName ?? data.user_name ?? '',
    maximumTime: data.maximumTime ?? data.maximum_time ?? '',
    pricePerMinute: data.pricePerMinute ?? data.price_per_minute ?? '',

    // NEW CHAT USER DETAILS
    occupation: data.occupation ?? '',
    gender: data.gender ?? '',
    dateOfBirth: data.dateOfBirth ?? data.date_of_birth ?? '',
    timeOfBirth: data.timeOfBirth ?? data.time_of_birth ?? '',
    location: data.location ?? '',
  };

  console.log('[TRACE 4A] ChatRequest data:', {
    roomId: chatRequestData.roomId,
    sessionId: chatRequestData.sessionId,
    userId: chatRequestData.userId,
    astrologerId: chatRequestData.astrologerId,
    userName: chatRequestData.userName,
    maximumTime: chatRequestData.maximumTime,
    pricePerMinute: chatRequestData.pricePerMinute,

    // NEW
    occupation: chatRequestData.occupation,
    gender: chatRequestData.gender,
    dateOfBirth: chatRequestData.dateOfBirth,
     timeOfBirth: chatRequestData.timeOfBirth,

    location: chatRequestData.location,
  });

  if (!isCompleteChatRequest(chatRequestData)) {
    console.log(
      '[NATIVE_HANDLERS] ABORT accept: incomplete ChatRequest payload',
    );
    return;
  }

  // Existing chat request state
  store.dispatch(addChatRequest(chatRequestData as any));

  // Also update userSlice chatRequest
  store.dispatch(
    setChatRequest(chatRequestData as any),
  );

  console.log(
    '[NATIVE_HANDLERS] [DEBUG] setChatRequest dispatched',
    JSON.stringify(chatRequestData, null, 2),
  );

  console.log(
    '[NATIVE_HANDLERS] [DEBUG] dispatched addChatRequest + setChatRequest, invoking accept trigger',
  );

  fireAfterTriggerRegistered(triggerAcceptChat);
};


export const handleChatRejectFromNative = async (
  data: Record<string, any> | undefined,
): Promise<void> => {
  console.log('[NATIVE_HANDLERS] handleChatRejectFromNative START',data);
  console.log(
    '[NATIVE_HANDLERS] [DEBUG] data keys =',
    data ? Object.keys(data).join(', ') : 'none',
  );

  if (!data || typeof data !== 'object') {
    return;
  }

  ringtoneManager.stopRingtone();

  if (!isCompleteChatRequest(data)) {
    console.log(
      '[NATIVE_HANDLERS] ABORT reject: incomplete ChatRequest payload',
    );
    return;
  }

  // Reuse the SAME ChatRequest object the foreground flow uses.
  store.dispatch(addChatRequest(data as any));

  console.log(
    '[NATIVE_HANDLERS] [DEBUG] dispatched addChatRequest, invoking reject trigger',
  );

  // Runs ChatRequestCard.handleReject() -> rejectChat().
  fireAfterTriggerRegistered(triggerRejectChat);
};

import { socketClient } from '../../../services/socket/socketClient';
import { socketManager } from '../../../services/socket/socketManager';
import { ChatSocketEvents } from '../domain/chatEvents';
import {
  normalizeChatRequest,
  normalizeSocketEvent,
  isValidRoomId,
} from '../utils/chatUtils';
import { store } from '../../../store';
import type { RootState } from '../../../store';
import { setChatUser, setChatRequest } from '../../../store/slices/userSlice';
import { callbackManager, ChatSocketCallbacks } from './callbackManager';
import { debounceManager } from './debounceManager';
import { roomSessionManager } from './roomSessionManager';

const REQUIRED_CHAT_EVENTS = [
  'new_chat_request',
  'chat_started_astrologer',
  'receive_message',
  'typing',
  'completed_chat',
  'leave_chat',
  'user_disconnected',
  'chat_cancel_by_user',
] as const;

const processedChatRequests: Set<string> = new Set();

const createTypingHandler = (eventType: 'start' | 'stop') => {
  return (data: any) => {
    // console.log(
    //   `[chatSocketService] 📥 EVENT: "${
    //     eventType === 'start'
    //       ? ChatSocketEvents.TYPING_START
    //       : ChatSocketEvents.TYPING_STOP
    //   }"`,
    //   data,
    // );
    callbackManager.invokeCallbacks(
      eventType === 'start' ? 'onTypingStart' : 'onTypingStop',
      data,
    );
  };
};

const createBasicEventHandler = (
  eventName: string,
  callbackKey: keyof ChatSocketCallbacks,
) => {
  return (data: any) => {
    // console.log(`[chatSocketService] 📥 EVENT: "${eventName}"`, data);
    callbackManager.invokeCallbacks(callbackKey, data);
  };
};

const setupNewChatRequestHandler = () => {
  return (data: any) => {

    // commented 1sep
    // const rootState = store.getState() as RootState;
    // const activeSession = rootState.chat.activeSession;

    // // Guard against stale events during an active/ended session.
    // // If we already have an active session and the incoming request doesn't match,
    // // ignore it to avoid stale popup/state flicker.
    // const incomingSessionId =
    //   data?.sessionId || data?.session_id || data?.sessionID || null;
    // if (activeSession?.sessionId && incomingSessionId) {
    //   if (incomingSessionId !== activeSession.sessionId) {
    //     return;
    //   }
    // }

     const rootStateGuard = store.getState() as RootState;
    const activeSessionGuard = rootStateGuard.chat.activeSession;
    const incomingSessionIdGuard =
      data?.session_id || data?.sessionId || data?.sessionID || null;
    const incomingRoomIdGuard =
      data?.room_id || data?.roomId || data?.roomID || data?.roomid || null;
    if (activeSessionGuard?.sessionId) {
      if (incomingSessionIdGuard && incomingSessionIdGuard !== activeSessionGuard.sessionId) {
        return;
      }
      if (incomingRoomIdGuard && incomingRoomIdGuard !== activeSessionGuard.roomId) {
        return;
      }
    }


    // console.log(
    //   `[chatSocketService] 📥 [SOCKET FLOW TRACE] EVENT: "${ChatSocketEvents.NEW_CHAT_REQUEST}"`,
    // );
    // console.log(`   🔍 Raw payload:`, JSON.stringify(data, null, 2));
    // console.log(`   🔍 Raw keys:`, data ? Object.keys(data) : 'none');

    const normalized = normalizeChatRequest(data);
    if (!normalized) {
      // console.log(
      //   `[chatSocketService] ❌ normalizeChatRequest returned null for new_chat_request!`,
      // );
      // console.log(
      //   `   🔍 Raw data that failed:`,
      //   JSON.stringify(data, null, 2),
      // );
      return;
    }

    // console.log(`   ✅ Normalized:`, JSON.stringify(normalized, null, 2));

    const dedupeKey = `new_request_${normalized.roomId}_${normalized.sessionId}`;

    if (debounceManager.isDuplicate(dedupeKey, processedChatRequests)) {
      // console.log(
      //   `[chatSocketService] ⏭️ Skipping duplicate request: ${dedupeKey}`,
      // );
      return;
    }

    if (!debounceManager.shouldProcess(dedupeKey)) {
      // console.log(
      //   `[chatSocketService] ⏭️ Skipping debounced request: ${dedupeKey}`,
      // );
      return;
    }

    // console.log(`[chatSocketService] ✅ Storing user data globally`);
    store.dispatch(
      setChatUser({
        userId: normalized.userId,
        userName: normalized.userName,
        userProfilePic: normalized.userProfilePic,
      }),
    );
    
    // Store full raw data for debugging
    // console.log(`[chatSocketService] ✅ Storing full chat request data globally`);
    store.dispatch(
      setChatRequest(data),
    );

    // console.log(`[chatSocketService] ✅ Invoking onNewChatRequest callback`);
    callbackManager.invokeCallbacks('onNewChatRequest', normalized);

    roomSessionManager.setRoomSession(normalized.roomId, {
      sessionId: normalized.sessionId,
      userId: normalized.userId,
      userName: normalized.userName,
      astrologerId: normalized.astrologerId,
    });
  };
};

const setupChatStartedHandler = () => {
  return (data: any) => {
    // Guard stale chat_started_astrologer events
    const rootStateGuard = store.getState() as RootState;
    const activeSessionGuard = rootStateGuard.chat.activeSession;
    const incomingSessionIdGuard =
      data?.session_id || data?.sessionId || data?.sessionID || null;
    const incomingRoomIdGuard =
      data?.room_id || data?.roomId || data?.roomID || data?.roomid || null;
    if (activeSessionGuard?.sessionId) {
      if (incomingSessionIdGuard && incomingSessionIdGuard !== activeSessionGuard.sessionId) {
        return;
      }
      if (incomingRoomIdGuard && incomingRoomIdGuard !== activeSessionGuard.roomId) {
        return;
      }
    }

    // console.log(
    //   `[chatSocketService] 📥 [SOCKET FLOW TRACE] EVENT: "${ChatSocketEvents.CHAT_STARTED_ASTROLOGER}"`,
    // );
    // console.log(
    //   `   🔍 [BEFORE_NORMALIZATION] Raw payload:`,
    //   JSON.stringify(data, null, 2),
    // );
    // console.log(
    //   `   🔍 [BEFORE_NORMALIZATION] Raw keys:`,
    //   data ? Object.keys(data) : 'none',
    // );

    const rawRoomId =
      data?.room_id || data?.roomId || data?.roomID || data?.roomid || '';
    // console.log(
    //   `   🔍 [BEFORE_NORMALIZATION] Extracted room_id: "${rawRoomId}"`,
    // );

    const rootState = store.getState() as RootState;
    const activeSessionFromStore = rootState.chat.activeSession;

    if (activeSessionFromStore?.roomId === rawRoomId) {
      // console.log(
      //   `[chatSocketService] ⏭️ [GUARD] Active session already exists for roomId: ${rawRoomId}. Timer must NOT be reset. Skipping event.`,
      // );
      return;
    }

    const roomSessionFallback = rawRoomId
      ? roomSessionManager.getRoomSession(rawRoomId)
      : undefined;
    if (roomSessionFallback) {
      // console.log(
      //   `   🔍 [BEFORE_NORMALIZATION] Found roomSessionMap entry:`,
      //   roomSessionFallback,
      // );
    }

    const { isValid, normalized, error } = normalizeSocketEvent(
      ChatSocketEvents.CHAT_STARTED_ASTROLOGER,
      data,
    );

    // console.log(`   🔍 [AFTER_NORMALIZATION] Validation result:`, {
    //   isValid,
    //   error,
    // });
    // console.log(
    //   `   🔍 [AFTER_NORMALIZATION] Normalized object:`,
    //   JSON.stringify(normalized, null, 2),
    // );

    if (!isValid || !normalized || !isValidRoomId(normalized?.room_id)) {
      // console.log(
      //   `[chatSocketService] ❌ [VALIDATION_FAILED] chat_started_astrologer validation FAILED!`,
      // );
      // console.log(`   🔍 Error: ${error}`);
      // console.log(
      //   `   🔍 [AFTER_NORMALIZATION] Raw data that failed:`,
      //   JSON.stringify(data, null, 2),
      // );
      return;
    }

    const chatRequestsList = rootState.chat.chatRequests;
    const roomSessionEntry = roomSessionManager.getRoomSession(
      normalized.room_id,
    );
    const matchingRequest = chatRequestsList.find(
      r => r.roomId === normalized.room_id,
    );

    const enhancedRoomId = normalized.room_id;

    const incomingSessionId =
      normalized.session_id ||
      data?.session_id ||
      data?.sessionId ||
      data?.sessionID ||
      '';
    const finalSessionId =
      incomingSessionId ||
      activeSessionFromStore?.sessionId ||
      roomSessionEntry?.sessionId ||
      matchingRequest?.sessionId ||
      `session_${enhancedRoomId}`;

    const incomingSenderId =
      normalized.sender_id ||
      data?.sender_id ||
      data?.senderId ||
      data?.senderID ||
      '';
    const incomingAstrologerDirect =
      data?.astrologerId || data?.astrologer_id || data?.astro_id || '';
    const finalSenderId =
      incomingSenderId ||
      incomingAstrologerDirect ||
      activeSessionFromStore?.astrologerId ||
      roomSessionEntry?.astrologerId ||
      matchingRequest?.astrologerId ||
      '';

    const incomingReceiverId =
      normalized.receiver_id ||
      data?.receiver_id ||
      data?.receiverId ||
      data?.receiverID ||
      '';
    const finalReceiverId =
      incomingReceiverId ||
      activeSessionFromStore?.userId ||
      roomSessionEntry?.userId ||
      matchingRequest?.userId ||
      '';

    if (!finalSessionId) {
      // console.log(
      //   `[chatSocketService] ❌ [MISSING_CRITICAL] session_id missing after all fallbacks!`,
      // );
    }
    if (!finalSenderId) {
      // console.log(
      //   `[chatSocketService] ❌ [MISSING_CRITICAL] sender_id missing after all fallbacks!`,
      // );
    }
    if (!finalReceiverId) {
      // console.log(
      //   `[chatSocketService] ❌ [MISSING_CRITICAL] receiver_id missing after all fallbacks!`,
      // );
    }

    const enhancedNormalized = {
      ...normalized,
      room_id: enhancedRoomId,
      session_id: finalSessionId,
      sender_id: finalSenderId,
      receiver_id: finalReceiverId,
      astrologerId: finalSenderId,
      user_id: finalReceiverId,
      userId: finalReceiverId,
    };

    // console.log(
    //   `   🔍 [AFTER_ENHANCEMENT] Enhanced normalized data:`,
    //   JSON.stringify(enhancedNormalized, null, 2),
    // );

    const criticalMissing = [];
    if (!enhancedNormalized.room_id) criticalMissing.push('room_id');
    if (!enhancedNormalized.session_id) criticalMissing.push('session_id');
    if (!enhancedNormalized.sender_id) criticalMissing.push('sender_id');
    if (!enhancedNormalized.receiver_id) criticalMissing.push('receiver_id');

    if (criticalMissing.length > 0) {
      // console.log(
      //   `[chatSocketService] ❌ [CRITICAL_MISSING_FIELDS] Cannot dispatch - missing: ${criticalMissing.join(
      //     ', ',
      //   )}`,
      // );
      // console.log(
      //   `   🔍 All fallback sources exhausted. Original data:`,
      //   JSON.stringify(data, null, 2),
      // );
      return;
    }

    // console.log(
    //   `[chatSocketService] ✅ [BEFORE_DISPATCH] All critical fields validated.`,
    //   {
    //     room_id: enhancedNormalized.room_id,
    //     session_id: enhancedNormalized.session_id,
    //     sender_id: enhancedNormalized.sender_id,
    //     receiver_id: enhancedNormalized.receiver_id,
    //   },
    // );

    // console.log(
    //   `[chatSocketService] ✅ [AFTER_DISPATCH] Invoking onChatStarted callback`,
    // );
    callbackManager.invokeCallbacks('onChatStarted', enhancedNormalized);
  };
};

const setupReceiveMessageHandler = () => {
  return async (data: any) => {
    // console.log(`🔥 MESSAGE RECEIVED:`, data);

    const rootState = store.getState() as RootState;
    const activeSession = rootState.chat.activeSession;

    const incomingRoomId = data?.room_id || data?.roomId || '';
    const incomingSessionId =
      data?.session_id ||
      data?.sessionId ||
      data?.sessionID ||
      null;

    // Guard: ignore receive_message for stale session.
    if (activeSession?.sessionId) {
      if (incomingSessionId && incomingSessionId !== activeSession.sessionId) {
        return;
      }
      if (incomingRoomId && incomingRoomId !== activeSession.roomId) {
        return;
      }
    }

    const roomId = incomingRoomId || activeSession?.roomId || '';

    const finalMessage = {
      ...data,
      room_id: roomId,
      session_id:
        data?.session_id || activeSession?.sessionId || `session_${roomId}`,
      sender_id: data?.sender_id || activeSession?.userId || 'unknown_sender',
      receiver_id:
        data?.receiver_id || activeSession?.astrologerId || 'unknown_receiver',
      message: data?.message || '[EMPTY]',
      createdAt: Date.now(),
      replyTo: data?.replyTo || null,
    };

    // console.log('✅ FINAL MESSAGE:', finalMessage);

    callbackManager.invokeCallbacks('onReceiveMessage', finalMessage);
  };
};

const setupChatCancelByUserHandler = () => {
  return (data: any) => {
    console.log('[CHAT_CANCEL_HANDLER_RAW]', data);

    const rootState = store.getState() as RootState;
    const activeSession = rootState.chat.activeSession;

    const incomingSessionId =
      data?.session_id ||
      data?.sessionId ||
      data?.sessionID ||
      null;

    const incomingRoomId =
      data?.room_id ||
      data?.roomid ||
      data?.roomId ||
      null;

    console.log('[CHAT_CANCEL_HANDLER_PARSED]', {
      incomingSessionId,
      incomingRoomId,
      activeRoomId: activeSession?.roomId,
      activeSessionId: activeSession?.sessionId,
    });

    // If server provides sessionId, reject stale session events.
    if (
      activeSession?.sessionId &&
      incomingSessionId &&
      incomingSessionId !== activeSession.sessionId
    ) {
      return;
    }

    const normalizedData = {
      ...data,
      room_id: incomingRoomId,
      session_id: incomingSessionId,
      status: data?.status || 'rejected',
      message:
        data?.message || 'User has cancelled the chat request',
    };

    callbackManager.invokeCallbacks(
      'onChatCancelByUser',
      normalizedData,
    );
  };
};

export const setupEventHandlers = async (): Promise<void> => {
  await socketManager.connect();
  const socket = await socketClient.getSocket();

  // Make setup idempotent: remove existing listeners for all known events.
  const EVENTS_TO_SETUP = [
    ChatSocketEvents.NEW_CHAT_REQUEST,
    ChatSocketEvents.CHAT_STARTED_ASTROLOGER,
    'receive_message',
    ChatSocketEvents.TYPING_START,
    ChatSocketEvents.COMPLETED_CHAT,
    ChatSocketEvents.LEAVE_CHAT,
    ChatSocketEvents.USER_DISCONNECTED,
    ChatSocketEvents.CHAT_REJECT_AUTO,
    ChatSocketEvents.MESSAGE_READ,
    ChatSocketEvents.MESSAGE_DELIVERED,
    ChatSocketEvents.CHAT_TIMEOUT,
    ChatSocketEvents.REQUEST_ACCEPTED,
    ChatSocketEvents.REQUEST_REJECTED,
    ChatSocketEvents.CHAT_CANCEL_BY_USER,
  ];

  EVENTS_TO_SETUP.forEach(event => {
    socket.off(event);
  });

  socket.on(
    ChatSocketEvents.NEW_CHAT_REQUEST,
    setupNewChatRequestHandler(),
  );

  socket.on(
    ChatSocketEvents.CHAT_STARTED_ASTROLOGER,
    setupChatStartedHandler(),
  );

  socket.on('receive_message', setupReceiveMessageHandler());

  socket.on(ChatSocketEvents.TYPING_START, (data: any) => {
    if (data?.typing) {
      createTypingHandler('start')(data);
    } else {
      createTypingHandler('stop')(data);
    }
  });

  socket.on(
    ChatSocketEvents.COMPLETED_CHAT,
    createBasicEventHandler(
      ChatSocketEvents.COMPLETED_CHAT,
      'onCompletedChat',
    ),
  );

  socket.on(
    ChatSocketEvents.LEAVE_CHAT,
    createBasicEventHandler(ChatSocketEvents.LEAVE_CHAT, 'onLeaveChat'),
  );

  socket.on(
    ChatSocketEvents.USER_DISCONNECTED,
    createBasicEventHandler(
      ChatSocketEvents.USER_DISCONNECTED,
      'onUserDisconnected',
    ),
  );

  socket.on(
    ChatSocketEvents.CHAT_REJECT_AUTO,
    createBasicEventHandler(
      ChatSocketEvents.CHAT_REJECT_AUTO,
      'onChatRejectAuto',
    ),
  );

  socket.on(
    ChatSocketEvents.MESSAGE_READ,
    createBasicEventHandler(ChatSocketEvents.MESSAGE_READ, 'onMessageRead'),
  );

  socket.on(
    ChatSocketEvents.MESSAGE_DELIVERED,
    createBasicEventHandler(
      ChatSocketEvents.MESSAGE_DELIVERED,
      'onMessageDelivered',
    ),
  );

  socket.on(
    ChatSocketEvents.CHAT_TIMEOUT,
    createBasicEventHandler(ChatSocketEvents.CHAT_TIMEOUT, 'onChatTimeout'),
  );

  socket.on(
    ChatSocketEvents.REQUEST_ACCEPTED,
    createBasicEventHandler(
      ChatSocketEvents.REQUEST_ACCEPTED,
      'onRequestAccepted',
    ),
  );

  socket.on(
    ChatSocketEvents.REQUEST_REJECTED,
    createBasicEventHandler(
      ChatSocketEvents.REQUEST_REJECTED,
      'onRequestRejected',
    ),
  );

  socket.on(
    ChatSocketEvents.CHAT_CANCEL_BY_USER,
    setupChatCancelByUserHandler(),
  );

  // Avoid duplicate callback registrations across repeated setupEventHandlers() calls.
  // socketManager.onConnectionChange is cumulative and socketManager doesn't expose off,
  // so we ensure we register it only once per app lifetime.
  // (The popup flicker issue is consistent with duplicated listeners.)
  if (!(setupEventHandlers as any).__connectionChangeRegistered) {
    (setupEventHandlers as any).__connectionChangeRegistered = true;

    socketManager.onConnectionChange((connected: boolean) => {
      callbackManager.invokeCallbacks('onConnectionChange', connected);
    });
  }


  socket.onAny((event, data) => {
    // console.log('🧠 EVENT:', event);
    // console.log('📦 DATA:', data);
  });
};

export const removeEventHandlers = async (): Promise<void> => {
  try {
    const socket = await socketClient.getSocket();

    const eventsToRemove = [
      ChatSocketEvents.NEW_CHAT_REQUEST,
      ChatSocketEvents.CHAT_STARTED_ASTROLOGER,
      ChatSocketEvents.RECEIVE_MESSAGE,
      ChatSocketEvents.TYPING_START,
      ChatSocketEvents.TYPING_STOP,
      ChatSocketEvents.COMPLETED_CHAT,
      ChatSocketEvents.LEAVE_CHAT,
      ChatSocketEvents.USER_DISCONNECTED,
      ChatSocketEvents.CHAT_REJECT_AUTO,
      ChatSocketEvents.MESSAGE_READ,
      ChatSocketEvents.MESSAGE_DELIVERED,
      ChatSocketEvents.CHAT_TIMEOUT,
      ChatSocketEvents.REQUEST_ACCEPTED,
      ChatSocketEvents.REQUEST_REJECTED,
      ChatSocketEvents.CHAT_CANCEL_BY_USER,
    ];

    eventsToRemove.forEach(event => {
      socket.off(event);
    });
  } catch (error) {
    // console.log('Error removing event handlers:', error);
  }
};

export const clearProcessedRequests = (): void => {
  processedChatRequests.clear();
};
 
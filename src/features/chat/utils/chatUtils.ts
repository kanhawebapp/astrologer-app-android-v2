import type {
  ChatRequest,
  ChatMessage,
  ActiveChatSession,
} from '../domain/chatTypes';

export const normalizeChatRequest = (data: any): ChatRequest | null => {
  if (!data) {
    return null;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return null;
    }
    data = data[0];
  }
  console.log('-----------------------------', data);

  const roomId = data.room_id || data.roomId || data.roomID || '';
  const sessionId = data.session_id || data.sessionId || data.sessionID || '';
  const userId = data.user_id || data.userId || data.userID || '';
  const userName = data.userName || data.user_name || data.userName || 'User';
  const userProfilePic =
    data.userProfilePic ||
    data.user_profile_pic ||
    data.profilePic ||
    undefined;
  const astrologerId = safeValue(
    data.astro_id,
    data.astrologerId || data.astrologer_id,
  );
  const astrologerName =
    data.astrologerName || data.astrologer_name || 'Astrologer';
  const astrologerProfilePic =
    data.astrologerProfilePic || data.astrologer_profile_pic || undefined;
  const issue = data.issue || '';
  const maximumTime =
    data.maximumTime !== undefined
      ? data.maximumTime
      : data.maximum_time !== undefined
      ? data.maximum_time
      : 15;
  const pricePerMinute =
    data.pricePerMinute !== undefined
      ? data.pricePerMinute
      : data.price_per_minute !== undefined
      ? data.price_per_minute
      : 10;
  const createdAt = data.createdAt || data.created_at || Date.now();

  if (!roomId) {
    return null;
  }

  const normalizedSessionId = sessionId || `session_${roomId}`;

  return {
    id: normalizedSessionId,
    sessionId: normalizedSessionId,
    roomId,
    userId,
    userName,
    userProfilePic,
    astrologerId,
    astrologerName,
    astrologerProfilePic,
    issue,
    maximumTime,
    pricePerMinute,
    createdAt,
  };
};

export interface NormalizedSocketEvent {
  room_id: string;
  session_id: string;
  sender_id: string;
  receiver_id: string;
  message?: string;
  [key: string]: any;
}

export const normalizeSocketEvent = (
  eventName: string,
  data: any,
): {
  isValid: boolean;
  normalized: NormalizedSocketEvent | null;
  error?: string;
} => {
  const timestamp = new Date().toISOString();

  console.log(
    `[normalizeSocketEvent] 🔧 [BEFORE_NORMALIZATION] Normalizing event: "${eventName}" [${timestamp}]`,
  );
  console.log(
    `[normalizeSocketEvent] 🔍 [BEFORE_NORMALIZATION] Raw data:`,
    JSON.stringify(data, null, 2),
  );

  if (!data) {
    console.log(
      `[normalizeSocketEvent] ❌ [NULL_DATA] Event "${eventName}" received NULL data!`,
    );
    return { isValid: false, normalized: null, error: 'NULL data received' };
  }

  // Extract all possible field variations
  const room_id =
    data.room_id || data.roomId || data.roomid || data.roomID || '';
  const session_id = data.session_id || data.sessionId || data.sessionID || '';
  const sender_id = data.sender_id || data.senderId || data.senderID || '';
  const receiver_id =
    data.receiver_id || data.receiverId || data.receiverID || '';

  // console.log(`[normalizeSocketEvent] 🔍 [FIELD_EXTRACTION] Raw field values:`);
  // console.log(`   room_id: "${room_id || 'UNDEFINED'}"`);
  // console.log(`   session_id: "${session_id || 'UNDEFINED'}"`);
  // console.log(`   sender_id: "${sender_id || 'UNDEFINED'}"`);
  // console.log(`   receiver_id: "${receiver_id || 'UNDEFINED'}"`);

  // Log which source each field came from for debugging
  // console.log(`[normalizeSocketEvent] 🔍 [SOURCE_TRACE] Field origins:`);
  // console.log(
  //   `   room_id from: ${
  //     data.room_id
  //       ? 'room_id'
  //       : data.roomId
  //       ? 'roomId'
  //       : data.roomid
  //       ? 'roomid'
  //       : data.roomID
  //       ? 'roomID'
  //       : 'none'
  //   }`,
  // );
  // console.log(
  //   `   session_id from: ${
  //     data.session_id
  //       ? 'session_id'
  //       : data.sessionId
  //       ? 'sessionId'
  //       : data.sessionID
  //       ? 'sessionID'
  //       : 'none'
  //   }`,
  // );
  // console.log(
  //   `   sender_id from: ${
  //     data.sender_id
  //       ? 'sender_id'
  //       : data.senderId
  //       ? 'senderId'
  //       : data.senderID
  //       ? 'senderID'
  //       : 'none'
  //   }`,
  // );
  // console.log(
  //   `   receiver_id from: ${
  //     data.receiver_id
  //       ? 'receiver_id'
  //       : data.receiverId
  //       ? 'receiverId'
  //       : data.receiverID
  //       ? 'receiverID'
  //       : 'none'
  //   }`,
  // );

  // Validation for critical fields based on event type
  const isChatStartedEvent = eventName === 'chat_started_astrologer';
  const isMessageEvent =
    eventName === 'receive_message' ||
    eventName === 'receiveMessage' ||
    eventName === 'message' ||
    eventName === 'chat_message' ||
    eventName === 'new_message';

  if (isChatStartedEvent || isMessageEvent) {
    if (!room_id) {
      console.log(
        `[normalizeSocketEvent] ❌ [VALIDATION_FAILED] Event "${eventName}" has NO room_id! This indicates backend is sending undefined!`,
      );
      console.log(
        `[normalizeSocketEvent] 🔍 [AFTER_NORMALIZATION] Full raw data:`,
        JSON.stringify(data, null, 2),
      );
      return {
        isValid: false,
        normalized: null,
        error: `Event "${eventName}" missing required field: room_id`,
      };
    }
  }

  const normalized: NormalizedSocketEvent = {
    room_id,
    session_id,
    sender_id,
    receiver_id,
    message: data.message || data.text || data.messageText || '',
    ...data,
  };

  // console.log(
  //   `[normalizeSocketEvent] ✅ [AFTER_NORMALIZATION] Normalized event "${eventName}":`,
  //   JSON.stringify(normalized, null, 2),
  // );

  return { isValid: true, normalized };
};

export const normalizeMessage = (data: any): ChatMessage | null => {
  if (!data) {
    return null;
  }

  const room_id = data.room_id || data.roomId || data.roomid || '';
  const sender_id = data.sender_id || data.senderId || '';
  const messageText = data.message || data.text || data.messageText || '';

  if (!room_id || !sender_id || !messageText) {
    console.log(
      `[normalizeMessage] ❌ Cannot normalize - missing critical fields:`,
      { room_id, sender_id, messageText },
    );
    return null;
  }

  return {
    id: data.id || data.msg_id || data.messageId || `msg_${Date.now()}`,
    roomId: room_id,
    sessionId: data.sessionId || data.session_id || '',
    senderId: sender_id,
    senderName: data.senderName || data.sender_name || 'User',
    receiverId: data.receiver_id || data.receiverId || '',
    receiverName: data.receiver_name || data.receiverName || '',
    text: messageText,
    timestamp:
      data.created_at || data.timestamp || data.createdAt || Date.now(),
    status: data.status || 'delivered',
    isOwn: false,
  };
};

export const isValidRoomId = (roomId: string | undefined): boolean => {
  if (!roomId) {
    return false;
  }
  if (typeof roomId !== 'string') {
    return false;
  }
  if (roomId === 'undefined' || roomId === 'null') {
    return false;
  }
  return roomId.trim().length > 0;
};

export const safeValue = (
  newVal: string | undefined,
  oldVal: string | undefined,
): string => {
  return newVal || oldVal || '';
};

export const ChatSocketEvents = {
  NEW_CHAT_REQUEST: 'new_chat_request',
  ACCEPT_CHAT: 'accept_chat',
  CHAT_ACCEPTED_ASTROLOGER: 'chat_accepted_astrologer',
  REJECT_CHAT: 'chat_rejected_astrologer',
  // REJECT_CHAT: 'reject_chat',
  CHAT_STARTED_ASTROLOGER: 'chat_started_astrologer',
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  TYPING_START: 'typing',
  // TYPING_START: 'typing_start',
  // TYPING_STOP: 'typing_stop',
  GET_TYPING_STATUS: 'typing',
  TYPING_STOP: 'typing',
  // COMPLETED_CHAT: 'cancel_chat_request',
  COMPLETED_CHAT: 'completed_chat',
  LEAVE_CHAT: 'leave_chat',
  USER_DISCONNECTED: 'user_disconnected',
  CHAT_REJECT_AUTO: 'chat_reject_auto',
  MESSAGE_READ: 'message_read',
  MESSAGE_DELIVERED: 'message_delivered',
  RECONNECT_SUCCESS: 'reconnect_success',
  CHAT_TIMEOUT: 'chat_timeout',
  REQUEST_ACCEPTED: 'request_accepted',
  REQUEST_REJECTED: 'request_rejected',
  CHAT_CANCEL_BY_USER: 'chat_cancel_by_user',
} as const;

export type ChatSocketEventName =
  (typeof ChatSocketEvents)[keyof typeof ChatSocketEvents];

export const TIMING_DEBOUNCE_MS = 300;
export const TYPING_DEBOUNCE_MS = 1000;
export const AUTO_REJECT_TIME_MS = 30000;
export const RECONNECT_DELAY_MS = 2000;
export const MESSAGE_RETRY_ATTEMPTS = 3;
export const MESSAGE_RETRY_DELAY_MS = 2000;

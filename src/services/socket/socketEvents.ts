export const SocketEvents = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
  RECONNECT_FAILED: 'reconnect_failed',
  PING: 'ping',
  PONG: 'pong',
} as const;

export const ChatEvents = {
  SEND_MESSAGE: 'sendMessage',
  MESSAGE_RECEIVED: 'messageReceived',
  MESSAGE_READ: 'messageRead',
  MESSAGE_DELIVERED: 'messageDelivered',
  TYPING_START: 'typingStart',
  TYPING_STOP: 'typingStop',
  LOAD_MESSAGES: 'loadMessages',
  MESSAGES_HISTORY: 'messagesHistory',
} as const;

export const LiveSessionEvents = {
  JOIN_SESSION: 'joinSession',
  LEAVE_SESSION: 'leaveSession',
  SESSION_JOINED: 'sessionJoined',
  SESSION_LEFT: 'sessionLeft',
  SESSION_UPDATE: 'sessionUpdate',
  VIEWER_COUNT: 'viewerCount',
  USER_JOINED: 'userJoined',
  USER_LEFT: 'userLeft',
  SESSION_ENDED: 'sessionEnded',
} as const;

export const NotificationEvents = {
  NOTIFICATION_RECEIVED: 'notificationReceived',
  NOTIFICATION_READ: 'notificationRead',
  NOTIFICATION_DISMISSED: 'notificationDismissed',
  REGISTER_DEVICE: 'registerDevice',
  UNREGISTER_DEVICE: 'unregisterDevice',
} as const;

export const AuthEvents = {
  AUTH_REQUIRED: 'authRequired',
  AUTH_SUCCESS: 'authSuccess',
  AUTH_FAILED: 'authFailed',
  TOKEN_REFRESH: 'tokenRefresh',
} as const;

export const SocketNamespaces = {
  DEFAULT: '/',
  DHWANI_ASTRO: '/dhwani-astro',
  CHAT: '/chat',
  LIVE: '/live',
  NOTIFICATIONS: '/notifications',
} as const;

export type SocketEventName = (typeof SocketEvents)[keyof typeof SocketEvents];
export type ChatEventName = (typeof ChatEvents)[keyof typeof ChatEvents];
export type LiveSessionEventName =
  (typeof LiveSessionEvents)[keyof typeof LiveSessionEvents];
export type NotificationEventName =
  (typeof NotificationEvents)[keyof typeof NotificationEvents];
export type AuthEventName = (typeof AuthEvents)[keyof typeof AuthEvents];
export type SocketNamespace =
  (typeof SocketNamespaces)[keyof typeof SocketNamespaces];

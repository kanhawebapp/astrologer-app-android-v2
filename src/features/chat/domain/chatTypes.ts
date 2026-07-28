export interface User {
  id: string;
  name: string;
  mobile: string;
}

export interface Astrologer {
  id: string;
  name: string;
  profilePic: string;
  experience: number;
  price: number;
}

export interface LastMessage {
  message: string;
  sender: string;
  createdAt: string;
}

export interface ChatRoom {
  roomId: string;
  sessionId: string;
  startedAt: string;
  endedAt: string | null;
  status: 'active' | 'completed' | 'missed';
  user: User | null;
  astrologer: Astrologer | null;
  lastMessage: LastMessage | null;
}

export interface ChatRoomUI {
  id: string;
  roomId: string;
  sessionId: string;
  userName: string;
  astrologerName: string;
  astrologerProfilePic: string;
  astrologerExperience: number;
  astrologerPrice: number;
  lastMessage: string;
  startedAt: string;
  endedAt: string | null;
  status: 'active' | 'completed' | 'missed';
  unreadCount: number;
}

export interface GetChatHistoryResponse {
  getUserChatHistory: {
    roomId: string;
    sessionId: string;
    startedAt: string;
    endedAt: string | null;
    status: string;
    user: User | null;
    astrologer: Astrologer | null;
    lastMessage: LastMessage | null;
  }[];
}

export type ChatStatus = 'IDLE' | 'REQUEST' | 'ACTIVE' | 'ENDED';

export interface ChatMessage {
  type: string;
  id: string;
  roomId: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  text: string;
  imageUrl?: string;
  
  replyTo?:
    | {
        sender: string;
        message: string;
        image?: string | null;
      }
    | null;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isOwn: boolean;
}

export interface ChatRequest {
  id: string;
  sessionId: string;
  roomId: string;
  userId: string;
  userName: string;
  userProfilePic?: string;
  astrologerId: string;
  astrologerName: string;
  astrologerProfilePic?: string;
  issue: string;
  maximumTime: number;
  pricePerMinute: number;
  createdAt: number;
}

export interface ActiveChatSession {
  sessionId: string;
  roomId: string;
  userId: string;
  userName: string;
  userProfilePic?: string;
  astrologerId: string;
  astrologerName: string;
  astrologerProfilePic?: string;
  startedAt: number;
  maximumTime: number;
  pricePerMinute: number;
  remainingTime: number;
}

export interface TypingInfo {
  roomId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: number;
}

export interface ChatState {
  chatStatus: ChatStatus;
  chatRequests: ChatRequest[];
  activeSession: ActiveChatSession | null;
  latestRequest: ChatRequest | null;

  messages: Record<string, ChatMessage[]>;
  typingInfo: Record<string, TypingInfo>;
  pendingMessages: ChatMessage[];
  connecting: boolean;
  error: string | null;
  chats: ChatRoomUI[];
  activeChatId: string | null;
}

export interface ChatSocketEvents {
  new_chat_request: (data: ChatRequest) => void;
  chat_started_astrologer: (data: ActiveChatSession) => void;
  send_message: (data: Partial<ChatMessage>) => void;
  receive_message: (data: ChatMessage) => void;
  typing_start: (data: TypingInfo) => void;
  typing_stop: (data: TypingInfo) => void;
  completed_chat: (data: { sessionId: string; roomId: string }) => void;
  leave_chat: (data: {
    sessionId: string;
    roomId: string;
    reason: string;
  }) => void;
  user_disconnected: (data: {
    sessionId: string;
    roomId: string;
    userId: string;
  }) => void;
  chat_reject_auto: (data: {
    sessionId: string;
    roomId: string;
    reason: string;
  }) => void;
  message_read: (data: { messageId: string; roomId: string }) => void;
  message_delivered: (data: { messageId: string; roomId: string }) => void;
  reconnect_success: (data: { sessionId: string; roomId: string }) => void;
}

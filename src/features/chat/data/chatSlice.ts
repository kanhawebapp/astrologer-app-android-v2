import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import type {
  ChatState,
  ChatStatus,
  ChatRequest,
  ActiveChatSession,
  ChatMessage,
  TypingInfo,
  ChatRoomUI,
} from '../domain/chatTypes';

const initialState: ChatState = {
  chatStatus: 'IDLE',
  chatRequests: [],
  activeSession: null,
  latestRequest: null,
  messages: {},
  typingInfo: {},
  pendingMessages: [],
  connecting: false,
  error: null,
  chats: [],
  activeChatId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.connecting = action.payload;
    },

    setChatStatus: (state, action: PayloadAction<ChatStatus>) => {
      state.chatStatus = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setLatestRequest: (state, action: PayloadAction<ChatRequest | null>) => {
      state.latestRequest = action.payload;
    },

    addChatRequest: (state, action: PayloadAction<ChatRequest>) => {
      const payload = action.payload;
      const roomId = payload.roomId || (payload as any).room_id;
      let sessionId = payload.sessionId || (payload as any).session_id;
      const userId = payload.userId || (payload as any).user_id;
      const userName = payload.userName || (payload as any).user_name || 'User';

      if (!roomId) {
        return;
      }

      if (!sessionId) {
        sessionId = `session_${roomId}`;
      }

      const normalizedPayload: ChatRequest = {
        id: sessionId,
        sessionId,
        roomId,
        userId: userId || '',
        userName,
        userProfilePic: payload.userProfilePic,
        astrologerId: payload.astrologerId || '',
        astrologerName: payload.astrologerName || 'Astrologer',
        astrologerProfilePic: payload.astrologerProfilePic,
        issue: payload.issue || '',
        maximumTime: payload.maximumTime || 15,
        pricePerMinute: payload.pricePerMinute || 10,
        createdAt: payload.createdAt || Date.now(),
      };

      const existsById = state.chatRequests.find(
        r => r.id === normalizedPayload.id,
      );
      const existsByRoomId = state.chatRequests.find(
        r => r.roomId === normalizedPayload.roomId,
      );

      // Keep UI deterministic: latestRequest must always reflect the latest incoming REQUEST payload.
      // Even if the request already exists in chatRequests, we still update latestRequest so the popup can re-open.
      state.latestRequest = normalizedPayload;

      if (!existsById && !existsByRoomId) {
        state.chatRequests.unshift(normalizedPayload);
      }

      state.chatStatus = 'REQUEST';
    },

    removeChatRequest: (state, action: PayloadAction<string>) => {
      state.chatRequests = state.chatRequests.filter(
        r => r.id !== action.payload,
      );
      if (state.chatRequests.length === 0 && state.chatStatus === 'REQUEST') {
        state.chatStatus = 'IDLE';
      }
    },

    clearChatRequests: state => {
      state.chatRequests = [];
      state.latestRequest = null;
      state.chatStatus = 'IDLE';
    },

    setActiveSession: (
      state,
      action: PayloadAction<ActiveChatSession | null>,
    ) => {
      state.activeSession = action.payload;
      if (action.payload) {
        state.chatStatus = 'ACTIVE';
        // Remove the corresponding chat request (by sessionId or roomId)
        state.chatRequests = state.chatRequests.filter(
          r =>
            r.sessionId !== action.payload!.sessionId &&
            r.roomId !== action.payload!.roomId,
        );
      }
    },

    updateSessionTime: (state, action: PayloadAction<number>) => {
      if (state.activeSession) {
        state.activeSession.remainingTime = action.payload;
      }
    },

    decrementSessionTime: state => {
      if (state.activeSession && state.activeSession.remainingTime > 0) {
        state.activeSession.remainingTime -= 1;
      }
    },

    endChatSession: state => {
      state.activeSession = null;
      state.chatRequests = [];
      state.latestRequest = null;
      state.connecting = false;
      state.chatStatus = 'IDLE';
    },

    // Hard reset used by socket events to eliminate cross-session UI state flicker.
    hardResetChatFlow: state => {
      state.activeSession = null;
      state.chatRequests = [];
      state.latestRequest = null;
      state.connecting = false;
      state.chatStatus = 'IDLE';
      state.error = null;
      state.messages = {};
      state.pendingMessages = [];
    },

    resetChatStatus: state => {
      state.chatStatus = 'IDLE';
      state.activeSession = null;
      state.error = null;
    },

    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const { roomId } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      const exists = state.messages[roomId].find(
        m => m.id === action.payload.id,
      );
      if (!exists) {
        state.messages[roomId].push(action.payload);
      }
    },

    updateMessageStatus: (
      state,
      action: PayloadAction<{
        messageId: string;
        roomId: string;
        status: ChatMessage['status'];
      }>,
    ) => {
      const { messageId, roomId, status } = action.payload;
      if (state.messages[roomId]) {
        const message = state.messages[roomId].find(m => m.id === messageId);
        if (message) {
          message.status = status;
        }
      }
      const pendingIndex = state.pendingMessages.findIndex(
        m => m.id === messageId,
      );
      if (pendingIndex !== -1) {
        state.pendingMessages[pendingIndex].status = status;
      }
    },

    removePendingMessage: (state, action: PayloadAction<string>) => {
      state.pendingMessages = state.pendingMessages.filter(
        m => m.id !== action.payload,
      );
    },

    addPendingMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.pendingMessages.push(action.payload);
    },

    setTypingInfo: (state, action: PayloadAction<TypingInfo>) => {
      const { roomId, userId } = action.payload;
      const key = `${roomId}_${userId}`;
      state.typingInfo[key] = action.payload;
    },

    clearTypingInfo: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      Object.keys(state.typingInfo).forEach(key => {
        if (key.startsWith(roomId)) {
          delete state.typingInfo[key];
        }
      });
    },

    clearRoomMessages: (state, action: PayloadAction<string>) => {
      if (action.payload) {
        delete state.messages[action.payload];
      }
    },

    clearAllChatData: state => {
      state.chatStatus = 'IDLE';
      state.chatRequests = [];
      state.activeSession = null;
      state.latestRequest = null;
      state.messages = {};
      state.typingInfo = {};
      state.pendingMessages = [];
      state.connecting = false;
      state.error = null;
      state.chats = [];
      state.activeChatId = null;
    },

    setChats: (state, action: PayloadAction<ChatRoomUI[]>) => {
      state.chats = action.payload;
    },

    setActiveChatId: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
    },
  },
});

export const {
  setConnecting,
  setChatStatus,
  setError,
  setLatestRequest,
  addChatRequest,
  removeChatRequest,
  clearChatRequests,
  setActiveSession,
  updateSessionTime,
  decrementSessionTime,
  endChatSession,
  resetChatStatus,
  addMessage,
  updateMessageStatus,
  removePendingMessage,
  addPendingMessage,
  setTypingInfo,
  clearTypingInfo,
  clearRoomMessages,
  clearAllChatData,
  setChats,
  setActiveChatId,
  hardResetChatFlow,
} = chatSlice.actions;
export default chatSlice.reducer;

export const selectMessagesByRoom = createSelector(
  [
    (state: { chat: ChatState }) => state.chat.messages,
    (_: any, roomId: string) => roomId,
  ],
  (messages, roomId) => messages[roomId] || [],
);

export const selectActiveSession = (state: RootState) =>
  state.chat.activeSession;
export const selectChatStatus = (state: RootState) =>
  state.chat.chatStatus;
export const selectTypingInfo = (state: RootState) =>
  state.chat.typingInfo;
export const selectPendingMessages = (state: RootState) =>
  state.chat.pendingMessages;
export const selectChatRequests = (state: RootState) =>
  state.chat.chatRequests;


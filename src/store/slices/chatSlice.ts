import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';
import { getChatHistory } from '../../features/chat/data/chatRepository';
import {
  ChatRoomUI,
  ChatStatus,
  ChatRequest,
  ActiveChatSession,
  ChatMessage,
  TypingInfo,
} from '../../features/chat/domain/chatTypes';
import { RootState } from '../../store';

interface ChatState {
  chats: ChatRoomUI[];
  activeChatId: string | null;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  chatStatus: ChatStatus;
  chatRequests: ChatRequest[];
  // Used by ChatRequestCard popup.
  latestRequest: ChatRequest | null;
  activeSession: ActiveChatSession | null;
  messages: Record<string, ChatMessage[]>;
  typingInfo: Record<string, TypingInfo>;
  pendingMessages: ChatMessage[];
  connecting: boolean;
}


// NOTE:
// This file is the single source of truth for Redux state.
// Other parts of the app (e.g. MainNavigator) expect `state.chat.activeSession`.
// If you see mismatches, ensure you are importing actions/reducer from this slice,
// not from src/features/chat/data/chatSlice.ts.


const initialState: ChatState = {
  chats: [],
  activeChatId: null,
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  chatStatus: 'IDLE',
  chatRequests: [],
  latestRequest: null,
  activeSession: null,
  messages: {},
  typingInfo: {},
  pendingMessages: [],
  connecting: false,
};


export const fetchChatHistory = createAsyncThunk(
  'chat/fetchChatHistory',
  async (
    { page, limit }: { page: number; limit: number },
    { rejectWithValue, getState },
  ) => {
    const state = getState() as RootState;
    const token = state.auth.token;

    try {
      const chats = await getChatHistory(page, limit, token || undefined);
      return { chats, page };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch chat history');
    }
  },
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<ChatRoomUI[]>) => {
      state.chats = action.payload;
    },
    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find(c => c.id === action.payload);
      if (chat) {
        chat.unreadCount = 0;
      }
    },
    incrementUnread: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find(c => c.id === action.payload);
      if (chat) {
        chat.unreadCount += 1;
      }
    },
    updateLastMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: string }>,
    ) => {
      const chat = state.chats.find(c => c.id === action.payload.chatId);
      if (chat) {
        chat.lastMessage = action.payload.message;
      }
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    clearChats: state => {
      state.chats = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
    clearChatError: state => {
      state.error = null;
    },
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.connecting = action.payload;
    },
    setChatStatus: (state, action: PayloadAction<ChatStatus>) => {
      console.log('[CHAT_DEBUG] redux setChatStatus', {
        from: state.chatStatus,
        to: action.payload,
        activeSession: !!state.activeSession,
        roomId: state.activeSession?.roomId,
        remainingTime: state.activeSession?.remainingTime,
      });
      state.chatStatus = action.payload;
    },
    setLatestRequest: (state, action: PayloadAction<ChatRequest | null>) => {
      state.latestRequest = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    addChatRequest: (state, action: PayloadAction<ChatRequest>) => {
      const prevLen = state.chatRequests.length;
      console.log('[REDUX addChatRequest] BEFORE - chatRequests.length:', prevLen, 'chatStatus:', state.chatStatus, 'activeSession:', !!state.activeSession);
      console.log('[REDUX addChatRequest] payload:', JSON.stringify(action.payload, null, 2));

      // SINGLE source of truth: latestRequest drives the popup.
      state.latestRequest = action.payload;

      const exists = state.chatRequests.find(r => r.id === action.payload.id);
      if (!exists) {
        state.chatRequests.push(action.payload);
      }
      state.chatStatus = 'REQUEST';

      console.log('[REDUX addChatRequest] AFTER - chatRequests.length:', state.chatRequests.length, 'chatStatus:', state.chatStatus);
    },

    // removeChatRequest: (state, action: PayloadAction<string>) => {
    //   console.log('[REDUX removeChatRequest] BEFORE - chatRequests.length:', state.chatRequests.length, 'chatStatus:', state.chatStatus, 'activeSession:', !!state.activeSession);
    //   console.log('[REDUX removeChatRequest] action.payload (id):', action.payload);

    //   state.chatRequests = state.chatRequests.filter(
    //     r => r.id !== action.payload,
    //   );

    //   // If popup was showing this request, clear latestRequest.
    //   if (state.latestRequest?.id === action.payload) {
    //     state.latestRequest = null;
    //   }

    //   if (state.chatRequests.length === 0 && state.chatStatus === 'REQUEST') {
    //     state.chatStatus = 'IDLE';
    //   }
    //   console.log('[REDUX removeChatRequest] AFTER - chatRequests.length:', state.chatRequests.length, 'chatStatus:', state.chatStatus);
    // },

    removeChatRequest: (state, action) => {
      state.chatRequests = state.chatRequests.filter(
        r => r.sessionId !== action.payload,
      );

      if (state.latestRequest?.sessionId === action.payload) {
        state.latestRequest = null;
      }

      if (
        state.chatRequests.length === 0 &&
        state.chatStatus === 'REQUEST'
      ) {
        state.chatStatus = 'IDLE';
      }
    },

    clearChatRequests: state => {
      console.log('[REDUX clearChatRequests] BEFORE - chatRequests.length:', state.chatRequests.length, 'chatStatus:', state.chatStatus, 'activeSession:', !!state.activeSession);
      state.chatRequests = [];
      state.latestRequest = null;
      state.chatStatus = 'IDLE';
      console.log('[REDUX clearChatRequests] AFTER - chatRequests.length:', state.chatRequests.length, 'chatStatus:', state.chatStatus);
    },
    setActiveSession: (
      state,
      action: PayloadAction<ActiveChatSession | null>,
    ) => {
      console.log('[REDUX setActiveSession] BEFORE - chatRequests.length:', state.chatRequests.length, 'chatStatus:', state.chatStatus, 'activeSession:', !!state.activeSession);
      console.log('[REDUX setActiveSession] action.payload:', action.payload ? JSON.stringify(action.payload, null, 2) : 'null');

      if (action.payload) {
        state.activeSession = action.payload;
        state.chatStatus = 'ACTIVE';

        // Active session started: popup should not show.
        state.latestRequest = null;

        state.chatRequests = state.chatRequests.filter(
          r =>
            r.sessionId !== action.payload!.sessionId &&
            r.roomId !== action.payload!.roomId,
        );
      } else {
        state.activeSession = action.payload;
      }

      console.log('[REDUX setActiveSession] AFTER - chatRequests.length:', state.chatRequests.length, 'chatStatus:', state.chatStatus, 'activeSession:', !!state.activeSession);
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
      console.log('[REDUX endChatSession] BEFORE - chatRequests.length:', state.chatRequests.length, 'chatStatus:', state.chatStatus, 'activeSession:', !!state.activeSession);
      state.activeSession = null;
      state.latestRequest = null;
      state.chatStatus = 'ENDED';
      console.log('[REDUX endChatSession] AFTER - chatRequests.length:', state.chatRequests.length, 'chatStatus:', state.chatStatus, 'activeSession:', !!state.activeSession);
    },
    resetChatStatus: state => {
      console.log('[REDUX resetChatStatus] BEFORE - chatRequests.length:', state.chatRequests.length, 'chatStatus:', state.chatStatus, 'activeSession:', !!state.activeSession);
      state.chatStatus = 'IDLE';
      state.activeSession = null;
      state.latestRequest = null;
      state.error = null;
      console.log('[REDUX resetChatStatus] AFTER - chatRequests.length:', state.chatRequests.length, 'chatStatus:', state.chatStatus, 'activeSession:', !!state.activeSession);
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const { roomId, id, text } = action.payload;
      console.log(
        `[chatSlice] 📥 addMessage - roomId: "${roomId}", id: "${id}", text: "${text?.substring(0, 20)}"`,
      );
      if (!roomId) {
        console.warn(`[chatSlice] ❌ addMessage DROPPED - missing roomId!`);
        return;
      }
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
        console.log(
          `[chatSlice] 🆕 Created message array for roomId: "${roomId}"`,
        );
      }
      const exists = state.messages[roomId].find(
        m => m.id === action.payload.id,
      );
      if (!exists) {
        state.messages[roomId].push(action.payload);
        console.log(
          `[chatSlice] ✅ Added to "${roomId}". Count: ${state.messages[roomId].length}`,
        );
      } else {
        console.log(`[chatSlice] ⏭️ Duplicate "${id}" ignored`);
      }
      console.log(
        `[chatSlice] 📊 Redux message keys:`,
        Object.keys(state.messages),
      );
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
      console.log(
        '[REDUX clearAllChatData] BEFORE - chatRequests.length:',
        state.chatRequests.length,
        'chatStatus:',
        state.chatStatus,
        'activeSession:',
        !!state.activeSession,
      );
      state.chatStatus = 'IDLE';
      state.chatRequests = [];
      state.latestRequest = null;
      state.activeSession = null;
      state.messages = {};
      state.typingInfo = {};
      state.pendingMessages = [];
      state.connecting = false;
      state.error = null;
      state.chats = [];
      state.activeChatId = null;
      console.log(
        '[REDUX clearAllChatData] AFTER - chatRequests.length:',
        state.chatRequests.length,
        'chatStatus:',
        state.chatStatus,
        'activeSession:',
        !!state.activeSession,
      );
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchChatHistory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) {
          state.chats = action.payload.chats;
        } else {
          state.chats = [...state.chats, ...action.payload.chats];
        }
        state.hasMore = action.payload.chats.length > 0;
        state.page = action.payload.page;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setChats,
  setActiveChat,
  markAsRead,
  incrementUnread,
  updateLastMessage,
  setPage,
  clearChats,
  clearChatError,
  setConnecting,
  setChatStatus,
  setLatestRequest,
  setError,
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
} = chatSlice.actions;
export default chatSlice.reducer;

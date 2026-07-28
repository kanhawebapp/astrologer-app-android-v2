import { createSelector } from '@reduxjs/toolkit';
import type {
  ChatMessage,
  ActiveChatSession,
  ChatStatus,
  TypingInfo,
  ChatRequest,
} from '../../features/chat/domain/chatTypes';
import { RootState } from '..';

const EMPTY_MESSAGES: Readonly<ChatMessage[]> = Object.freeze([]);

export const selectMessagesByRoom = createSelector(
  [
    (state: RootState) => state.chat.messages,
    (_: RootState, roomId: string) => roomId,
  ],
  (messages, roomId) => {
    return messages[roomId] || EMPTY_MESSAGES;
  },
);

export const selectActiveSession = (
  state: RootState,
): ActiveChatSession | null => state.chat.activeSession;

export const selectChatStatus = (state: RootState): ChatStatus =>
  state.chat.chatStatus;

export const selectTypingInfo = (
  state: RootState,
): Record<string, TypingInfo> => state.chat.typingInfo;

export const selectPendingMessages = (state: RootState): ChatMessage[] =>
  state.chat.pendingMessages;

export const selectChatRequests = (state: RootState): ChatRequest[] =>
  state.chat.chatRequests;

export const selectChats = (state: RootState) => state.chat.chats;

export const selectConnecting = (state: RootState): boolean =>
  state.chat.connecting;

export const selectError = (state: RootState): string | null =>
  state.chat.error;

export const selectLoading = (state: RootState): boolean => state.chat.loading;

export const selectActiveChatId = (state: RootState): string | null =>
  state.chat.activeChatId;

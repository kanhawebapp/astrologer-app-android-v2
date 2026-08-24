import { socketClient } from '../../../services/socket/socketClient';
import { socketManager } from '../../../services/socket/socketManager';
import type { Socket } from 'socket.io-client';
import { ChatSocketCallbacks, callbackManager } from './callbackManager';
import { typingManager } from './typingManager';
import { roomSessionManager, RoomSessionData } from './roomSessionManager';
import { chatSocketEmitters } from './chatSocketEmitters';
import {
  setupEventHandlers,
  removeEventHandlers,
  clearProcessedRequests,
} from './chatEventHandlers';
import { debounceManager } from './debounceManager';

class ChatSocketService {
  private static instance: ChatSocketService;
  private isListenerSetup: boolean = false;
  private settingUp: boolean = false;
  private currentSocket: Socket | null = null;

  private constructor() {}

  static getInstance(): ChatSocketService {
    if (!ChatSocketService.instance) {
      ChatSocketService.instance = new ChatSocketService();
    }
    return ChatSocketService.instance;
  }

  addCallbacks(callbacks: ChatSocketCallbacks): void {
    callbackManager.addCallbacks(callbacks);
  }

  removeCallbacks(callbacks: ChatSocketCallbacks): void {
    callbackManager.removeCallbacks(callbacks);
  }

  setCallbacks(callbacks: ChatSocketCallbacks): void {
    callbackManager.setCallbacks(callbacks);
  }

  clearCallbacks(): void {
    callbackManager.clearCallbacks();
  }

  async setupListeners(): Promise<void> {
    if (this.settingUp) {
      return;
    }

    const socket = await socketClient.getSocket();

    // Reconnect replaces the Socket.IO instance.
    // If the socket object changed, we must rebind listeners to the new instance.
    if (this.currentSocket !== socket) {
      if (this.isListenerSetup) {
        // Detach from the previous socket to avoid duplicates.
        await this.removeListeners();
      }
      this.currentSocket = socket;
      this.isListenerSetup = false;
    }

    if (this.isListenerSetup) {
      return;
    }

    this.settingUp = true;

    try {
      await setupEventHandlers();
      this.isListenerSetup = true;
    } catch (error) {
      throw error;
    } finally {
      this.settingUp = false;
    }
  }

  async removeListeners(): Promise<void> {
    await removeEventHandlers();
    this.isListenerSetup = false;
    typingManager.clearAll();
  }

  async acceptChat(sessionId: string, roomId?: string): Promise<void> {
    await chatSocketEmitters.acceptChat(sessionId, roomId);
  }

  async acceptChatAstrologer(
    sessionId: string, roomId: string, userId: string,
  ): Promise<void> {
    const { store } = require('../../../store');
    const state = store.getState();
    const astroId = state.auth.user?.id;

    // Instrumentation ONLY
    // console.log('[CHAT_ACCEPT_TRACE] inside acceptChatAstrologer()');
    // console.log('timestamp:', new Date().toISOString());
    // console.log('payload:', JSON.stringify({ sessionId, roomId }, null, 2));

    // console.log('=========================')
    // console.log('AUTH USER')
    // console.log('=========================')
    // console.log('store.getState().auth.user.id:', state.auth.user?.id);

    // console.log('=========================')
    // console.log('LATEST REQUEST')
    // console.log('=========================')
    // console.log('latestRequest fields (passed as parameters):');
    // console.log('  sessionId:', sessionId);
    // console.log('  roomId:', roomId);

    // Instrumentation ONLY
    // console.log('[CHAT_ACCEPT_TRACE] before chat_accepted_astrologer emit');
    // console.log('timestamp:', new Date().toISOString());
    // console.log('payload:', JSON.stringify({ sessionId, roomId }, null, 2));

    await socketManager.waitUntilConnected();
await chatSocketEmitters.acceptChatAstrologer( sessionId, roomId, userId, astroId, );
    // Instrumentation ONLY
    // console.log('[CHAT_ACCEPT_TRACE] after chat_accepted_astrologer emit');
    // console.log('timestamp:', new Date().toISOString());

    await socketManager.waitUntilConnected();

    const joinChatPayload = {
      // Instrumentation ONLY
      __chat_accept_trace_joinChat: true,
      username: 'astrologer',
      room_id: roomId,
      joinpersonid: 'ASTROLOGER_ID_HERE',
    };
    // console.log('=========================');
    // console.log('EMIT 2');

    // // Instrumentation ONLY
    // console.log('[CHAT_ACCEPT_TRACE] before joinChat emit');
    // console.log('timestamp:', new Date().toISOString());
    // console.log('payload:', JSON.stringify(joinChatPayload, null, 2));
    // console.log('=========================');
    // console.log('joinChat payload:', JSON.stringify(joinChatPayload, null, 2));
    await socketManager.emit('joinChat', joinChatPayload);
    // console.log('[CHAT_ACCEPT_TRACE] after joinChat emit');
    // console.log('timestamp:', new Date().toISOString());
    // console.log('roomId:', roomId);
    // console.log('✅ Joined room here', roomId);
  }

  async rejectChat(sessionId: string, astrologerId: string, roomId?: string): Promise<void> {
    await chatSocketEmitters.rejectChat(sessionId, astrologerId, roomId);
  }

  async sendMessage(message: any): Promise<void> {
    await chatSocketEmitters.sendMessage(message);
  }

  async sendTyping(roomId: string, isTyping: boolean): Promise<void> {
    await typingManager.sendTyping(roomId, isTyping);
  }

  async completeChat(sessionId: string, roomId: string): Promise<void> {
    await chatSocketEmitters.completeChat(sessionId, roomId);
  }

  async leaveChat(
    sessionId: string,
    roomId: string,
    reason: string,
  ): Promise<void> {
    await chatSocketEmitters.leaveChat(sessionId, roomId, reason);
  }

  async markMessageRead(messageId: string, roomId: string): Promise<void> {
    await chatSocketEmitters.markMessageRead(messageId, roomId);
  }

  async markMessageDelivered(messageId: string, roomId: string): Promise<void> {
    await chatSocketEmitters.markMessageDelivered(messageId, roomId);
  }

  setRoomSession(roomId: string, data: RoomSessionData): void {
    roomSessionManager.setRoomSession(roomId, data);
  }

  getRoomSession(roomId: string): RoomSessionData | undefined {
    return roomSessionManager.getRoomSession(roomId);
  }

  deleteRoomSession(roomId: string): void {
    roomSessionManager.deleteRoomSession(roomId);
  }

  clearRoomSessionMap(): void {
    roomSessionManager.clearRoomSessionMap();
  }

  async cleanup(): Promise<void> {
    await this.removeListeners();
    typingManager.clearAll();
    callbackManager.clearCallbacks();
    roomSessionManager.clearRoomSessionMap();
    clearProcessedRequests();
    debounceManager.clear();
  }
}

export const chatSocketService = ChatSocketService.getInstance();
export default chatSocketService;

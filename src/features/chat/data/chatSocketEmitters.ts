import { socketManager } from '../../../services/socket/socketManager';
import { clearChatRequests, endChatSession, resetChatStatus } from '../../../store/slices/chatSlice';
import { ChatSocketEvents } from '../domain/chatEvents';
import { useChatSocket } from '../presentation/hooks';


export class ChatSocketEmitters {
  async acceptChat(sessionId: string, roomId?: string): Promise<void> {
    await socketManager.emit(ChatSocketEvents.ACCEPT_CHAT, {
      sessionId,
      room_id: roomId,
    });
  }


  async acceptChatAstrologer(
    sessionId: string,
    roomId?: string,
  ): Promise<void> {
    console.log('[ACCEPT TRACE 5] acceptChatAstrologer called');
    console.log({ sessionId, roomId });
    const emitPayload = {
      sessionId,
      room_id: roomId,
    };
  
    console.log('[ACCEPT TRACE 6] socket emit');
    await socketManager.emit(ChatSocketEvents.CHAT_ACCEPTED_ASTROLOGER, emitPayload);

    // console.log('[CHAT_ACCEPT_TRACE] after chat_accepted_astrologer emit');
    // console.log('timestamp:', new Date().toISOString());
  }

  async rejectChat(sessionId: string, roomId?: string): Promise<void> {
    console.log("i am here for chat reject newww")
    await socketManager.emit(ChatSocketEvents.REJECT_CHAT, {
      sessionId,
      room_id: roomId,
    });
  }

  async sendMessage(message: any): Promise<void> {
    await socketManager.emit(ChatSocketEvents.SEND_MESSAGE, message);
  }

  async sendTypingStart(roomId: string): Promise<void> {
    await socketManager.emit(ChatSocketEvents.TYPING_START, { roomId });
  }

  async sendTypingStop(roomId: string): Promise<void> {
    await socketManager.emit(ChatSocketEvents.TYPING_STOP, { roomId });
  }

  async completeChat(sessionId: string, roomId: string): Promise<void> {
    console.log('✅ [EMITTER] completeChat() called with:', {
      sessionId,
      roomId,
    });
    await socketManager.emit(ChatSocketEvents.COMPLETED_CHAT, {
      sessionId,
      roomId,
    });
    console.log('✅ [EMITTER] completeChat() emit finished');
  }

  async leaveChat(
    sessionId: string,
    roomId: string,
    reason: string,
  ): Promise<void> {
    await socketManager.emit(ChatSocketEvents.LEAVE_CHAT, {
      sessionId,
      roomId,
      reason,
    });
  }

  async markMessageRead(messageId: string, roomId: string): Promise<void> {
    await socketManager.emit(ChatSocketEvents.MESSAGE_READ, {
      messageId,
      roomId,
    });
  }

  async markMessageDelivered(messageId: string, roomId: string): Promise<void> {
    await socketManager.emit(ChatSocketEvents.MESSAGE_DELIVERED, {
      messageId,
      roomId,
    });
  }

  async joinChat(
    roomId: string,
    username: string,
    joinPersonId: string,
  ): Promise<void> {
    // Instrumentation ONLY
    console.log('[CHAT_ACCEPT_TRACE] before joinChat emit');
    console.log('timestamp:', new Date().toISOString());
    console.log(
      'payload:',
      JSON.stringify(
        { username, room_id: roomId, joinpersonid: joinPersonId },
        null,
        2,
      ),
    );

    await socketManager.emit('joinChat', {
      username,
      room_id: roomId,
      joinpersonid: joinPersonId,
    });

    console.log('[CHAT_ACCEPT_TRACE] after joinChat emit');
    console.log('timestamp:', new Date().toISOString());
  }
}

export const chatSocketEmitters = new ChatSocketEmitters();


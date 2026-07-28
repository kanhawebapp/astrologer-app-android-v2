import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { RootState, AppDispatch } from '../../../../store';
import {
  addMessage,
  updateMessageStatus,
  addPendingMessage,
  removePendingMessage,
  setTypingInfo,
  setActiveSession,
  addChatRequest,
} from '../../../../store/slices/chatSlice';
import { chatSocketService } from '../../data/chatSocketService';
import type {
  ChatMessage,
  TypingInfo,
  ChatRequest,
  ActiveChatSession,
} from '../../domain/chatTypes';

const DEBUG_PREFIX = '[useChatMessages]';

export const useChatMessages = () => {
  const dispatch = useDispatch<AppDispatch>();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Select only the needed pieces to avoid unnecessary re-renders
  const activeSession = useSelector(
    (state: RootState) => state.chat.activeSession,
    shallowEqual,
  );
  const typingInfo = useSelector(
    (state: RootState) => state.chat.typingInfo,
    shallowEqual,
  );
  const messages = useSelector(
    (state: RootState) => state.chat.messages,
    shallowEqual,
  );
  const user = useSelector((state: RootState) => state.auth.user, shallowEqual);
  const chatRequests = useSelector(
    (state: RootState) => state.chat.chatRequests,
    shallowEqual,
  );

  const getRoomMessages = useCallback(
    (roomId: string): ChatMessage[] => {
      return messages[roomId] || [];
    },
    [messages],
  );

   const normalizeTypingData = (data: any, isTyping: boolean) => {
     const roomId = data.room_id || data.roomId || data.roomid || '';
     const userId = data.user_id || data.userId || activeSession?.userId;
     const userName = data.user_name || data.userName || activeSession?.userName || '';
     return {
       roomId,
       userId,
       userName,
       isTyping,
       timestamp: data.timestamp || Date.now(),
     };
   };

  const handleTypingStartIncoming = useCallback(
    (data: any) => {
      const normalized = normalizeTypingData(data, true);
      if (!normalized.roomId || !normalized.userId) {
        console.warn('[useChatMessages] Invalid typing data', data);
        return;
      }
      dispatch(setTypingInfo(normalized));
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        dispatch(setTypingInfo({ ...normalized, isTyping: false }));
      }, 5000);
    },
    [dispatch, activeSession],
  );

  const handleTypingStopIncoming = useCallback(
    (data: any) => {
      const normalized = normalizeTypingData(data, false);
      if (!normalized.roomId || !normalized.userId) {
        console.warn('[useChatMessages] Invalid typing data', data);
        return;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      dispatch(setTypingInfo(normalized));
    },
    [dispatch, activeSession],
  );

  const normalizeRoomId = (data: any): string => {
    return data.room_id || data.roomId || data.roomid || data.roomID || '';
  };

  const handleReceiveMessage = useCallback(
    (data: any) => {
      console.log(
        `${DEBUG_PREFIX} [RECEIVE_MESSAGE] Incoming data:`,
        JSON.stringify(data, null, 2),
      );

      const room_id = normalizeRoomId(data);
      const sender_id = data.sender_id || data.senderId || data.senderID || '';
      const messageText = data.message || data.text || data.messageText || '';
      const imageUrl = data.image || data.imageUrl || null;
      const session_id =
        data.session_id || data.sessionId || data.sessionID || '';
      const msg_id =
        data.id || data.msg_id || data.messageId || `msg_${Date.now()}`;

      console.log(`${DEBUG_PREFIX} [RECEIVE_MESSAGE] Normalized values:`, {
        room_id,
        sender_id,
        messageText,
        session_id,
        msg_id,
      });

      if (!room_id) {
        console.log(
          `${DEBUG_PREFIX} [RECEIVE_MESSAGE] ❌ CRITICAL: No room_id found! Cannot dispatch message.`,
        );
        console.log(
          `${DEBUG_PREFIX} [RECEIVE_MESSAGE] 🔍 Available keys:`,
          Object.keys(data),
        );

        // FALLBACK: Try to find room from active session or chat requests
        if (activeSession?.roomId) {
          console.log(
            `${DEBUG_PREFIX} [RECEIVE_MESSAGE] 🔄 Using activeSession roomId: ${activeSession.roomId}`,
          );
          const incomingRoomId = activeSession.roomId;

        console.log("📩 Incoming replyTo:", data.replyTo);
        const message: ChatMessage = {
          id: msg_id,
          roomId: incomingRoomId,
          sessionId: activeSession.sessionId || session_id,
          senderId: sender_id || activeSession.userId || 'unknown',
          senderName:
            data.senderName ||
            data.sender_name ||
            activeSession.userName ||
            'User',
          receiverId:
            data.receiver_id ||
            data.receiverId ||
            activeSession.astrologerId ||
            '',
          receiverName:
            data.receiver_name ||
            data.receiverName ||
            activeSession.astrologerName ||
            '',
text: messageText,
         imageUrl,
           timestamp:
            data.created_at || data.timestamp || data.createdAt || Date.now(),
          status: 'delivered',
          isOwn: false,
          replyTo: data.replyTo
            ? {
                sender: data.replyTo.sender || '',
                message: data.replyTo.message || '',
                image: data.replyTo.image || null,
              }
            : null,
        };

        console.log(
          `${DEBUG_PREFIX} [RECEIVE_MESSAGE] ✅ Dispatching message with activeSession roomId`,
        );
        dispatch(addMessage(message));
          return;
        }

        // FALLBACK: Try to find from chatRequests
        if (chatRequests.length > 0) {
          const firstRequest = chatRequests[0];
          console.log(
            `${DEBUG_PREFIX} [RECEIVE_MESSAGE] 🔄 Using first chatRequest roomId: ${firstRequest.roomId}`,
          );

          console.log("📩 Incoming replyTo:", data.replyTo);
          const message: ChatMessage = {
            id: msg_id,
            roomId: firstRequest.roomId,
            sessionId: firstRequest.sessionId || session_id,
            senderId: sender_id || firstRequest.userId || 'unknown',
            senderName:
              data.senderName ||
              data.sender_name ||
              firstRequest.userName ||
              'User',
            receiverId:
              data.receiver_id ||
              data.receiverId ||
              firstRequest.astrologerId ||
              '',
            receiverName:
              data.receiver_name ||
              data.receiverName ||
              firstRequest.astrologerName ||
              '',
text: messageText,
         imageUrl,
             timestamp:
              data.created_at || data.timestamp || data.createdAt || Date.now(),
            status: 'delivered',
            isOwn: false,
            replyTo: data.replyTo
              ? {
                  sender: data.replyTo.sender || '',
                  message: data.replyTo.message || '',
                  image: data.replyTo.image || null,
                }
              : null,
          };

          console.log(
            `${DEBUG_PREFIX} [RECEIVE_MESSAGE] ✅ Dispatching message with chatRequest roomId`,
          );
          dispatch(addMessage(message));
          return;
        }

        console.log(
          `${DEBUG_PREFIX} [RECEIVE_MESSAGE] ❌ No fallback roomId found. Message dropped.`,
        );
        return;
      }

      const isOwnMessage = user?.id === sender_id;

      const message: ChatMessage = {
        id: msg_id,
        roomId: room_id,
        sessionId:
          session_id || activeSession?.sessionId || `session_${room_id}`,
        senderId: sender_id || activeSession?.userId || 'unknown',
        senderName:
          data.senderName ||
          data.sender_name ||
          activeSession?.userName ||
          (isOwnMessage ? user?.name : 'User'),
        receiverId:
          data.receiver_id ||
          data.receiverId ||
          activeSession?.astrologerId ||
          user?.id ||
          '',
        receiverName:
          data.receiver_name ||
          data.receiverName ||
          activeSession?.astrologerName ||
          '',
text: messageText,
         imageUrl,
         timestamp:
          data.created_at || data.timestamp || data.createdAt || Date.now(),
        status: 'delivered',
        isOwn: isOwnMessage,
        // console.log("📩 Incoming replyTo:", data.replyTo)
        replyTo: data.replyTo
          ? {
              sender: data.replyTo.sender || '',
              message: data.replyTo.message || '',
              image: data.replyTo.image || null,
            }
          : null,
      };

      console.log(
        `${DEBUG_PREFIX} [RECEIVE_MESSAGE] ✅ Dispatching addMessage:`,
        {
          id: message.id,
          roomId: message.roomId,
          text: message.text,
          isOwn: message.isOwn,
        },
      );

      dispatch(addMessage(message));
    },
    [dispatch, user, activeSession, chatRequests],
  );

  const handleChatStarted = useCallback(
    (data: any) => {
      console.log(
        `${DEBUG_PREFIX} [CHAT_STARTED] Incoming data:`,
        JSON.stringify(data, null, 2),
      );

      const room_id = normalizeRoomId(data);

      let sessionId = data.session_id || data.sessionId || data.sessionID || '';
      let userId = data.user_id || data.userId || data.userID || '';
      let userName = data.userName || data.user_name || 'User';
      let userProfilePic =
        data.userProfilePic || data.user_profile_pic || undefined;
      let astrologerId =
        data.astrologerId || data.astrologer_id || user?.id || '';
      let astrologerName =
        data.astrologerName ||
        data.astrologer_name ||
        user?.name ||
        'Astrologer';
      console.log('astro data here', data);
      let astrologerProfilePic =
        data.astrologerProfilePic || data.astrologer_profile_pic || undefined;
      const maximumTime = data.maximumTime || data.maximum_time || 15;
      const pricePerMinute = data.pricePerMinute || data.price_per_minute || 10;
      const remainingTime =
        data.remainingTime !== undefined ? data.remainingTime : maximumTime;

      if (!room_id) {
        console.log(
          `${DEBUG_PREFIX} [CHAT_STARTED] ❌ CRITICAL: No room_id! Cannot set session.`,
        );
        return;
      }

      if (!sessionId || !userId || userName === 'User') {
        const request = chatRequests.find(r => r.roomId === room_id);
        if (request) {
          sessionId = sessionId || request.sessionId;
          userId = userId || request.userId;
          userName = userName === 'User' ? request.userName : userName;
          userProfilePic = userProfilePic || request.userProfilePic;
          astrologerId = astrologerId || request.astrologerId;
          astrologerName =
            astrologerName === 'Astrologer'
              ? request.astrologerName
              : astrologerName;
          astrologerProfilePic =
            astrologerProfilePic || request.astrologerProfilePic;
        } else {
          const roomSession = chatSocketService.getRoomSession(room_id);
          if (roomSession) {
            sessionId = sessionId || roomSession.sessionId;
            userId = userId || roomSession.userId;
            userName = userName === 'User' ? roomSession.userName : userName;
          }
        }
      }

      const session: ActiveChatSession = {
        sessionId: sessionId || `session_${room_id}`,
        roomId: room_id,
        userId,
        userName,
        userProfilePic,
        astrologerId,
        astrologerName,
        astrologerProfilePic,
        startedAt: Date.now(),
        maximumTime,
        pricePerMinute,
        remainingTime,
      };

      console.log(`${DEBUG_PREFIX} [CHAT_STARTED] ✅ Setting active session:`, {
        sessionId: session.sessionId,
        roomId: session.roomId,
        userName: session.userName,
      });

      dispatch(setActiveSession(session));
    },
    [dispatch, user],
  );

  useEffect(() => {
    const callbacks = {
      onTypingStart: handleTypingStartIncoming,
      onTypingStop: handleTypingStopIncoming,
      onReceiveMessage: handleReceiveMessage,
      onChatStarted: handleChatStarted,
    };
    chatSocketService.addCallbacks(callbacks);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      chatSocketService.removeCallbacks(callbacks);
    };
  }, [activeSession]);

  const sendMessage = useCallback(
    async (
      text: string,
      imageUrl?: string,
      replyTo?: ChatMessage | string,
    ): Promise<ChatMessage | null> => {
      const timestamp = new Date().toISOString();

      console.log(
        `[useChatMessages] [SOCKET FLOW TRACE] SEND MESSAGE [${timestamp}]`,
      );

      if (!activeSession) {
        console.log(
          `[useChatMessages] ❌ Cannot send message - no activeSession`,
        );
        return null;
      }

      if (!text.trim()) {
        return null;
      }

      const currentUserId = user?.id;

      const senderId =
        currentUserId || activeSession.astrologerId || activeSession.userId;

      const receiverId =
        currentUserId === activeSession.astrologerId
          ? activeSession.userId
          : activeSession.astrologerId;

      if (!receiverId || !senderId) {
        console.warn(
          `[useChatMessages] ⚠️ Server missing sender/receiver, using fallback`,
          {
            currentUserId,
            activeSessionAstrologerId: activeSession.astrologerId,
            activeSessionUserId: activeSession.userId,
          },
        );
      }

      const { roomId, sessionId, userName, astrologerName } = activeSession;

      if (!roomId || !senderId) {
        console.log(
          `[useChatMessages] ❌ Cannot send message - missing critical fields:`,
          {
            roomId: !!roomId,
            receiverId: !!receiverId,
            senderId: !!senderId,
          },
        );
        return null;
      }

      const messageId = `msg_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const senderName =
        currentUserId === activeSession.astrologerId
          ? activeSession.astrologerName
          : activeSession.userName;
      const receiverName =
        currentUserId === activeSession.astrologerId
          ? activeSession.userName
          : activeSession.astrologerName;

      // Prepare replyTo object if replying
      let replyToData:
        | { sender: string; message: string; image?: string | null }
        | null;
      if (replyTo && typeof replyTo !== 'string') {
        replyToData = {
          sender: replyTo.isOwn ? 'You' : (replyTo.senderName || 'User'),
          message: replyTo.text,
          image: replyTo.imageUrl || null,
        };
        console.log("📤 Sending replyTo:", replyToData);
      } else {
        replyToData = null;
      }

      const tempMessage: ChatMessage = {
        id: messageId,
        roomId: activeSession.roomId,
        sessionId: activeSession.sessionId,
        senderId: senderId,
        senderName: senderName,
        receiverId: receiverId,
        receiverName: receiverName,
        text: text.trim(),
        imageUrl,
        replyTo: replyToData,
        timestamp: Date.now(),
        status: 'sending',
        isOwn: true,
      };

      console.log(
        `[useChatMessages] 🚀 Dispatching addMessage for room: ${roomId}`,
      );
      dispatch(addMessage(tempMessage));
      dispatch(addPendingMessage(tempMessage));
      console.log(`[useChatMessages] ✅ [STORE UPDATE] Message added locally`);

      try {
        const payload = {
          msg_id: messageId,
          sender_id: senderId,
          room_id: roomId,
          received_id: receiverId,
          message: text.trim(),
          image: imageUrl || null,
          sender: senderName,
          replyTo: replyToData,
        };

        console.log(
          `[useChatMessages] 📤 Emitting send_message:`,
          JSON.stringify(payload, null, 2),
        );
        await chatSocketService.sendMessage(payload as any);
        console.log(`[useChatMessages] ✅ send_message EMIT complete`);

        console.log(
          `[useChatMessages] 🚀 Dispatching updateMessageStatus to 'sent'`,
        );
        dispatch(
          updateMessageStatus({
            messageId,
            roomId: activeSession.roomId,
            status: 'sent',
          }),
        );
        dispatch(removePendingMessage(messageId));
        console.log(
          `[useChatMessages] ✅ [STORE UPDATE] Message status updated to 'sent'`,
        );

        return tempMessage;
      } catch (error) {
        console.log(`[useChatMessages] ❌ Failed to send message:`, error);
        dispatch(
          updateMessageStatus({
            messageId,
            roomId: activeSession.roomId,
            status: 'failed',
          }),
        );
        return null;
      }
    },
    [dispatch, activeSession, user],
  );

  const markMessageAsRead = useCallback(
    async (messageId: string) => {
      if (!activeSession) return;

      try {
        await chatSocketService.markMessageRead(
          messageId,
          activeSession.roomId,
        );
        dispatch(
          updateMessageStatus({
            messageId,
            roomId: activeSession.roomId,
            status: 'read',
          }),
        );
      } catch (error) {
        // Optionally log error
      }
    },
    [dispatch, activeSession],
  );

  const isUserTyping = useCallback(
    (roomId: string): boolean => {
      if (!activeSession) return false;
      const typingKey = `${roomId}_${activeSession.userId}`;
      return typingInfo[typingKey]?.isTyping ?? false;
    },
    [activeSession, typingInfo],
  );

  // Memoize the return object to prevent unnecessary re-renders of consumers
  const result = useMemo(
    () => ({
      getRoomMessages,
      sendMessage,
      markMessageAsRead,
      isUserTyping,
    }),
    [getRoomMessages, sendMessage, markMessageAsRead, isUserTyping],
  );

  return result;
};

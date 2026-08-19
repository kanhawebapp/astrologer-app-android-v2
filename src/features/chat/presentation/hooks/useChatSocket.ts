import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { RootState, AppDispatch } from '../../../../store';
import {
  setConnecting,
  setError,
  updateMessageStatus,
  endChatSession,
  resetChatStatus,
} from '../../../../store/slices/chatSlice';
import { chatSocketService } from '../../data/chatSocketService';

const DEBUG_PREFIX = '[useChatSocket]';

export const useChatSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isMounted = useRef(true);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const chatStatus = useSelector(
    (state: RootState) => state.chat.chatStatus,
    shallowEqual,
  );
  const activeSession = useSelector(
    (state: RootState) => state.chat.activeSession,
    shallowEqual,
  );
  const connecting = useSelector(
    (state: RootState) => state.chat.connecting,
    shallowEqual,
  );

  const handleUserDisconnected = useCallback(
    (data: { sessionId: string; roomId: string; userId: string }) => {
      if (isMounted.current) {
        dispatch(setError('User disconnected'));
      }
    },
    [dispatch],
  );

  const handleMessageRead = useCallback(
    (data: { messageId: string; roomId: string }) => {
      if (isMounted.current) {
        dispatch(
          updateMessageStatus({
            messageId: data.messageId,
            roomId: data.roomId,
            status: 'read',
          }),
        );
      }
    },
    [dispatch],
  );

  const handleMessageDelivered = useCallback(
    (data: { messageId: string; roomId: string }) => {
      if (isMounted.current) {
        dispatch(
          updateMessageStatus({
            messageId: data.messageId,
            roomId: data.roomId,
            status: 'delivered',
          }),
        );
      }
    },
    [dispatch],
  );

  const handleChatTimeout = useCallback(
    (data: { sessionId: string; roomId: string }) => {
      if (isMounted.current) {
        dispatch(endChatSession());
        dispatch(setError('Chat time exhausted'));
        setTimeout(() => {
          dispatch(resetChatStatus());
        }, 3000);
      }
    },
    [dispatch],
  );

  const handleConnectionChange = useCallback(
    (connected: boolean) => {
      if (isMounted.current) {
        dispatch(setConnecting(connected));
        if (!connected && retryCount.current < maxRetries) {
          retryCount.current += 1;
          console.log(
            '[useChatSocket] Connection lost, retry:',
            retryCount.current,
          );
        }
      }
    },
    [dispatch],
  );

  useEffect(() => {
    isMounted.current = true;
    dispatch(setConnecting(true));
    console.log(`${DEBUG_PREFIX} Setting up socket listeners...`);

    const callbacks = {
      onUserDisconnected: handleUserDisconnected,
      onMessageRead: handleMessageRead,
      onMessageDelivered: handleMessageDelivered,
      onChatTimeout: handleChatTimeout,
      onConnectionChange: handleConnectionChange,
    };
    chatSocketService.addCallbacks(callbacks);

    chatSocketService
      .setupListeners()
      .then(() => {
        console.log(`${DEBUG_PREFIX} Socket listeners setup complete`);
      })
      .catch(error => {
        console.log(`${DEBUG_PREFIX} Failed to setup listeners:`, error);
        dispatch(setError('Failed to connect to chat'));
      });

    return () => {
      isMounted.current = false;
      chatSocketService.removeCallbacks(callbacks);
      console.log(`${DEBUG_PREFIX} Cleaning up socket listeners...`);
      console.log(`${DEBUG_PREFIX} Cleanup complete`);
    };
  }, []);

  const completeChat = useCallback(async () => {
    console.log('[END_CHAT_DEBUG] completeChat() triggered', {
      activeSession: !!activeSession,
      roomId: activeSession?.roomId,
      sessionId: activeSession?.sessionId,
    });
    console.log('🔴 [useChatSocket] completeChat() triggered');
    if (activeSession) {
      try {
        console.log(
          '🔴 [useChatSocket] Emitting completeChat for session:',
          activeSession.sessionId,
          'room:',
          activeSession.roomId,
        );
        await chatSocketService.completeChat(
          activeSession.sessionId,
          activeSession.roomId,
        );
        console.log(
          '🔴 [useChatSocket] completeChat emit succeeded, dispatching endChatSession',
        );
        dispatch(endChatSession());
      } catch (error) {
        console.log('[useChatSocket] Error completing chat:', error);
        dispatch(setError('Failed to complete chat'));
      }
    } else {
      console.warn(
        '🔴 [useChatSocket] completeChat called but no activeSession',
      );
    }
  }, [dispatch, activeSession]);

  const leaveChat = useCallback(
    async (reason: string = 'Astrologer left') => {
      if (activeSession) {
        try {
          await chatSocketService.leaveChat(
            activeSession.sessionId,
            activeSession.roomId,
            reason,
          );
          dispatch(endChatSession());
        } catch (error) {
          console.log('[useChatSocket] Error leaving chat:', error);
          dispatch(endChatSession());
        }
      }
    },
    [dispatch, activeSession],
  );

  return {
    chatStatus,
    activeSession,
    connecting,
    completeChat,
    leaveChat,
  };
};

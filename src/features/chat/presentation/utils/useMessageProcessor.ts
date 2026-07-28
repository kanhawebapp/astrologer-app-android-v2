import { useMemo } from 'react';
import type { ChatMessage } from '../../domain/chatTypes';

interface UseMessageProcessorProps {
  messages: ChatMessage[];
  authUserId?: string;
}

export const useMessageProcessor = ({
  messages,
  authUserId,
}: UseMessageProcessorProps) => {
  const processedMessages = useMemo(() => {
    if (!messages || messages.length === 0) {
      return [];
    }

    return [...messages];
  }, [messages]);

  const messagesWithUserInfo = useMemo(() => {
    const hasUserInfo = processedMessages.some(m => m.type === 'USER_INFO');
    if (hasUserInfo) return processedMessages;

    const userInfoMessage: ChatMessage = {
      id: 'user-info',
      text: '',
      isOwn: false,
      timestamp: 0,
      type: 'USER_INFO',
      roomId: '',
      sessionId: '',
      senderId: '',
      senderName: '',
      receiverId: '',
      receiverName: '',
      status: 'delivered',
    };

    return [...processedMessages, userInfoMessage];
  }, [processedMessages]);

  const reversedMessages = useMemo(() => {
    return [...messagesWithUserInfo].reverse();
  }, [messagesWithUserInfo]);

  const getFirstUserMessageIndex = useMemo(() => {
    return reversedMessages.findIndex(m => !m.isOwn);
  }, [reversedMessages]);

  return {
    processedMessages,
    messagesWithUserInfo,
    reversedMessages,
    getFirstUserMessageIndex,
  };
};

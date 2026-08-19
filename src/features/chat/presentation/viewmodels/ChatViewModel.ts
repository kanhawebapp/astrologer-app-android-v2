import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Alert, BackHandler, FlatList, Keyboard, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../store';
import { setActiveChat } from '../../../../store/slices/chatSlice';
import { selectMessagesByRoom } from '../../../../store/selectors/chatSelectors';
import { useChatSocket, useChatMessages, useChatTimer } from '../hooks';
import type { ChatMessage, ReplyToData } from '../../domain/chatTypes';
import { RootStackParamList } from '../../../../navigation/types';
import { socketManager } from '../../../../services/socket/socketManager';

const DEBUG_PREFIX = '[ChatViewModel]';

interface RouteParams {
  chatId?: string;
  sessionId?: string;
  roomId?: string;
  userId?: string;
  userName?: string;
  maximumTime?: number;
}

export const useChatViewModel = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'ChatScreen'>>();
  const dispatch = useDispatch<AppDispatch>();

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const prevMessageCountRef = useRef(0);
  const hasJoinedRoomRef = useRef(false);

  // Local state
  const [replyToMessage, setReplyToMessage] = useState<ReplyToData | undefined>(
    undefined,
  );
  const [isTyping, setIsTyping] = useState(false);

  // Route params
  const routeParams = route.params || {};
  const {
    chatId,
    sessionId: paramSessionId,
    roomId: paramRoomId,
    userId: paramUserId,
    userName: paramUserName,
    maximumTime: paramMaxTime,
  } = routeParams as RouteParams;

  // Socket hooks
  const {
    chatStatus,
    activeSession,
    connecting,
    completeChat,
    leaveChat,
  } = useChatSocket();

  // Message hook
  const { sendMessage } = useChatMessages();

  // Timer hook
  const {
    remainingTime,
    isTimeCritical,
    formattedTime,
    isTimeLow,
    progress,
    isActive,
  } = useChatTimer();

  // Redux state
  const chatRequests = useSelector(
    (state: RootState) => state.chat.chatRequests,
  );
  const error = useSelector((state: RootState) => state.chat.error);
  const chats = useSelector((state: RootState) => state.chat.chats);
  const authUser = useSelector((state: RootState) => state.auth.user);

  // Derived: effective room ID
  const effectiveRoomId = useMemo((): string | undefined => {
    if (paramRoomId) return paramRoomId;
    if (activeSession?.roomId) return activeSession.roomId;
    if (chatId) {
      const foundChat = chats.find(c => c.id === chatId);
      if (foundChat?.roomId) return foundChat.roomId;
    }
    return undefined;
  }, [paramRoomId, activeSession?.roomId, chatId, chats]);

  // Selector for current room messages
  const selectCurrentMessages = useMemo(
    () => (state: RootState) =>
      effectiveRoomId ? selectMessagesByRoom(state, effectiveRoomId) : [],
    [effectiveRoomId],
  );
  const currentMessages = useSelector(selectCurrentMessages);

  // Typing indicator state
  const typingInfo = useSelector((state: RootState) => state.chat.typingInfo);
  const isUserTypingIndicator =
    activeSession &&
    Object.values(typingInfo).some(
      t => t.roomId === activeSession.roomId && t.isTyping,
    );

  useEffect(() => {
    return () => {
      socketManager.off('typing');
    };
  }, []);

  // Current request
  const currentRequest =
    chatStatus === 'REQUEST' ? chatRequests[0] || null : null;

  // Effects that don't depend on local handlers

  // Set active chat when session starts
  useEffect(() => {
    if (activeSession) {
      dispatch(setActiveChat(activeSession.roomId));
    }
  }, [activeSession, dispatch]);

  // Join room on mount/room change
  useEffect(() => {
    if (!effectiveRoomId || hasJoinedRoomRef.current) {
      if (!effectiveRoomId) {
        console.warn(
          `${DEBUG_PREFIX} Cannot join room - effectiveRoomId is undefined`,
        );
      }
      return;
    }
    hasJoinedRoomRef.current = true;
    console.log(
      `${DEBUG_PREFIX} [ROOM JOIN] 🚪 Joining room: ${effectiveRoomId}`,
    );
    socketManager.waitUntilConnected().then(() => {
      socketManager.emit('join_room', { room_id: effectiveRoomId });
    });
  }, [effectiveRoomId]);

  const pendingScrollToLatestRef = useRef(false);

  const scrollToLatest = useCallback((animated = true) => {
    pendingScrollToLatestRef.current = true;
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated });
    });
  }, []);

  const handleContentSizeChange = useCallback(() => {
    if (!pendingScrollToLatestRef.current) {
      return;
    }
    pendingScrollToLatestRef.current = false;
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (currentMessages.length > prevMessageCountRef.current) {
      scrollToLatest(true);
    }
    prevMessageCountRef.current = currentMessages.length;
  }, [currentMessages.length, scrollToLatest]);

  // Keep the latest inverted-list items above the keyboard
  useEffect(() => {
    const event = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(event, () => {
      scrollToLatest(true);
    });
    return () => sub.remove();
  }, [scrollToLatest]);

  // Typing listener
  useEffect(() => {
    const handleTyping = (data: any) => {
      if (!data) return;
      const incomingRoomId = data.room_id || data.roomId || data.roomid;
      if (incomingRoomId !== effectiveRoomId) return;
      const typingStatus = data.typing ?? false;
      if (data?.user_name !== 'Astrologer') {
        setIsTyping(typingStatus);
      }
    };
    socketManager.off('typing', handleTyping);
    socketManager.on('typing', handleTyping);
    return () => {
      socketManager.off('typing', handleTyping);
    };
  }, [effectiveRoomId]);

  // Navigate back when chat ends
  useEffect(() => {
    if (chatStatus === 'ENDED') {
      console.log(
        `${DEBUG_PREFIX} Chat status changed to ENDED, navigating back`,
      );
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    }
  }, [chatStatus, navigation]);

  // Handlers (must be defined before any effect that uses them)
  const handleLeave = useCallback(async () => {
    await leaveChat('Astrologer left the chat');
    navigation.goBack();
  }, [leaveChat, navigation]);

  const handleEndChat = useCallback(() => {
    console.log('[ChatViewModel] handleEndChat() triggered');
    // Alert.alert('End Chat', 'Are you sure you want to end this chat?', [
    //   { text: 'Cancel', style: 'cancel' },
    //   { text: 'End Chat', style: 'destructive', onPress: () => completeChat() },
    // ]);
    completeChat();
  }, [completeChat]);

  const handleCancelChatRequest = useCallback(() => {
    const astroid = authUser?.id;
    const room_id = paramRoomId || activeSession?.roomId;
    const user_id = activeSession?.userId || paramUserId;

    if (!room_id || !astroid) {
      console.log(`${DEBUG_PREFIX}  Missing required fields`, {
        room_id,
        astroid,
      });
      return;
    }

    Alert.alert('Cancel Chat?', 'This will terminate the session', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Chat',
        style: 'destructive',
        onPress: async () => {
          console.log('[END_CHAT_DEBUG] button pressed', {
            roomId: room_id,
            activeChat: !!activeSession,
            chatStatus,
            sessionId: activeSession?.sessionId,
          });
          socketManager.emit('complted_chat', {
            room_id,
            astroId: astroid,
            user_id,
          });
          console.log('[END_CHAT_DEBUG] socket event emitted', {
            event: 'complted_chat',
            room_id,
          });

          setTimeout(async () => {
            console.log('[END_CHAT_DEBUG] delayed branch', {
              chatStatusNow: chatStatus,
              willCallHandleEndChat:
                chatStatus === 'REQUEST' || chatStatus === 'ACTIVE',
            });
            if (chatStatus === 'REQUEST') {
              console.log('[END_CHAT_DEBUG] endChat called via handleEndChat (REQUEST)');
              handleEndChat();
            } else if (chatStatus === 'ACTIVE') {
              socketManager.emit('complted_chat', {
                room_id,
                astroid,
                user_id,
              });
              console.log('[END_CHAT_DEBUG] leaveChat called');
              await leaveChat('Astrologer cancelled the chat');
              setTimeout(handleEndChat, 300);
            } else {
              console.log('[END_CHAT_DEBUG] skipped handleEndChat because chatStatus is', chatStatus);
            }
          }, 300);
        },
      },
    ]);
  }, [
    paramRoomId,
    activeSession,
    paramUserId,
    chatStatus,
    handleEndChat,
    leaveChat,
    authUser,
  ]);

  const handleBack = useCallback(() => {
    if (chatStatus === 'ACTIVE') {
      handleCancelChatRequest();
    } else {
      navigation.goBack();
    }
  }, [chatStatus, navigation, handleCancelChatRequest]);

  useEffect(() => {
    const onHardwareBackPress = () => {
      if (chatStatus === 'ACTIVE') {
        handleBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBackPress,
    );

    return () => subscription.remove();
  }, [chatStatus, handleBack]);


  //   const handleCancelChatRequest = useCallback(() => {
  //   const astroid = authUser?.id;
  //   const room_id = paramRoomId || activeSession?.roomId;
  //   const user_id = activeSession?.userId || paramUserId;

  //   if (!room_id || !astroid) {
  //     console.log(`${DEBUG_PREFIX} Missing required fields`, {
  //       room_id,
  //       astroid,
  //     });
  //     return;
  //   }
  //   console.log("---------astroId===========", astroid)
  //   if (chatStatus === 'REQUEST') {
  //     socketManager.emit('end_chat_by_astrologer', {
  //       roomId: room_id,
  //       astroId: astroid,
  //       status: 'leave',
  //     });

  //     socketManager.emit('complted_chat', {
  //       room_id,
  //       astroid,
  //       user_id,
  //     });

  //     handleEndChat();
  //     return;
  //   }

  //   if (chatStatus === 'ACTIVE') {
  //     Alert.alert('Cancel Chat?', 'This will terminate the session', [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: 'Cancel Chat',
  //         style: 'destructive',
  //         onPress: async () => {
  //           socketManager.emit('end_chat_by_astrologer', {
  //             roomId: room_id,
  //             astroId: astroid,
  //             status: 'leave',
  //           });

  //           socketManager.emit('complted_chat', {
  //             room_id,
  //             astroid,
  //             user_id,
  //           });

  //           await leaveChat('Astrologer cancelled the chat');
  //           handleEndChat();
  //         },
  //       },
  //     ]);
  //   }
  // }, [
  //   paramRoomId,
  //   activeSession,
  //   paramUserId,
  //   chatStatus,
  //   handleEndChat,
  //   leaveChat,
  //   authUser,
  // ]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      await sendMessage(text, undefined, replyToMessage);
      setReplyToMessage(undefined);
    },
    [sendMessage, replyToMessage],
  );

  const handleReplyPress = useCallback((message: ChatMessage) => {
    console.log('Reply message:', message);
    console.log('Reply image:', message.image || message.imageUrl);
    const replyTo: ReplyToData = {
      sender: message.isOwn ? 'You' : message.senderName || 'User',
      message: message.text === '[EMPTY]' ? '' : message.text || '',
      image: message.image || message.imageUrl || null,
    };
    console.log('ReplyTo data:', replyTo);
    setReplyToMessage(replyTo);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyToMessage(undefined);
  }, []);

  // Time-critical alert (after handlers)
  useEffect(() => {
    if (isTimeCritical && remainingTime === 0) {
      Alert.alert('Time Exhausted', 'Your chat time has ended.', [
        { text: 'OK', onPress: () => handleEndChat() },
      ]);
    }
  }, [isTimeCritical, remainingTime, handleEndChat]);

  // Message processing memos
  const reversedMessages = useMemo(
    () => [...currentMessages].reverse(),
    [currentMessages],
  );

  const userInfoMessage = useMemo(
    () => ({
      id: 'user-info',
      text: '',
      isOwn: false,
      timestamp: 0,
      type: 'USER_INFO',
    }),
    [],
  );

  const finalMessages = useMemo(() => {
    const hasUserInfo = reversedMessages?.some(m => m.type === 'USER_INFO');
    if (hasUserInfo) return reversedMessages;
    return [...reversedMessages, userInfoMessage];
  }, [reversedMessages, userInfoMessage]);

  // Computed flags
  const showEndButton = useMemo(() => chatStatus === 'ACTIVE', [chatStatus]);
  const showCancelButton = useMemo(
    () => chatStatus === 'REQUEST' || chatStatus === 'ACTIVE',
    [chatStatus],
  );

  // ViewModel object
  const viewModel = useMemo(
    () => ({
      chatStatus,
      activeSession,
      connecting,
      error,
      chatRequests,
      currentRequest,
      effectiveRoomId,
      currentMessages,
      finalMessages,
      isUserTyping: isUserTypingIndicator,
      isTyping,
      replyToMessage,
      authUser,
      paramRoomId,
      showEndButton,
      showCancelButton,
      formattedTime,
      isTimeLow,
      isTimeCritical,
      progress,
      isActive,
      handleBack,
      handleEndChat,
      handleLeave,
      handleCancelChatRequest,
      handleSendMessage,
      handleReplyPress,
      handleCancelReply,
      handleContentSizeChange,
      flatListRef,
      prevMessageCountRef,
    }),
    [
      chatStatus,
      activeSession,
      connecting,
      error,
      chatRequests,
      currentRequest,
      effectiveRoomId,
      currentMessages,
      finalMessages,
      isUserTypingIndicator,
      isTyping,
      replyToMessage,
      authUser,
      paramRoomId,
      showEndButton,
      showCancelButton,
      formattedTime,
      isTimeLow,
      isTimeCritical,
      progress,
      isActive,
      handleBack,
      handleEndChat,
      handleLeave,
      handleCancelChatRequest,
      handleSendMessage,
      handleReplyPress,
      handleCancelReply,
      handleContentSizeChange,
      flatListRef,
      prevMessageCountRef,
    ],
  );

  return viewModel;
};

import {useCallback, useEffect, useRef, useState} from 'react';
import {
  ChatClient,
  ChatConnectEventListener,
  ChatConversationType,
  ChatError,
  ChatMessage,
  ChatMessageChatType,
  ChatMessageEventListener,
  ChatMessageType,
  ChatOptions,
  ChatRoomEventListener,
  ChatTextMessageBody,
} from 'react-native-agora-chat';
import {LiveChatCredentials, LiveChatMessage} from '../../domain/liveTypes';
import {
  addAudiencePresence,
  AudiencePresenceTracker,
  createAudiencePresenceTracker,
  removeAudiencePresence,
  replaceAudiencePresence,
  resetAudiencePresence,
} from '../../domain/audiencePresenceTracker';
import {liveLog, liveWarn} from '../../data/liveLogger';

export type LiveChatStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed';

export const LIVE_CHAT_MAX_LENGTH = 500;
const HISTORY_PAGE_SIZE = 20;
const MAX_MESSAGES = 200;

// ChatClient is a process-wide native singleton, so init/login/join/logout must never interleave across mounts.
let initializedAppKey: string | null = null;
let chatQueue: Promise<unknown> = Promise.resolve();

const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
  const next = chatQueue.then(task, task);
  chatQueue = next.catch(() => undefined);
  return next;
};

const ignore = () => undefined;

const describeChatError = (error: unknown) => {
  const chatError = error as Partial<ChatError> & {message?: string};
  return {
    code: typeof chatError?.code === 'number' ? chatError.code : undefined,
    description: chatError?.description || chatError?.message || String(error),
  };
};

// Viewers read the sender name from `attributes.nickname`, so it must stay in sync with the DhwaniAstro app.
const toLiveChatMessage = (
  message: ChatMessage,
  currentUserId: string,
): LiveChatMessage | null => {
  if (message.body?.type !== ChatMessageType.TXT) {
    return null;
  }
  const text = ((message.body as ChatTextMessageBody).content ?? '').trim();
  if (!text) {
    return null;
  }
  const nickname = message.attributes?.nickname ?? message.attributes?.name;
  return {
    id: message.msgId || message.localMsgId,
    senderId: message.from,
    senderName: typeof nickname === 'string' ? nickname : undefined,
    text,
    timestamp: message.serverTime || message.localTime || Date.now(),
    isOwn: message.from === currentUserId,
    status: 'sent',
  };
};

const isLiveChatMessage = (
  item: LiveChatMessage | null,
): item is LiveChatMessage => item !== null;

const mergeMessages = (
  existing: LiveChatMessage[],
  incoming: LiveChatMessage[],
): LiveChatMessage[] => {
  const known = new Set(existing.map(item => item.id));
  const additions = incoming.filter(item => {
    if (known.has(item.id)) {
      return false;
    }
    known.add(item.id);
    return true;
  });
  if (additions.length === 0) {
    return existing;
  }
  return [...existing, ...additions]
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-MAX_MESSAGES);
};

const confirmMessage = (
  existing: LiveChatMessage[],
  pendingId: string,
  serverId: string,
): LiveChatMessage[] => {
  const id = serverId || pendingId;
  if (id !== pendingId && existing.some(item => item.id === id)) {
    return existing.filter(item => item.id !== pendingId);
  }
  return existing.map(item =>
    item.id === pendingId ? {...item, id, status: 'sent'} : item,
  );
};

interface UseLiveRoomChatOptions {
  /** Null until JoinLive returns usable chat credentials, or after the session ends. */
  credentials: LiveChatCredentials | null;
  senderName?: string;
  /** Re-fetches JoinLive credentials so an expiring or expired chat token can be replaced. */
  refreshCredentials?: () => Promise<LiveChatCredentials>;
}

/**
 * Logs in to Agora Chat with the live session's credentials, joins its chat room,
 * and streams room messages. Independent of RTC: failures here only affect chat.
 */
export const useLiveRoomChat = ({
  credentials,
  senderName,
  refreshCredentials,
}: UseLiveRoomChatOptions) => {
  const chatAppKey = credentials?.chatAppKey ?? '';
  const chatUserId = credentials?.chatUserId ?? '';
  const chatToken = credentials?.chatToken ?? '';
  const chatRoomId = credentials?.chatRoomId ?? '';
  const enabled = credentials !== null;

  const [status, setStatus] = useState<LiveChatStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [attempt, setAttempt] = useState(0);
  /**
   * Chat-room members excluding the local broadcaster. Used as a reliable
   * viewer signal when Agora LIVE_BROADCASTING does not emit onUserJoined
   * for ClientRoleAudience (see DhwaniAstro useLiveAudienceRtc).
   */
  const [chatAudienceCount, setChatAudienceCount] = useState(0);
  const joinedRoomRef = useRef<string | null>(null);
  const messagesRoomRef = useRef<string | null>(null);
  const chatAudienceRef = useRef<AudiencePresenceTracker<string>>(
    createAudiencePresenceTracker<string>(),
  );
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const senderNameRef = useRef(senderName);
  senderNameRef.current = senderName;
  const refreshRef = useRef(refreshCredentials);
  refreshRef.current = refreshCredentials;

  const resetChatAudience = useCallback(() => {
    chatAudienceRef.current = resetAudiencePresence<string>();
    setChatAudienceCount(0);
  }, []);

  useEffect(() => {
    if (!enabled) {
      joinedRoomRef.current = null;
      resetChatAudience();
      setStatus('idle');
      setError(null);
      return;
    }
    if (messagesRoomRef.current !== chatRoomId) {
      messagesRoomRef.current = chatRoomId;
      setMessages([]);
      resetChatAudience();
    }

    const client = ChatClient.getInstance();
    const isRetry = attempt > 0;
    let active = true;
    let wasDisconnected = false;
    setStatus('connecting');
    setError(null);

    const fail = (message: string) => {
      if (!active) {
        return;
      }
      joinedRoomRef.current = null;
      resetChatAudience();
      setStatus('failed');
      setError(message);
    };

    const isSameChatIdentity = (fresh: LiveChatCredentials) =>
      fresh.chatAppKey === chatAppKey &&
      fresh.chatUserId === chatUserId &&
      fresh.chatRoomId === chatRoomId;

    const loadHistory = async () => {
      try {
        const history = await client.chatManager.fetchHistoryMessagesByOptions(
          chatRoomId,
          ChatConversationType.RoomChat,
          {pageSize: HISTORY_PAGE_SIZE},
        );
        const historyMessages = (history?.list ?? [])
          .map(message => toLiveChatMessage(message, chatUserId))
          .filter(isLiveChatMessage);
        if (active && historyMessages.length > 0) {
          setMessages(prev => mergeMessages(prev, historyMessages));
        }
      } catch (historyError) {
        liveWarn(
          'Live chat history unavailable',
          describeChatError(historyError),
        );
      }
    };

    const syncChatAudience = (next: AudiencePresenceTracker<string>) => {
      if (next === chatAudienceRef.current) {
        return;
      }
      chatAudienceRef.current = next;
      setChatAudienceCount(next.count);
    };

    const loadRoomMembers = async () => {
      try {
        const page = await client.roomManager.fetchChatRoomMembers(chatRoomId);
        if (!active) {
          return;
        }
        const memberIds = (page?.list ?? []).filter(
          (id): id is string => typeof id === 'string' && id.length > 0,
        );
        const next = replaceAudiencePresence(memberIds, chatUserId);
        syncChatAudience(next);
        liveLog('Live chat audience snapshot', {count: next.count});
      } catch (membersError) {
        liveWarn(
          'Live chat audience snapshot unavailable',
          describeChatError(membersError),
        );
      }
    };

    const messageListener: ChatMessageEventListener = {
      onMessagesReceived: received => {
        if (!active) {
          return;
        }
        const roomMessages = received
          .filter(
            message =>
              message.chatType === ChatMessageChatType.ChatRoom &&
              message.conversationId === chatRoomId,
          )
          .map(message => toLiveChatMessage(message, chatUserId))
          .filter(isLiveChatMessage);
        if (roomMessages.length > 0) {
          setMessages(prev => mergeMessages(prev, roomMessages));
        }
      },
    };

    const roomListener: ChatRoomEventListener = {
      onMemberJoined: ({roomId, participant}) => {
        if (!active || roomId !== chatRoomId || !participant) {
          return;
        }
        const next = addAudiencePresence(
          chatAudienceRef.current,
          participant,
          chatUserId,
        );
        syncChatAudience(next);
        liveLog('Live chat member joined', {
          participant,
          audienceCount: next.count,
        });
      },
      onMemberExited: ({roomId, participant}) => {
        if (!active || roomId !== chatRoomId || !participant) {
          return;
        }
        const next = removeAudiencePresence(
          chatAudienceRef.current,
          participant,
        );
        syncChatAudience(next);
        liveLog('Live chat member left', {
          participant,
          audienceCount: next.count,
        });
      },
      onMemberRemoved: ({roomId, participant}) => {
        if (!active || roomId !== chatRoomId || !participant) {
          return;
        }
        const next = removeAudiencePresence(
          chatAudienceRef.current,
          participant,
        );
        syncChatAudience(next);
      },
    };

    const connectionListener: ChatConnectEventListener = {
      onConnected: () => {
        if (!active || joinedRoomRef.current !== chatRoomId) {
          return;
        }
        liveLog('Live chat connected');
        setStatus('connected');
        setError(null);
        if (wasDisconnected) {
          wasDisconnected = false;
          // Room messages sent while offline are not redelivered, so backfill the gap.
          loadHistory();
          loadRoomMembers();
        }
      },
      onDisconnected: () => {
        if (!active || joinedRoomRef.current !== chatRoomId) {
          return;
        }
        liveWarn('Live chat disconnected');
        wasDisconnected = true;
        setStatus('reconnecting');
      },
      onTokenWillExpire: () => {
        const refresh = refreshRef.current;
        if (!active || !refresh) {
          return;
        }
        liveLog('Live chat token renewal started');
        refresh()
          .then(fresh => {
            if (!active) {
              return;
            }
            if (!isSameChatIdentity(fresh)) {
              liveWarn(
                'Live chat token renewal skipped: chat identity changed',
              );
              return;
            }
            return client
              .renewAgoraToken(fresh.chatToken)
              .then(() => liveLog('Live chat token renewed'));
          })
          .catch(renewError =>
            liveWarn(
              'Live chat token renewal failed',
              describeChatError(renewError),
            ),
          );
      },
      onTokenDidExpire: () =>
        fail('Chat session expired. Tap Retry to reconnect.'),
      onUserDidLoginFromOtherDevice: () =>
        fail('Chat was opened on another device.'),
      onUserDidRemoveFromServer: () =>
        fail('Chat account is no longer available.'),
      onUserDidForbidByServer: () => fail('Chat access was blocked.'),
    };

    const setup = async () => {
      let token = chatToken;
      const refresh = refreshRef.current;
      // A retry usually follows an expired or rejected token, so never reuse the original one.
      if (isRetry && refresh) {
        const fresh = await refresh();
        if (isSameChatIdentity(fresh)) {
          token = fresh.chatToken;
        }
      }
      if (!active) {
        return;
      }

      if (initializedAppKey !== chatAppKey) {
        if (initializedAppKey === null) {
          await client.init(
            ChatOptions.withAppKey({appKey: chatAppKey, autoLogin: false}),
          );
        } else {
          await client.logout(false).catch(ignore);
          await client.changeAppKey(chatAppKey);
        }
        initializedAppKey = chatAppKey;
      }

      const currentUser = client.currentUserName;
      if (currentUser && currentUser !== chatUserId) {
        await client.logout(false).catch(ignore);
      }
      if (client.currentUserName !== chatUserId) {
        await client.loginWithToken(chatUserId, token);
      }
      if (!active) {
        return;
      }
      await client.roomManager.joinChatRoomEx({
        roomId: chatRoomId,
        exitOtherRoom: true,
      });
    };

    const teardown = async () => {
      await client.roomManager.leaveChatRoom(chatRoomId).catch(ignore);
      await client.logout(false).catch(ignore);
      liveLog('Live chat left');
    };

    client.chatManager.addMessageListener(messageListener);
    client.addConnectionListener(connectionListener);
    client.roomManager.addRoomListener(roomListener);
    liveLog('Live chat connection started', {isRetry});

    enqueue(setup)
      .then(() => {
        if (!active) {
          return;
        }
        joinedRoomRef.current = chatRoomId;
        setStatus('connected');
        liveLog('Live chat room joined');
        loadHistory();
        loadRoomMembers();
      })
      .catch(setupError => {
        liveWarn('Live chat connection failed', describeChatError(setupError));
        fail('Unable to connect to live chat.');
      });

    return () => {
      active = false;
      joinedRoomRef.current = null;
      resetChatAudience();
      client.chatManager.removeMessageListener(messageListener);
      client.removeConnectionListener(connectionListener);
      client.roomManager.removeRoomListener(roomListener);
      enqueue(teardown);
    };
  }, [
    enabled,
    chatAppKey,
    chatUserId,
    chatToken,
    chatRoomId,
    attempt,
    resetChatAudience,
  ]);

  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      const content = text.trim();
      if (
        !content ||
        content.length > LIVE_CHAT_MAX_LENGTH ||
        !chatRoomId ||
        joinedRoomRef.current !== chatRoomId
      ) {
        return false;
      }

      const message = ChatMessage.createTextMessage(
        chatRoomId,
        content,
        ChatMessageChatType.ChatRoom,
      );
      const nickname = senderNameRef.current?.trim();
      if (nickname) {
        message.attributes = {nickname};
      }
      const pendingId = message.msgId;
      setMessages(prev =>
        mergeMessages(prev, [
          {
            id: pendingId,
            senderId: chatUserId,
            senderName: nickname || undefined,
            text: content,
            timestamp: message.localTime || Date.now(),
            isOwn: true,
            status: 'sending',
          },
        ]),
      );

      const markFailed = (sendError: unknown) => {
        liveWarn('Live chat message failed', describeChatError(sendError));
        setMessages(prev =>
          prev.map(item =>
            item.id === pendingId ? {...item, status: 'failed'} : item,
          ),
        );
      };

      try {
        await ChatClient.getInstance().chatManager.sendMessage(message, {
          onSuccess: sent =>
            setMessages(prev => confirmMessage(prev, pendingId, sent.msgId)),
          onError: (_localMsgId, sendError) => markFailed(sendError),
        });
      } catch (sendError) {
        markFailed(sendError);
      }
      return true;
    },
    [chatRoomId, chatUserId],
  );

  const retryMessage = useCallback(
    (id: string) => {
      const failed = messagesRef.current.find(
        item => item.id === id && item.status === 'failed',
      );
      if (!failed || joinedRoomRef.current !== chatRoomId) {
        return;
      }
      setMessages(prev => prev.filter(item => item.id !== id));
      sendMessage(failed.text);
    },
    [chatRoomId, sendMessage],
  );

  const reconnect = useCallback(() => setAttempt(prev => prev + 1), []);

  return {
    status,
    error,
    messages,
    /** Chat-room members excluding the local broadcaster. */
    chatAudienceCount,
    sendMessage,
    retryMessage,
    reconnect,
  };
};

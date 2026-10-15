import React, {memo, useCallback, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {AppText} from '../../../../components/common/AppText';
import {useTheme} from '../../../../hooks/useTheme';
import {LiveChatCredentials, LiveChatMessage} from '../../domain/liveTypes';
import {LIVE_CHAT_MAX_LENGTH, useLiveRoomChat} from '../hooks/useLiveRoomChat';

const OVERLAY_BACKGROUND = 'rgba(0,0,0,0.45)';
const MUTED_TEXT = 'rgba(255,255,255,0.65)';
const MAX_LIST_HEIGHT = 320;
const LIST_HEIGHT_RATIO = 0.35;

const formatMessageTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours % 12 || 12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
};

const keyExtractor = (item: LiveChatMessage) => item.id;

interface MessageRowProps {
  item: LiveChatMessage;
  onRetry: (id: string) => void;
}

const MessageRow = memo(({item, onRetry}: MessageRowProps) => {
  const {theme} = useTheme();
  const colors = theme.colors;
  return (
    <View style={styles.messageRow}>
      <View style={styles.messageHeader}>
        <AppText
          variant="caption"
          color={item.isOwn ? colors.accentGold : colors.white}
          numberOfLines={1}
          style={styles.senderName}>
          {item.isOwn ? 'You' : item.senderName || item.senderId}
        </AppText>
        <AppText variant="caption" color={MUTED_TEXT}>
          {formatMessageTime(item.timestamp)}
        </AppText>
      </View>
      <AppText variant="body2" color={colors.white}>
        {item.text}
      </AppText>
      {item.status === 'sending' && (
        <AppText variant="caption" color={MUTED_TEXT}>
          Sending...
        </AppText>
      )}
      {item.status === 'failed' && (
        <TouchableOpacity
          onPress={() => onRetry(item.id)}
          accessibilityLabel="Retry sending message">
          <AppText variant="caption" color={colors.error}>
            Not sent. Tap to retry
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
});

interface LiveChatPanelProps {
  credentials: LiveChatCredentials | null;
  /** JoinLive succeeded but returned no usable chat credentials. */
  isUnavailable: boolean;
  /** JoinLive is in flight, so credentials may still arrive. */
  isPreparing: boolean;
  senderName?: string;
  refreshCredentials: () => Promise<LiveChatCredentials>;
}

export const LiveChatPanel = memo(
  ({
    credentials,
    isUnavailable,
    isPreparing,
    senderName,
    refreshCredentials,
  }: LiveChatPanelProps) => {
    const {theme} = useTheme();
    const colors = theme.colors;
    const {height: windowHeight} = useWindowDimensions();
    const [draft, setDraft] = useState('');
    const [isSending, setIsSending] = useState(false);

    const {status, error, messages, sendMessage, retryMessage, reconnect} =
      useLiveRoomChat({credentials, senderName, refreshCredentials});

    // Inverted list keeps the newest message pinned to the bottom without manual scrolling.
    const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

    const isReady = status === 'connected';
    const text = draft.trim();
    const canSend = isReady && !isSending && text.length > 0;

    const handleSend = useCallback(async () => {
      if (!canSend) {
        return;
      }
      setIsSending(true);
      setDraft('');
      const accepted = await sendMessage(text);
      if (!accepted) {
        setDraft(text);
      }
      setIsSending(false);
    }, [canSend, sendMessage, text]);

    const renderItem = useCallback<ListRenderItem<LiveChatMessage>>(
      ({item}) => <MessageRow item={item} onRetry={retryMessage} />,
      [retryMessage],
    );

    let notice: string | null = null;
    if (isUnavailable) {
      notice = 'Live chat is unavailable for this session.';
    } else if (status === 'failed') {
      notice = error;
    } else if (status === 'reconnecting') {
      notice = 'Chat connection lost. Reconnecting...';
    }

    const isConnecting =
      status === 'connecting' ||
      status === 'reconnecting' ||
      (isPreparing && !credentials);
    const placeholder = isReady
      ? 'Reply to your viewers...'
      : isConnecting
      ? 'Connecting to chat...'
      : 'Chat unavailable';

    return (
      <View style={styles.container}>
        <FlatList
          data={reversedMessages}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          inverted
          style={[
            styles.messageList,
            {
              maxHeight: Math.min(
                windowHeight * LIST_HEIGHT_RATIO,
                MAX_LIST_HEIGHT,
              ),
            },
          ]}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={7}
        />

        {!!notice && (
          <View style={styles.notice}>
            <AppText
              variant="caption"
              color={colors.white}
              style={styles.noticeText}>
              {notice}
            </AppText>
            {status === 'failed' && !isUnavailable && (
              <TouchableOpacity
                onPress={reconnect}
                accessibilityLabel="Reconnect live chat">
                <AppText
                  variant="caption"
                  color={colors.accentGold}
                  style={styles.noticeAction}>
                  Retry
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor={MUTED_TEXT}
            editable={isReady}
            style={[styles.input, {color: colors.white}]}
            maxLength={LIVE_CHAT_MAX_LENGTH}
            returnKeyType="send"
            enablesReturnKeyAutomatically
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
            accessibilityLabel="Live chat message"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            style={[
              styles.sendButton,
              {backgroundColor: colors.primary},
              !canSend && styles.disabled,
            ]}
            accessibilityLabel="Send message">
            {isSending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Icon name="send" size={18} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    paddingBottom: 8,
  },
  messageList: {
    flexGrow: 0,
    flexShrink: 1,
  },
  messageListContent: {
    paddingHorizontal: 12,
  },
  messageRow: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginVertical: 3,
    borderRadius: 10,
    backgroundColor: OVERLAY_BACKGROUND,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  senderName: {
    flexShrink: 1,
    fontWeight: '600',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: OVERLAY_BACKGROUND,
    gap: 8,
  },
  noticeText: {
    flex: 1,
  },
  noticeAction: {
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 14,
    paddingVertical: 0,
    borderRadius: 20,
    backgroundColor: OVERLAY_BACKGROUND,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

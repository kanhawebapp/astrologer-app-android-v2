import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage } from '../../domain/chatTypes';

interface MessageListProps {
  messages: ChatMessage[];
  onReplyPress: (message: ChatMessage) => void;
  onImagePress?: (imageUrl: string) => void;
  onMessageLongPress?: (message: ChatMessage) => void;
  showReplyPreview?: boolean;
  isUserTyping?: boolean;
  userName?: string;
  flatListRef: React.RefObject<FlatList>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onReplyPress,
  onImagePress,
  onMessageLongPress,
  showReplyPreview = true,
  isUserTyping = false,
  userName = 'User',
  flatListRef,
}) => {
  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      return (
        <MessageBubble
          message={item}
          onReplyPress={onReplyPress}
          onImagePress={onImagePress}
          onMessageLongPress={onMessageLongPress}
          showReplyPreview={showReplyPreview}
        />
      );
    },
    [onReplyPress, onImagePress, onMessageLongPress, showReplyPreview],
  );

  const renderTypingIndicator = useCallback(() => {
    if (isUserTyping && userName) {
      return <TypingIndicator userName={userName} />;
    }
    return null;
  }, [isUserTyping, userName]);

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.messageList}
      showsVerticalScrollIndicator={false}
      inverted
      onContentSizeChange={() =>
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false })
      }
      ListHeaderComponent={renderTypingIndicator}
    />
  );
};

const styles = StyleSheet.create({
  messageList: {
    paddingVertical: 12,
  },
});

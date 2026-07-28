import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, Keyboard } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { ChatMessage } from '../../domain/types';
import { MessageItem } from './MessageItem';

interface ChatOverlayProps {
  messages: ChatMessage[];
  pinnedMessage?: ChatMessage | null;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  messages,
  pinnedMessage,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const handleScroll = () => {
    Keyboard.dismiss();
  };

  const displayMessages = messages.slice(-20);

  return (
    <View style={styles.container}>
      {pinnedMessage && (
        <View
          style={[
            styles.pinnedContainer,
            { backgroundColor: colors.accentGoldLight },
          ]}>
          <MessageItem message={pinnedMessage} isPinned />
        </View>
      )}
      <FlatList
        ref={flatListRef}
        data={displayMessages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageItem message={item} />}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 120,
    maxHeight: 250,
  },
  pinnedContainer: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 8,
  },
});

export default ChatOverlay;

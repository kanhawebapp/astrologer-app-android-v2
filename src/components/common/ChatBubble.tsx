import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ChatBubbleProps {
  message: Message;
  showTimestamp?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  showTimestamp = true,
}) => {
  const { theme } = useTheme();

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View
      style={[
        styles.container,
        message.isOwn ? styles.containerOwn : styles.containerOther,
      ]}>
      <View
        style={[
          styles.bubble,
          message.isOwn
            ? [styles.bubbleOwn, { backgroundColor: theme.colors.primary }]
            : [
              styles.bubbleOther,
              { backgroundColor: theme.colors.surfaceSecondary },
            ],
        ]}>
        <Text
          style={[
            styles.messageText,
            { color: message.isOwn ? theme.colors.white : theme.colors.text },
          ]}>
          {message.text}
        </Text>
        {showTimestamp && (
          <Text
            style={[
              styles.timestamp,
              {
                color: message.isOwn
                  ? theme.colors.white
                  : theme.colors.textTertiary,
                opacity: 0.7,
              },
            ]}>
            {formatTime(message.timestamp)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: 'row',
  },
  containerOwn: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleOwn: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});

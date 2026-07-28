import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { AppText } from '../../../../components/common/AppText';
import { ChatMessage } from '../../domain/types';
import { MessageType } from '../../domain/liveEnums';

interface MessageItemProps {
  message: ChatMessage;
  isPinned?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isPinned = false,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const getMessageColor = () => {
    switch (message.type) {
      case MessageType.REMEDY:
        return colors.accentGold;
      case MessageType.GIFT:
        return colors.success;
      case MessageType.SYSTEM:
        return colors.info;
      default:
        return colors.white;
    }
  };

  const formatUsername = () => {
    if (message.type === MessageType.REMEDY) {
      return '🧿 Guruji';
    }
    if (message.type === MessageType.SYSTEM) {
      return 'System';
    }
    return message.username;
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isPinned
              ? 'rgba(212, 175, 55, 0.3)'
              : 'rgba(0,0,0,0.5)',
          },
          message.type === MessageType.REMEDY && {
            borderLeftWidth: 3,
            borderLeftColor: colors.accentGold,
          },
        ]}>
        <AppText
          variant="caption"
          style={[styles.username, { color: getMessageColor() }]}>
          {formatUsername()}:
        </AppText>
        <AppText
          variant="caption"
          style={[styles.message, { color: colors.white }]}
          numberOfLines={2}>
          {message.message}
        </AppText>
        {message.type === MessageType.REMEDY && (
          <View
            style={[
              styles.remedyBadge,
              { backgroundColor: colors.accentGold },
            ]}>
            <AppText
              variant="caption"
              style={{ color: colors.white, fontSize: 10 }}>
              REMEDY
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
  },
  messageBubble: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: 280,
  },
  username: {
    fontWeight: '700',
    marginRight: 4,
  },
  message: {
    flex: 1,
  },
  remedyBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default MessageItem;

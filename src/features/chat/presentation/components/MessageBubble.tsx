
import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import type { ChatMessage } from '../../domain/chatTypes';

interface MessageBubbleProps {
  message: ChatMessage;
  onReplyPress?: (message: ChatMessage) => void;
  onImagePress?: (imageUrl: string) => void;
  onMessageLongPress?: (message: ChatMessage) => void;
  showReplyPreview?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onReplyPress,
  onImagePress,
  onMessageLongPress,
  showReplyPreview = true,
}) => {
  const { theme } = useTheme();
  const chatRequest = useSelector((state: RootState) => state.user.chatRequest);
  console.log('MessageBubble rendered with message:', chatRequest);
  // Animation values for messages
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // Animation values for user card
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;

  // Message bubble animation
  useEffect(() => {
    if (message.type === 'USER_INFO') {
      // Different animation for user info card
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Regular message bubble animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [opacity, translateY, cardOpacity, cardScale, message.type]);

  const formatTime = useCallback((timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const formatDate = (dateOfBirth?: string) => {
    if (!dateOfBirth) return '-';

    const date = new Date(dateOfBirth);

    return Number.isNaN(date.getTime())
      ? '-'
      : date.toLocaleDateString('en-GB');
  };


  /* =====================================================
     USER INFO CARD (NO BUBBLE, NO PRESSABLE)
  ===================================================== */
  if (message.type === 'USER_INFO') {
    return (
      <Animated.View
        style={[
          styles.userCardWrapper,
          {
            opacity: cardOpacity,
            transform: [{ scale: cardScale }],
          },
        ]}>
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <AppText style={styles.userName}>
            {chatRequest?.userName || 'User'}
          </AppText>

          <AppText style={styles.userSub}>
            {chatRequest?.gender || '-'} • {chatRequest?.occupation || '-'}
          </AppText>

          <AppText style={styles.userSub}>
            DOB: {formatDate(chatRequest?.dateOfBirth)}
          </AppText>
          <AppText style={styles.userSub}>
            TOB:{' '}
            {chatRequest?.timeOfBirth || '-'}
          </AppText>

          <AppText style={styles.userSub}>
            📍 {chatRequest?.location || '-'}
          </AppText>
        </View>
      </Animated.View>
    );
  }

  /* =====================================================
     NORMAL MESSAGE FLOW (UNCHANGED)
  ===================================================== */

  const isDelivered = message.status === 'delivered';
  const isRead = message.status === 'read';
  const isSending = message.status === 'sending';
  const isSent = message.status === 'sent' || message.status === undefined;
  const isFailed = message.status === 'failed';

  const getStatusColor = () => {
    if (!message.isOwn) return theme.colors.textTertiary;
    if (isRead) return theme.colors.info;
    if (isDelivered) return theme.colors.textTertiary;
    if (isSent) return theme.colors.white;
    return theme.colors.error;
  };

  const renderStatusIcon = () => {
    if (isSending) {
      return (
        <ActivityIndicator
          size={12}
          color={theme.colors.white}
          style={styles.statusIcon}
        />
      );
    }
    if (isFailed) {
      return (
        <Icon
          name="error-outline"
          size={14}
          color={theme.colors.error}
          style={styles.statusIcon}
        />
      );
    }
    return (
      <Icon
        name={'done-all'}
        // name={isDelivered || isRead ? 'done-all' : 'check'}
        size={14}
        color={getStatusColor()}
        style={styles.statusIcon}
      />
    );
  };

  const getReplySenderName = (): string => {
    if (message.replyTo?.sender) {
      return message.replyTo.sender;
    }
    return 'Message';
  };

  const getReplyMessage = (): string => {
    if (message.replyTo?.message) {
      return message.replyTo.message;
    }
    return '';
  };

  const hasReply = message.replyTo && showReplyPreview;
  const replyMessage = getReplyMessage();
  const replySender = getReplySenderName();

  return (
    <Pressable
      onLongPress={() => onMessageLongPress?.(message)}
      style={[
        styles.container,
        message.isOwn ? styles.ownContainer : styles.otherContainer,
      ]}>
      <Animated.View
        style={[
          styles.bubble,
          message.isOwn
            ? [styles.ownBubble, { backgroundColor: theme.colors.primary }]
            : [
              styles.otherBubble,
              { backgroundColor: theme.colors.surfaceSecondary },
            ],
          {
            opacity,
            transform: [
              {
                translateX: message.isOwn ? 0 : -10,
              },
              { translateY },
            ],
          },
        ]}>
        {/* REPLY PREVIEW */}
        {hasReply && showReplyPreview && (
          <TouchableOpacity
            style={[
              styles.replyContainer,
              {
                borderLeftColor: message.isOwn
                  ? theme.colors.white
                  : theme.colors.primary,
                backgroundColor: message.isOwn
                  ? 'rgba(255,255,255,0.15)'
                  : 'rgba(0,0,0,0.05)',
              },
            ]}
            onPress={() => onReplyPress?.(message)}
            activeOpacity={0.7}>
            <View style={styles.replyHeader}>
              <Icon
                name="reply"
                size={12}
                color={
                  message.isOwn ? theme.colors.white : theme.colors.primary
                }
                style={styles.replyIcon}
              />
              <AppText
                variant="caption"
                color={
                  message.isOwn ? theme.colors.white : theme.colors.primary
                }
                style={styles.replySender}>
                {replySender}
              </AppText>
            </View>
            <AppText
              variant="caption"
              color={
                message.isOwn
                  ? 'rgba(255,255,255,0.9)'
                  : theme.colors.textSecondary
              }
              numberOfLines={2}
              style={styles.replyMessage}>
              {replyMessage}
            </AppText>
          </TouchableOpacity>
        )}

        {/* IMAGE */}
        {message.imageUrl && (
          <TouchableOpacity
            onPress={() => onImagePress?.(message.imageUrl!)}
            style={styles.imageContainer}
            activeOpacity={0.9}>
            <Image
              source={{ uri: message.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}


        {onReplyPress && (
          <TouchableOpacity
            style={[
              styles.replyButton,
              message.isOwn
                ? { left: -28 } // 👈 apne message ke liye left side
                : { right: -28 }, // 👈 incoming ke liye right side
            ]}
            onPress={() => onReplyPress(message)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="reply" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        )}

        {/* MESSAGE TEXT */}
        <AppText
          variant="body1"
          color={message.isOwn ? theme.colors.white : theme.colors.text}
          style={styles.messageText}>
          {message.text === '[EMPTY]' ? null : message.text}
        </AppText>

        {/* TIME + STATUS */}
        <View style={styles.metaContainer}>
          <AppText
            variant="caption"
            color={
              message.isOwn ? theme.colors.white : theme.colors.textTertiary
            }
            style={styles.timeText}>
            {formatTime(message.timestamp)}
          </AppText>
          {message.isOwn && renderStatusIcon()}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginBottom: 10,
  },
  ownContainer: {
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignItems: 'flex-start',
  },

  /* USER CARD */
  userCardWrapper: {
    width: '60%',
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  userCard: {
    width: '100%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    elevation: 2,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  userSub: {
    fontSize: 12,
    opacity: 0.7,
  },

  /* MESSAGE BUBBLE */
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },

  /* REPLY */
  replyContainer: {
    borderLeftWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyIcon: {
    marginRight: 4,
    opacity: 0.8,
  },
  replySender: {
    fontWeight: '600',
    fontSize: 12,
    opacity: 0.9,
  },
  replyMessage: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.8,
  },

  /* IMAGE */
  imageContainer: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },

  /* TEXT */
  messageText: {
    lineHeight: 20,
    fontSize: 15,
  },

  /* META */
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    opacity: 0.7,
    fontSize: 11,
  },
  statusIcon: {
    marginLeft: 4,
  },

  /* REPLY BUTTON */
  // replyButton: {
  //   position: 'absolute',
  //   top: 4,
  //   right: -28,
  //   padding: 4,
  //   zIndex: 1,
  // },
  replyButton: {
    position: 'absolute',
    top: 4,
    padding: 4,
    zIndex: 1,
  },
});

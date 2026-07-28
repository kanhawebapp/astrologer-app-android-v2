import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { SessionMessage } from '../../../../services/api/messageSession/messages.types';

interface MessagesModalProps {
  visible: boolean;
  messages: SessionMessage[];
  loading: boolean;
  onClose: () => void;
}

const formatTime = (isoTime: string): string => {
  const date = new Date(isoTime);

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const MessagesModal: React.FC<MessagesModalProps> = ({
  visible,
  messages,
  loading, 
  onClose,
}) => {
  const { theme } = useTheme();
  // console.log("messagesmessages-=-=-",messages)

  const isAstrologerMessage = (sender?: string) => {
    return sender?.toLowerCase() === 'astrologer';

  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const renderMessage = ({ item: message }: { item: SessionMessage }) => {
    const isAstrologer = isAstrologerMessage(message.sender);

    return (
      <View
        style={[
          styles.messageRow,
          isAstrologer
            ? styles.astrologerMessage
            : styles.userMessage,
        ]}>
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isAstrologer
                ? theme.colors.primary
                : theme.colors.surfaceSecondary,
            },
          ]}>
          <AppText
            variant="caption"
            color={
              isAstrologer
                ? theme.colors.white
                : theme.colors.textSecondary
            }
            style={styles.senderLabel}>
            {message.sender}
          </AppText>

          {/* <AppText
            variant="body2"
            color={
              isAstrologer
                ? theme.colors.white
                : theme.colors.text
            }>
            {message.message}
          </AppText> */}
          <>
            {message.image ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setSelectedImage(message.image)}>
                <Image
                  source={{ uri: message.image }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : null}

            {message.message ? (
              <AppText
                variant="body2"
                color={
                  isAstrologer
                    ? theme.colors.white
                    : theme.colors.text
                }
                style={message.image ? { marginTop: 8 } : undefined}>
                {message.message}
              </AppText>
            ) : null}
          </>

          <AppText
            variant="caption"
            color={
              isAstrologer
                ? 'rgba(255,255,255,0.7)'
                : theme.colors.textTertiary
            }
            style={styles.messageTime}>
            {formatTime(message.createdAt)}
          </AppText>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet */}
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <AppText variant="h5" color={theme.colors.text}>
              Session Messages
            </AppText>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}>
              <Icon
                name="close"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <AppText
                variant="body1"
                color={theme.colors.textSecondary}
                style={styles.loadingText}>
                Loading messages...
              </AppText>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon
                name="chat-bubble-outline"
                size={48}
                color={theme.colors.textTertiary}
              />

              <AppText
                variant="body1"
                color={theme.colors.textSecondary}
                style={styles.emptyText}>
                No messages found
              </AppText>
            </View>
          ) : (
            <View style={styles.messagesWrapper}>
              <FlatList
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                contentContainerStyle={styles.messagesContent}
                removeClippedSubviews={false}
              />
            </View>
          )}
        </View>
      </View>
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.imageModal}>

          <TouchableOpacity
            style={styles.imageClose}
            onPress={() => setSelectedImage(null)}>
            <Icon
              name="close"
              size={30}
              color="#fff"
            />
          </TouchableOpacity>

          <Image
            source={{ uri: selectedImage || '' }}
            style={styles.fullImage}
            resizeMode="contain"
          />

        </View>
      </Modal>

    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  modalContent: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  closeButton: {
    padding: 4,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    marginTop: 12,
  },

  loadingText: {
    marginTop: 12,
  },

  messagesWrapper: {
    flex: 1,
  },

  messagesContent: {
    paddingBottom: 40,
  },

  messageRow: {
    marginBottom: 12,
  },

  astrologerMessage: {
    alignItems: 'flex-end',
  },

  userMessage: {
    alignItems: 'flex-start',
  },

  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },

  senderLabel: {
    marginBottom: 4,
    fontWeight: '700',
  },

  messageTime: {
    marginTop: 6,
    fontSize: 10,
    alignSelf: 'flex-end',
  },

  //
  messageImage: {
  width: 220,
  height: 220,
  borderRadius: 12,
},

imageModal: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.95)',
  justifyContent: 'center',
  alignItems: 'center',
},

fullImage: {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height * 0.8,
},

imageClose: {
  position: 'absolute',
  top: 55,
  right: 20,
  zIndex: 100,
},
});


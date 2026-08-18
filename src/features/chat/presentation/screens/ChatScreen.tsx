
import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatViewModel } from '../viewmodels';
import {
  ChatHeader,
  MessageBubble,
  TypingIndicator,
  ChatInput,
} from '../components';
import { EmptyState } from '../components';
import { useTheme } from '../../../../hooks/useTheme';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const ChatScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const handleImagePress = React.useCallback((imageUrl: string) => {
    setSelectedImage(imageUrl);
  }, []);

  const vm = useChatViewModel();

  const renderMessage = React.useCallback(
    ({ item }: { item: any }) => (
      <MessageBubble
        message={item}
        onReplyPress={vm.handleReplyPress}
        onImagePress={handleImagePress}
      />
    ),
    [vm.handleReplyPress],
  );
  const renderTypingIndicator = React.useCallback(() => {
    if (vm.isUserTyping && vm.activeSession) {
      return <TypingIndicator userName={vm.activeSession.userName} />;
    }
    return null;
  }, [vm.isUserTyping, vm.activeSession]);

  const keyExtractor = React.useCallback((item: any) => item.id, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}>
      <View
        style={[
          styles.backgroundPattern,
          { backgroundColor: theme.colors.background },
        ]}
      />

      <ChatHeader
        userName={vm.activeSession?.userName || 'Chat'}
        userProfilePic={vm.activeSession?.userProfilePic}
        onBackPress={vm.handleBack}
        onEndChatPress={vm.handleEndChat}
        onCancelPress={vm.handleCancelChatRequest}
        showEndButton={vm.showEndButton}
        showCancelButton={vm.showCancelButton}
        formattedTime={vm.formattedTime}
        isTimeLow={vm.isTimeLow}
        isTimeCritical={vm.isTimeCritical}
        progress={vm.progress}
        isActive={vm.isActive}
      />

      {vm.chatStatus === 'ACTIVE' ? (
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}>
          {vm.activeSession ? (
            <FlatList
              ref={vm.flatListRef as any}
              style={styles.messageList}
              data={vm.finalMessages}
              renderItem={renderMessage}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={false}
              inverted
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.messageListContent}
              onContentSizeChange={vm.handleContentSizeChange}
              ListHeaderComponent={renderTypingIndicator}
            />
          ) : (
            <View style={styles.messageList} />
          )}

          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: theme.colors.background },
            ]}>
            <ChatInput
              onSendMessage={vm.handleSendMessage}
              roomId={vm.effectiveRoomId!}
              userName={vm.activeSession?.userName || 'User'}
              replyToMessage={vm.replyToMessage}
              onCancelReply={vm.handleCancelReply}
            />
          </View>
        </KeyboardAvoidingView>
      ) : null}

      {vm.chatStatus === 'IDLE' || vm.chatStatus === 'ENDED' ? (
        <EmptyState error={vm.error} chatStatus={vm.chatStatus} />
      ) : null}

      {selectedImage && (
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setSelectedImage(null)}
          />

          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)}>
              <Icon name="close" size={28} color="#fff" />
            </TouchableOpacity>

            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
  },
  keyboardView: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingTop: 12,
    paddingBottom: 10,
  },
  inputWrapper: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    // marginTop: 15,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
});

export default ChatScreen;

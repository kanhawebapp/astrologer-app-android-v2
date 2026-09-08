import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Animated,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { socketManager } from '../../../../services/socket/socketManager';
import { ChatSocketEvents } from '../../../../features/chat/domain/chatEvents';
import { launchImageLibrary } from 'react-native-image-picker';
import { useUploadImage } from '../../../../services/api/upload/upload.hook';

import type { ReplyToData } from '../../domain/chatTypes';
import { useToast } from '../../../../hooks/useToast';
import { uploadApi } from '../../../../services/api/imageMessage/upload.service';
import { uploadImage } from '../../../../services/api/upload/upload.api';
import { RootState } from '../../../../store';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const kundliicon = require('../../../../assets/images/kundliicon.png');

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<void>;
  roomId: string;
  userName: string;
  replyToMessage?: ReplyToData | null;
  onCancelReply?: () => void;
  onKundliPress?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  roomId,
  userName,
  replyToMessage,
  onCancelReply,
  onKundliPress,
}) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  // const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { showError } = useToast();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const activeSession = useSelector(
    (state: RootState) => state.chat.activeSession,
  );

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const sendScale = useRef(new Animated.Value(1)).current;
  const replySlide = useRef(new Animated.Value(-30)).current;
  const inputFocus = useRef(new Animated.Value(0)).current;

  const { upload, loading: uploading } = useUploadImage();


  // Reply animation
  useEffect(() => {
    Animated.spring(replySlide, {
      toValue: replyToMessage ? 0 : -30,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [replyToMessage, replySlide]);

  const handleInputFocus = () => {
    Animated.timing(inputFocus, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleInputBlur = () => {
    Animated.timing(inputFocus, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.log('Permission error:', err);
      return false;
    }
  };

  // const handlePickImage = useCallback(async () => {
  //   try {
  //     const hasPermission = await requestGalleryPermission();
  //     if (!hasPermission) return;

  //     const result = await launchImageLibrary({
  //       mediaType: 'photo',
  //       quality: 0.7,
  //     });

  //     if (!result.assets?.length) return;

  //     const asset = result.assets[0];

  //     const file = {
  //       uri: asset.uri!,
  //       name: asset.fileName || 'photo.jpg',
  //       type: asset.type || 'image/jpeg',
  //     };

  //     const imageUrl = await uploadApi(file);
  //     // const imageUrl = await upload(file);

  //     socketManager.emit(ChatSocketEvents.SEND_MESSAGE, {
  //       room_id: roomId,
  //       message: imageUrl,
  //       message_type: 'image',
  //       user_name: userName,
  //     });
  //   } catch (error) {
  //     console.log('❌ Image flow error:', error);
  //   }
  // }, [roomId, userName, upload]);

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (result.didCancel || !result.assets?.length) {
        return;
      }

      const image = result.assets[0];

      if (!image.uri) {
        console.log('❌ Image URI is missing');
        return;
      }

      const file = {
        uri: image.uri,
        name: image.fileName || 'image.jpg',
        type: image.type || 'image/jpeg',
      };

      console.log('========== IMAGE SELECTED ==========');
      console.log('File:', file);

      const response = await uploadImage.uploadFile(file);

      console.log(
        '========== UPLOAD RESPONSE ==========',
      );
      console.log(
        JSON.stringify(response, null, 2),
      );

      const uploaded = response?.data?.uploadFile;

      if (!uploaded?.success || !uploaded?.url) {
        throw new Error('Image upload failed');
      }

      console.log('Image URL:', uploaded.url);
      console.log('Filename:', uploaded.filename);

      const messageId = generateId();
      const indianTime = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
      });
      const astrologerId = authUser?.id || activeSession?.astrologerId || '';
      const userId = activeSession?.userId || '';
      const replyTo = replyToMessage || null;

      const payloadToSend = {
        room_id: String(roomId),
        msg_id: messageId,
        sender_id: astrologerId,
        received_id: userId || '',
        sender: 'astrologer',
        message: '',
        image: uploaded.url,
        time: indianTime,
        replyTo,
      };

      socketManager.emit(ChatSocketEvents.SEND_MESSAGE, payloadToSend);
      onCancelReply?.();
    } catch (error) {
      console.log('❌ IMAGE PICK/UPLOAD ERROR:', error);
    }
  };



  const isTypingRef = useRef(false);

  const handleTextChange = useCallback(
    (newText: string) => {
      setText(newText);

      if (!isTypingRef.current) {
        isTypingRef.current = true;

        socketManager.emit(ChatSocketEvents.TYPING_START, {
          room_id: roomId,
          typing: true,
          user_name: userName,
        });
      }

      const words = newText.split(/\s+/).filter(Boolean);

      if (words.length > 200) {
        showError('Maximum 200 words allowed.');
        return;
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;

        socketManager.emit(ChatSocketEvents.TYPING_STOP, {
          room_id: roomId,
          typing: false,
          user_name: userName,
        });
      }, 400);
    },
    [roomId, userName],
  );

  // const handleSend = useCallback(async () => {
  //   if (!text.trim()) return;

  //   Animated.sequence([
  //     Animated.timing(sendScale, {
  //       toValue: 0.9,
  //       duration: 80,
  //       useNativeDriver: true,
  //     }),
  //     Animated.spring(sendScale, {
  //       toValue: 1,
  //       friction: 3,
  //       tension: 40,
  //       useNativeDriver: true,
  //     }),
  //   ]).start();

  //   const messageText = text.trim();
  //   setText('');

  //   try {
  //     await onSendMessage(messageText);
  //     onCancelReply?.();
  //   } catch (error) {
  //     setText(messageText);
  //   }
  // }, [text, onSendMessage, onCancelReply, sendScale]);

  const handleSend = useCallback(async () => {
    const messageText = text.trim();

    if (!messageText) return;

    // Max 200 words
    const wordCount = messageText.split(/\s+/).filter(Boolean).length;

    if (wordCount > 200) {
      showError('You can send a maximum of 200 words in one message.');
      return;
    }

    // Block < and >
    if (/[<>]/.test(messageText)) {
      showError('Message cannot contain < or > characters.');
      return;
    }

    Animated.sequence([
      Animated.timing(sendScale, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(sendScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    setText('');

    try {
      await onSendMessage(messageText);
      onCancelReply?.();
    } catch (error) {
      setText(messageText);
    }
  }, [text, onSendMessage, onCancelReply, sendScale]);


  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      ]}>
      {replyToMessage && (
        <Animated.View
          style={[
            styles.replyPreview,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              transform: [{ translateX: replySlide }],
              borderColor: theme.colors.border,
            },
          ]}>
          <View style={styles.replyPreviewContent}>
            <Icon name="reply" size={14} color={theme.colors.primary} />
            <View style={styles.replyTextContainer}>
              <AppText color={theme.colors.primary}>
                Reply to {replyToMessage.sender}
              </AppText>
              <AppText numberOfLines={1}>{replyToMessage.message}</AppText>
            </View>
            {replyToMessage.image ? (
              <Image
                source={{ uri: replyToMessage.image }}
                style={styles.replyPreviewImage}
              />
            ) : null}
          </View>
          <TouchableOpacity onPress={onCancelReply} style={styles.cancelReply}>
            <Icon name="close" size={18} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.inputRow}>



        <Animated.View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderColor: inputFocus.interpolate({
                inputRange: [0, 1],
                outputRange: [theme.colors.border, theme.colors.primary],
              }),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            },
          ]}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={text}
            onChangeText={handleTextChange}
            multiline
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textTertiary}
          />
        </Animated.View>

        {!text.trim() && (
          <>

            <TouchableOpacity onPress={handlePickImage} style={styles.imageButton}>
              <Icon name="image" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
            {/* KUNDLI */}
            <TouchableOpacity
              onPress={onKundliPress}
              style={[
                styles.kundliButton,
                {
                  backgroundColor: theme.colors.primary + '15',
                },
              ]}
              activeOpacity={0.7}>
              <Image
                source={kundliicon}
                style={styles.kundliIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

          </>
        )}

        <TouchableOpacity
          onPress={handleSend}
          style={[
            styles.sendButton,
            { backgroundColor: text.trim() ? '#25D366' : '#D1D5DB' },
          ]}
          disabled={!text.trim()}>
          <Icon name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingBottom: 8,
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
    borderRadius: 12,
  },
  replyPreviewContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyIcon: {
    marginRight: 10,
  },
  replyTextContainer: {
    flex: 1,
  },
  replyPreviewImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginLeft: 8,
  },
  replyLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
  replyMessage: {
    fontSize: 13,
    opacity: 0.9,
  },
  cancelReply: {
    padding: 6,
    marginLeft: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  imageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
  },
  kundliButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  kundliIcon: {
    width: 21,
    height: 21,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    overflow: 'hidden',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 80,
    minHeight: 20,
    paddingVertical: 0,
    color: '#000',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});

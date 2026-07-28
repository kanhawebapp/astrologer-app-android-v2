import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Draggable from 'react-native-draggable';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState, AppDispatch } from '../../store';
import { setActiveChat, markAsRead } from '../../store/slices/chatSlice';
import { ChatRoomUI } from '../../features/chat/domain/chatTypes';
import { useTheme } from '../../hooks/useTheme';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STORAGE_KEY = 'floating_bubble_position';
const BUBBLE_SIZE = 60;

interface Position {
  x: number;
  y: number;
}

export const FloatingChatBubble: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [position, setPosition] = useState<Position>({ x: 16, y: 200 });

  const { chats, activeChatId } = useSelector((state: RootState) => state.chat);

  const unreadChats = chats.filter(c => c.unreadCount > 0);
  const totalUnread = unreadChats.reduce((sum, c) => sum + c.unreadCount, 0);
  const activeChat =
    unreadChats.find(c => c.id === activeChatId) || unreadChats[0];

  const loadSavedPosition = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const positionData = JSON.parse(saved) as Position;
        setPosition(positionData);
      }
    } catch (error) {
      console.log('Error loading position:', error);
    }
  }, []);

  const savePosition = useCallback(async (x: number, y: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y }));
    } catch (error) {
      console.log('Error saving position:', error);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadSavedPosition();
      return () => {};
    }, [loadSavedPosition]),
  );

  const handleChatPress = () => {
    if (activeChat) {
      dispatch(setActiveChat(activeChat.id));
      dispatch(markAsRead(activeChat.id));
      navigation.navigate('ChatScreen', { chatId: activeChat.id });
    }
  };

  const handleDragRelease = (event: any, gestureState: any, bounds: any) => {
    const { x, y } = bounds;
    setPosition({ x, y });
    savePosition(x, y);
  };

  const renderAvatar = (chat: ChatRoomUI) => {
    const initials = chat.userName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <View
        style={[styles.avatar, { backgroundColor: theme.colors.secondary }]}>
        <Text style={[styles.avatarText, { color: theme.colors.white }]}>
          {initials}
        </Text>
      </View>
    );
  };

  if (totalUnread === 0 || !activeChat) {
    return null;
  }

  return (
    <Draggable
      x={position.x}
      y={position.y}
      renderSize={BUBBLE_SIZE}
      isCircle
      onPressOut={() => {}}
      onShortPressRelease={handleChatPress}
      onDragRelease={handleDragRelease}
      z={1000}>
      <View style={styles.container}>
        <View style={styles.avatarContainer}>{renderAvatar(activeChat)}</View>

        <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
          <Text style={styles.badgeText}>
            {totalUnread > 99 ? '99+' : totalUnread}
          </Text>
        </View>

        <View style={styles.chatIconContainer}>
          <Icon name="chat" size={24} color={theme.colors.white} />
        </View>
      </View>
    </Draggable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  avatarContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  chatIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

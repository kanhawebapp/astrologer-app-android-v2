import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { incrementUnread, updateLastMessage } from '../store/slices/chatSlice';

const INCOMING_MESSAGES = [
  'Hi, I need advice on my career',
  'When can we schedule a session?',
  'Thank you for the reading!',
  'I have a question about my chart',
  'Can you check my marriage compatibility?',
  'When is a good time to start new work?',
  'Hello, are you available for consultation?',
];

export const useChatSimulation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { chats } = useSelector((state: RootState) => state.chat);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const availableChats = chats.filter((c: any) => c.id !== '3');
      if (availableChats.length > 0) {
        const randomChat =
          availableChats[Math.floor(Math.random() * availableChats.length)];
        const randomMessage =
          INCOMING_MESSAGES[
            Math.floor(Math.random() * INCOMING_MESSAGES.length)
          ];

        dispatch(
          updateLastMessage({ chatId: randomChat.id, message: randomMessage }),
        );
        dispatch(incrementUnread(randomChat.id));
      }
    }, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [chats, dispatch]);
};

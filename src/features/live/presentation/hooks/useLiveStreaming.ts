import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  GiftType,
  LiveStatus,
  MessageType,
  RemedyType,
} from '../../domain/liveEnums';
import {
  ChatMessage,
  GiftEvent,
  LikeEvent,
  LiveInteractionState,
  LiveStreamStats,
  LiveParticipant,
  PinnedMessage,
  Remedy,
} from '../../domain/types';
import { liveService } from '../../data/liveService';
import { socketService } from '../../data/socketService';
import {
  generateTopSupporters,
  generateRandomRemedy,
} from '../../data/dummyLiveInteractionData';
import { RootState } from '../../../../store';
import {
  addChatMessage,
  addLikeEvent,
  addGiftEvent,
  updateLiveStats,
  setPinnedMessage,
  addRecentJoined,
  setLiveStatus,
  resetLiveState,
} from '../../../../store/slices/liveInteractionSlice';

const initialStats: LiveStreamStats = {
  viewerCount: 0,
  peakViewers: 0,
  totalLikes: 0,
  totalGifts: 0,
  totalEarnings: 0,
  duration: 0,
};

const initialState: LiveInteractionState = {
  isLive: false,
  isMuted: false,
  messages: [],
  likes: [],
  gifts: [],
  stats: initialStats,
  participants: [],
  pinnedMessage: null,
  recentJoined: [],
};

export const useLiveStreaming = (sessionTitle?: string) => {
  const dispatch = useDispatch();
  const liveState = useSelector((state: RootState) => state.liveInteraction);
  const [streamStatus, setStreamStatus] = useState<LiveStatus>(LiveStatus.IDLE);
  const [showRemedyModal, setShowRemedyModal] = useState(false);
  const [showGiftPopup, setShowGiftPopup] = useState<GiftEvent | null>(null);
  const [showJoinerPopup, setShowJoinerPopup] = useState<string | null>(null);
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    liveService.on('message', (message: ChatMessage) => {
      dispatch(addChatMessage(message));
    });
    liveService.on('like', (like: LikeEvent) => {
      dispatch(addLikeEvent(like));
    });
    liveService.on('gift', (gift: GiftEvent) => {
      dispatch(addGiftEvent(gift));
      setShowGiftPopup(gift);
      setTimeout(() => setShowGiftPopup(null), 3000);
    });
    liveService.on('join', (username: string) => {
      dispatch(addRecentJoined(username));
      setShowJoinerPopup(username);
      setTimeout(() => setShowJoinerPopup(null), 3000);
    });

    return () => {
      liveService.stopSimulation();
      socketService.removeAllListeners();
    };
  }, [dispatch]);

  const startLive = useCallback(() => {
    setStreamStatus(LiveStatus.CONNECTING);
    dispatch(setLiveStatus(true));

    const initialMessages = liveService.generateInitialMessages(15);
    initialMessages.forEach(msg => dispatch(addChatMessage(msg)));

    dispatch(
      updateLiveStats({
        viewerCount: Math.floor(Math.random() * 50) + 10,
        peakViewers: Math.floor(Math.random() * 50) + 10,
      }),
    );

    const supporters = generateTopSupporters();
    dispatch({ type: 'liveInteraction/setParticipants', payload: supporters });

    liveService.startSimulation((updates: Partial<LiveInteractionState>) => {
      if (updates.messages?.length) {
        updates.messages.forEach((msg: ChatMessage) =>
          dispatch(addChatMessage(msg)),
        );
      }
      if (updates.likes?.length) {
        updates.likes.forEach((like: LikeEvent) =>
          dispatch(addLikeEvent(like)),
        );
      }
      if (updates.gifts?.length) {
        updates.gifts.forEach((gift: GiftEvent) =>
          dispatch(addGiftEvent(gift)),
        );
      }
    });

    setTimeout(() => {
      setStreamStatus(LiveStatus.LIVE);
      startDurationCounter();
      startViewerSimulation();
    }, 1000);
  }, [dispatch]);

  const startDurationCounter = useCallback(() => {
    const startTime = Date.now();
    durationRef.current = setInterval(() => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      dispatch(updateLiveStats({ duration }));
    }, 1000);
  }, [dispatch]);

  const startViewerSimulation = useCallback(() => {
    viewerIntervalRef.current = setInterval(() => {
      const change = Math.random() > 0.5 ? 1 : -1;
      const delta = Math.floor(Math.random() * 5) * change;
      const currentViewers = liveState.stats.viewerCount;
      const newViewers = Math.max(1, currentViewers + delta);
      dispatch(
        updateLiveStats({
          viewerCount: newViewers,
          peakViewers: Math.max(liveState.stats.peakViewers, newViewers),
        }),
      );
    }, 5000);
  }, [dispatch, liveState.stats.viewerCount, liveState.stats.peakViewers]);

  const endLive = useCallback(() => {
    if (durationRef.current) clearInterval(durationRef.current);
    if (viewerIntervalRef.current) clearInterval(viewerIntervalRef.current);
    liveService.stopSimulation();
    setStreamStatus(LiveStatus.ENDED);
    dispatch(setLiveStatus(false));
    dispatch(resetLiveState());
  }, [dispatch]);

  const toggleMute = useCallback(() => {
    dispatch({ type: 'liveInteraction/toggleMute' });
  }, [dispatch]);

  const sendRemedy = useCallback(
    (title: string, description: string, isPaid: boolean) => {
      const remedy: Remedy = {
        id: `remedy_${Date.now()}`,
        title,
        description,
        type: isPaid ? RemedyType.PAID : RemedyType.FREE,
        price: isPaid ? (Math.floor(Math.random() * 5) + 1) * 101 : undefined,
        timestamp: Date.now(),
      };

      const message: ChatMessage = {
        id: `msg_${Date.now()}`,
        userId: 'astrologer',
        username: 'Guruji',
        message: `[REMEDY] ${title}: ${description}${
          isPaid ? ` - Price: ${remedy.price} coins` : ''
        }`,
        type: MessageType.REMEDY,
        timestamp: Date.now(),
      };

      dispatch(addChatMessage(message));
      setShowRemedyModal(false);
    },
    [dispatch],
  );

  const sendChatMessage = useCallback(
    (message: string, username: string = 'You') => {
      const chatMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        userId: 'user',
        username,
        message,
        type: MessageType.CHAT,
        timestamp: Date.now(),
      };
      dispatch(addChatMessage(chatMessage));
    },
    [dispatch],
  );

  const pinMessage = useCallback(
    (message: ChatMessage) => {
      const pinned: PinnedMessage = {
        message,
        expiresAt: Date.now() + 60000,
      };
      dispatch(setPinnedMessage(pinned));
    },
    [dispatch],
  );

  return {
    liveState,
    streamStatus,
    showRemedyModal,
    showGiftPopup,
    showJoinerPopup,
    startLive,
    endLive,
    toggleMute,
    sendRemedy,
    sendChatMessage,
    pinMessage,
    setShowRemedyModal,
  };
};

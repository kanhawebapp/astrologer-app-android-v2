import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ChatMessage,
  GiftEvent,
  LikeEvent,
  LiveInteractionState,
  LiveStreamStats,
  LiveParticipant,
  PinnedMessage,
} from '../../features/live/domain/types';

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

const liveInteractionSlice = createSlice({
  name: 'liveInteraction',
  initialState,
  reducers: {
    setLiveStatus: (state, action: PayloadAction<boolean>) => {
      state.isLive = action.payload;
    },
    toggleMute: state => {
      state.isMuted = !state.isMuted;
    },
    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
      if (state.messages.length > 50) {
        state.messages = state.messages.slice(-50);
      }
    },
    addLikeEvent: (state, action: PayloadAction<LikeEvent>) => {
      state.likes.push(action.payload);
      state.stats.totalLikes += 1;
      if (state.likes.length > 100) {
        state.likes = state.likes.slice(-100);
      }
    },
    addGiftEvent: (state, action: PayloadAction<GiftEvent>) => {
      state.gifts.push(action.payload);
      state.stats.totalGifts += 1;
      if (action.payload.giftType === 'COINS') {
        state.stats.totalEarnings += action.payload.amount;
      }
      if (state.gifts.length > 50) {
        state.gifts = state.gifts.slice(-50);
      }
    },
    updateLiveStats: (
      state,
      action: PayloadAction<Partial<LiveStreamStats>>,
    ) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    setParticipants: (state, action: PayloadAction<LiveParticipant[]>) => {
      state.participants = action.payload;
    },
    setPinnedMessage: (state, action: PayloadAction<PinnedMessage | null>) => {
      state.pinnedMessage = action.payload;
    },
    addRecentJoined: (state, action: PayloadAction<string>) => {
      state.recentJoined.push(action.payload);
      if (state.recentJoined.length > 10) {
        state.recentJoined = state.recentJoined.slice(-10);
      }
    },
    resetLiveState: () => initialState,
  },
});

export const {
  setLiveStatus,
  toggleMute,
  addChatMessage,
  addLikeEvent,
  addGiftEvent,
  updateLiveStats,
  setParticipants,
  setPinnedMessage,
  addRecentJoined,
  resetLiveState,
} = liveInteractionSlice.actions;

export default liveInteractionSlice.reducer;

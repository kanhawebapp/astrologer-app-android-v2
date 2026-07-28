import { GiftType, MessageType, RemedyType } from './liveEnums';

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  type: MessageType;
  timestamp: number;
  avatarUrl?: string;
}

export interface LikeEvent {
  id: string;
  userId: string;
  username: string;
  timestamp: number;
}

export interface GiftEvent {
  id: string;
  userId: string;
  username: string;
  giftType: GiftType;
  amount: number;
  timestamp: number;
  avatarUrl?: string;
}

export interface Remedy {
  id: string;
  title: string;
  description: string;
  type: RemedyType;
  price?: number;
  timestamp: number;
}

export interface LiveStreamStats {
  viewerCount: number;
  peakViewers: number;
  totalLikes: number;
  totalGifts: number;
  totalEarnings: number;
  duration: number;
}

export interface LiveParticipant {
  id: string;
  username: string;
  avatarUrl?: string;
  coinsContributed: number;
  isSupporter: boolean;
}

export interface PinnedMessage {
  message: ChatMessage;
  expiresAt: number;
}

export interface LiveInteractionState {
  isLive: boolean;
  isMuted: boolean;
  messages: ChatMessage[];
  likes: LikeEvent[];
  gifts: GiftEvent[];
  stats: LiveStreamStats;
  participants: LiveParticipant[];
  pinnedMessage: PinnedMessage | null;
  recentJoined: string[];
}

export interface LiveStreamingConfig {
  maxMessages: number;
  messageDisplayDuration: number;
  likeInterval: number;
  giftMinInterval: number;
  simulateMode: boolean;
}

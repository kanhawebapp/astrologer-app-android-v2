import {
  LiveStreamStats,
  LiveParticipant,
  ChatMessage,
  GiftEvent,
  LikeEvent,
} from '../domain/types';

export interface LiveSessionData {
  sessionId: string;
  title: string;
  astrologerId: string;
  astrologerName: string;
  startedAt: number;
  stats: LiveStreamStats;
  participants: LiveParticipant[];
  messages: ChatMessage[];
}

class LiveRepository {
  private currentSession: LiveSessionData | null = null;

  createSession(
    title: string,
    astrologerId: string,
    astrologerName: string,
  ): LiveSessionData {
    this.currentSession = {
      sessionId: `session_${Date.now()}`,
      title,
      astrologerId,
      astrologerName,
      startedAt: Date.now(),
      stats: {
        viewerCount: 0,
        peakViewers: 0,
        totalLikes: 0,
        totalGifts: 0,
        totalEarnings: 0,
        duration: 0,
      },
      participants: [],
      messages: [],
    };
    return this.currentSession;
  }

  getCurrentSession(): LiveSessionData | null {
    return this.currentSession;
  }

  updateStats(updates: Partial<LiveStreamStats>) {
    if (this.currentSession) {
      this.currentSession.stats = { ...this.currentSession.stats, ...updates };
    }
  }

  addMessage(message: ChatMessage) {
    if (this.currentSession) {
      this.currentSession.messages.push(message);
      if (this.currentSession.messages.length > 50) {
        this.currentSession.messages.shift();
      }
    }
  }

  addGift(gift: GiftEvent) {
    if (this.currentSession) {
      this.currentSession.stats.totalGifts += 1;
      if (gift.giftType === 'COINS') {
        this.currentSession.stats.totalEarnings += gift.amount;
      }
    }
  }

  addLike(like: LikeEvent) {
    if (this.currentSession) {
      this.currentSession.stats.totalLikes += 1;
    }
  }

  addParticipant(participant: LiveParticipant) {
    if (this.currentSession) {
      const existing = this.currentSession.participants.find(
        p => p.id === participant.id,
      );
      if (existing) {
        existing.coinsContributed += participant.coinsContributed;
      } else {
        this.currentSession.participants.push(participant);
      }
    }
  }

  updateDuration() {
    if (this.currentSession) {
      this.currentSession.stats.duration = Math.floor(
        (Date.now() - this.currentSession.startedAt) / 1000,
      );
    }
  }

  endSession(): LiveStreamStats | null {
    const stats = this.currentSession?.stats || null;
    this.currentSession = null;
    return stats;
  }
}

export const liveRepository = new LiveRepository();
export default liveRepository;

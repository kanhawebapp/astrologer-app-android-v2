import { LiveStreamingConfig, LiveInteractionState } from '../domain/types';
import { LiveStatus } from '../domain/liveEnums';
import {
  generateRandomMessage,
  generateRandomLike,
  generateRandomGift,
  generateJoiningMessage,
} from './dummyLiveInteractionData';

const defaultConfig: LiveStreamingConfig = {
  maxMessages: 50,
  messageDisplayDuration: 60000,
  likeInterval: 2000,
  giftMinInterval: 15000,
  simulateMode: true,
};

class LiveService {
  private config: LiveStreamingConfig;
  private simulationIntervals: ReturnType<typeof setInterval>[] = [];
  private listeners: Map<string, Function> = new Map();

  constructor() {
    this.config = defaultConfig;
  }

  setConfig(config: Partial<LiveStreamingConfig>) {
    this.config = { ...this.config, ...config };
  }

  on(event: string, callback: Function) {
    this.listeners.set(event, callback);
  }

  off(event: string) {
    this.listeners.delete(event);
  }

  emit(event: string, data: unknown) {
    const callback = this.listeners.get(event);
    if (callback) {
      callback(data);
    }
  }

  startSimulation(onLiveStart: (state: Partial<LiveInteractionState>) => void) {
    this.stopSimulation();
    if (!this.config.simulateMode) return;

    const messageInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        const message = generateRandomMessage();
        this.emit('message', message);
        onLiveStart({ messages: [message] });
      }
    }, 3000);

    const likeInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        const like = generateRandomLike();
        this.emit('like', like);
        onLiveStart({ likes: [like] });
      }
    }, this.config.likeInterval);

    const giftInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        const gift = generateRandomGift();
        this.emit('gift', gift);
        onLiveStart({ gifts: [gift] });
      }
    }, this.config.giftMinInterval);

    const joinInterval = setInterval(() => {
      if (Math.random() > 0.5) {
        const joined = generateJoiningMessage();
        this.emit('join', joined);
        onLiveStart({ recentJoined: [joined] });
      }
    }, 8000);

    this.simulationIntervals = [
      messageInterval,
      likeInterval,
      giftInterval,
      joinInterval,
    ];
  }

  stopSimulation() {
    this.simulationIntervals.forEach(interval => clearInterval(interval));
    this.simulationIntervals = [];
  }

  generateInitialMessages(count: number = 20) {
    const messages = [];
    for (let i = 0; i < count; i++) {
      messages.push(generateRandomMessage());
    }
    return messages;
  }
}

export const liveService = new LiveService();
export default liveService;

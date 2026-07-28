import { ChatMessage, GiftEvent, LikeEvent } from '../domain/types';

type EventCallback<T> = (data: T) => void;

class SocketService {
  private isConnected: boolean = false;
  private listeners: Map<string, Function> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  connect(roomId: string): Promise<boolean> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log(`[SocketService] Connected to room: ${roomId}`);
        resolve(true);
      }, 500);
    });
  }

  disconnect() {
    this.isConnected = false;
    this.listeners.clear();
    console.log('[SocketService] Disconnected');
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }

  onMessage(callback: EventCallback<ChatMessage>) {
    this.listeners.set('message', callback);
  }

  onLike(callback: EventCallback<LikeEvent>) {
    this.listeners.set('like', callback);
  }

  onGift(callback: EventCallback<GiftEvent>) {
    this.listeners.set('gift', callback);
  }

  onJoin(callback: EventCallback<string>) {
    this.listeners.set('join', callback);
  }

  onLeave(callback: EventCallback<string>) {
    this.listeners.set('leave', callback);
  }

  emitMessage(message: ChatMessage) {
    if (!this.isConnected) return;
    this.listeners.get('message')?.(message);
  }

  emitLike(like: LikeEvent) {
    if (!this.isConnected) return;
    this.listeners.get('like')?.(like);
  }

  emitGift(gift: GiftEvent) {
    if (!this.isConnected) return;
    this.listeners.get('gift')?.(gift);
  }

  emitJoin(username: string) {
    if (!this.isConnected) return;
    this.listeners.get('join')?.(username);
  }

  emitLeave(username: string) {
    if (!this.isConnected) return;
    this.listeners.get('leave')?.(username);
  }

  removeAllListeners() {
    this.listeners.clear();
  }
}

export const socketService = new SocketService();
export default socketService;

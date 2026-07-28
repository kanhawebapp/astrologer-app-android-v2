import { TYPING_DEBOUNCE_MS } from '../domain/chatEvents';
import { socketManager } from '../../../services/socket/socketManager';
import { ChatSocketEvents } from '../domain/chatEvents';

export class TypingManager {
  private typingTimeout: Map<string, ReturnType<typeof setTimeout>> = new Map();

  async sendTyping(roomId: string, isTyping: boolean): Promise<void> {
    const key = `${roomId}_emit`;
    const existingTimeout = this.typingTimeout.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    if (isTyping) {
      await socketManager.emit(ChatSocketEvents.TYPING_START, { roomId });

      const timeout = setTimeout(async () => {
        await socketManager.emit(ChatSocketEvents.TYPING_STOP, { roomId });
        this.typingTimeout.delete(key);
      }, TYPING_DEBOUNCE_MS);

      this.typingTimeout.set(key, timeout);
    } else {
      await socketManager.emit(ChatSocketEvents.TYPING_STOP, { roomId });
    }
  }

  clearTypingTimeout(key: string): void {
    const timeout = this.typingTimeout.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeout.delete(key);
    }
  }

  clearAll(): void {
    this.typingTimeout.forEach(timeout => clearTimeout(timeout));
    this.typingTimeout.clear();
  }
}

export const typingManager = new TypingManager();

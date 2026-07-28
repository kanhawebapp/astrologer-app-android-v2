import { socketClient } from '../../../services/socket/socketClient';
import { callCallbackManager } from './callCallbackManager';
import { setupEventHandlers, removeEventHandlers } from './callEventHandlers';

class CallSocketService {
  private static instance: CallSocketService;
  private isListenerSetup: boolean = false;
  private settingUp: boolean = false;
  private currentSocket: import('../../../services/socket/socketClient').Socket | null = null;

  private constructor() {}

  static getInstance(): CallSocketService {
    if (!CallSocketService.instance) {
      CallSocketService.instance = new CallSocketService();
    }
    return CallSocketService.instance;
  }

  addCallbacks(callbacks: any): void {
    callCallbackManager.addCallbacks(callbacks);
  }

  removeCallbacks(callbacks: any): void {
    callCallbackManager.removeCallbacks(callbacks);
  }

  setCallbacks(callbacks: any): void {
    callCallbackManager.setCallbacks(callbacks);
  }

  clearCallbacks(): void {
    callCallbackManager.clearCallbacks();
  }

  async setupListeners(): Promise<void> {
    if (this.settingUp) {
      return;
    }

    const socket = await socketClient.getSocket();

    // Reconnect replaces the Socket.IO instance.
    // If the socket object changed, we must rebind listeners to the new instance.
    if (this.currentSocket !== socket) {
      if (this.isListenerSetup) {
        await this.removeListeners();
      }
      this.currentSocket = socket;
      this.isListenerSetup = false;
    }

    if (this.isListenerSetup) {
      return;
    }

    this.settingUp = true;

    try {
      await setupEventHandlers();
      this.isListenerSetup = true;
    } catch (error) {
      throw error;
    } finally {
      this.settingUp = false;
    }
  }

  async removeListeners(): Promise<void> {
    await removeEventHandlers();
    this.isListenerSetup = false;
    this.clearCallbacks();
  }
}

export const callSocketService = CallSocketService.getInstance();
export default callSocketService;
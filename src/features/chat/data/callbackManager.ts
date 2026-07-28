type ChatEventCallback<T> = (data: T) => void;

export interface ChatSocketCallbacks {
  onNewChatRequest?: ChatEventCallback<any>;
  onChatStarted?: ChatEventCallback<any>;
  onReceiveMessage?: ChatEventCallback<any>;
  onTypingStart?: ChatEventCallback<any>;
  onTypingStop?: ChatEventCallback<any>;
  onCompletedChat?: ChatEventCallback<any>;
  onLeaveChat?: ChatEventCallback<any>;
  onUserDisconnected?: ChatEventCallback<any>;
  onChatRejectAuto?: ChatEventCallback<any>;
  onMessageRead?: ChatEventCallback<any>;
  onMessageDelivered?: ChatEventCallback<any>;
  onChatTimeout?: ChatEventCallback<any>;
  onRequestAccepted?: ChatEventCallback<any>;
  onRequestRejected?: ChatEventCallback<any>;
  onChatCancelByUser?: ChatEventCallback<any>;
  onConnectionChange?: ChatEventCallback<boolean>;
}

export class CallbackManager {
  private callbackSets: Set<ChatSocketCallbacks> = new Set();

  addCallbacks(callbacks: ChatSocketCallbacks): void {
    this.callbackSets.add(callbacks);
  }

  removeCallbacks(callbacks: ChatSocketCallbacks): void {
    this.callbackSets.delete(callbacks);
  }

  setCallbacks(callbacks: ChatSocketCallbacks): void {
    this.clearCallbacks();
    this.callbackSets.add(callbacks);
  }

  clearCallbacks(): void {
    this.callbackSets.clear();
  }

  invokeCallbacks(event: keyof ChatSocketCallbacks, data: any): void {
    this.callbackSets.forEach(cb => {
      const handler = cb[event];
      if (handler) {
        handler(data);
      }
    });
  }
}

export const callbackManager = new CallbackManager();

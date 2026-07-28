type CallEventCallback<T> = (data: T) => void;

export interface CallSocketCallbacks {
  onIncomingCall?: CallEventCallback<any>;
  onPeerJoined?: CallEventCallback<any>;
  onOffer?: CallEventCallback<any>;
  onAnswer?: CallEventCallback<any>;
  onIceCandidate?: CallEventCallback<any>;
  onRemoteTrack?: CallEventCallback<any>;
  onCallEndedByUser?: CallEventCallback<any>;
  onCallEndedByAstrologer?: CallEventCallback<any>;
  onCallRejected?: CallEventCallback<any>;
  onCallTimeout?: CallEventCallback<any>;
  onCallCancelledByUser?: CallEventCallback<any>;
  onConnectionChange?: CallEventCallback<boolean>;
}

class CallbackManager {
  private callbackSets: Set<CallSocketCallbacks> = new Set();

  addCallbacks(callbacks: CallSocketCallbacks): void {
    this.callbackSets.add(callbacks);
  }

  removeCallbacks(callbacks: CallSocketCallbacks): void {
    this.callbackSets.delete(callbacks);
  }

  setCallbacks(callbacks: CallSocketCallbacks): void {
    this.clearCallbacks();
    this.callbackSets.add(callbacks);
  }

  clearCallbacks(): void {
    this.callbackSets.clear();
  }

  invokeCallbacks(event: keyof CallSocketCallbacks, data: any): void {
    this.callbackSets.forEach(cb => {
      const handler = cb[event];
      if (handler) {
        handler(data);
      }
    });
  }
}

export const callCallbackManager = new CallbackManager();

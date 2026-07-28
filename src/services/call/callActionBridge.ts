type AcceptHandler = () => void;
type RejectHandler = () => void;

class CallActionBridge {
  private acceptRef: AcceptHandler | null = null;
  private rejectRef: RejectHandler | null = null;

  setAcceptHandler(handler: AcceptHandler | null): void {
    this.acceptRef = handler;
  }

  setRejectHandler(handler: RejectHandler | null): void {
    this.rejectRef = handler;
  }

  accept(): void {
    if (this.acceptRef) {
      this.acceptRef();
    }
  }

  reject(): void {
    if (this.rejectRef) {
      this.rejectRef();
    }
  }

  hasHandlers(): boolean {
    return this.acceptRef !== null && this.rejectRef !== null;
  }
}

export const callActionBridge = new CallActionBridge();

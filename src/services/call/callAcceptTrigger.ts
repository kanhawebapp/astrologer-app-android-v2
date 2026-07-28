type AcceptTrigger = (() => void) | null;

let acceptTrigger: AcceptTrigger = null;
let acceptTriggerRetries = 0;
const MAX_RETRIES = 20;
const RETRY_INTERVAL_MS = 100;

export const setAcceptTrigger = (handler: AcceptTrigger): void => {
  acceptTrigger = handler;
  acceptTriggerRetries = 0;
};

export const triggerAccept = (): void => {
  if (acceptTrigger) {
    acceptTrigger();
    return;
  }

  if (acceptTriggerRetries < MAX_RETRIES) {
    acceptTriggerRetries += 1;
    setTimeout(triggerAccept, RETRY_INTERVAL_MS);
  }
};

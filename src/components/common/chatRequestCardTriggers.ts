// NOTE:
// This module mirrors the architecture used by the production-ready call
// implementation (services/call/callAcceptTrigger.ts).
//
// ChatRequestCard registers its real Accept/Reject handlers here when it
// mounts. A native pending action (e.g. OneSignal chat_request notification)
// invokes `triggerAcceptChat` / `triggerRejectChat`, which runs the EXACT
// SAME handlers the user would press inside ChatRequestCard.
//
// This guarantees there is a SINGLE implementation of Accept/Reject. The
// native path never contains duplicated business logic.

type ChatRequestTrigger = (() => void) | null;

let acceptChatTrigger: ChatRequestTrigger = null;
let rejectChatTrigger: ChatRequestTrigger = null;

let acceptRetries = 0;
let rejectRetries = 0;

const MAX_RETRIES = 35;
const RETRY_INTERVAL_MS = 100;

export const setAcceptChatTrigger = (handler: ChatRequestTrigger): void => {
  console.log(`[TRIGGERS] setAcceptChatTrigger(${handler ? 'handler' : 'null'})`);
  acceptChatTrigger = handler;
  acceptRetries = 0;
};

export const setRejectChatTrigger = (handler: ChatRequestTrigger): void => {
  console.log(`[TRIGGERS] setRejectChatTrigger(${handler ? 'handler' : 'null'})`);
  rejectChatTrigger = handler;
  rejectRetries = 0;
};

export const triggerAcceptChat = (): void => {
  console.log(`[TRIGGERS] triggerAcceptChat() ENTERED (acceptRetries=${acceptRetries})`);
  console.log(`[TRIGGERS] acceptChatTrigger is ${acceptChatTrigger ? 'SET' : 'NULL'}`);
  if (acceptChatTrigger) {
    console.log('[TRIGGERS] INVOKING registered acceptChatTrigger');
    acceptChatTrigger();
    return;
  }

  if (acceptRetries < MAX_RETRIES) {
    acceptRetries += 1;
    console.log(`[TRIGGERS] acceptChatTrigger NULL -> RETRY ${acceptRetries}/${MAX_RETRIES} after ${RETRY_INTERVAL_MS}ms`);
    setTimeout(triggerAcceptChat, RETRY_INTERVAL_MS);
  } else {
    console.log('[TRIGGERS] acceptChatTrigger NULL -> retries exhausted, giving up');
  }
};

export const triggerRejectChat = (): void => {
  console.log(`[TRIGGERS] triggerRejectChat() ENTERED (rejectRetries=${rejectRetries})`);
  console.log(`[TRIGGERS] rejectChatTrigger is ${rejectChatTrigger ? 'SET' : 'NULL'}`);
  if (rejectChatTrigger) {
    console.log('[TRIGGERS] INVOKING registered rejectChatTrigger');
    rejectChatTrigger();
    return;
  }

  if (rejectRetries < MAX_RETRIES) {
    rejectRetries += 1;
    console.log(`[TRIGGERS] rejectChatTrigger NULL -> RETRY ${rejectRetries}/${MAX_RETRIES} after ${RETRY_INTERVAL_MS}ms`);
    setTimeout(triggerRejectChat, RETRY_INTERVAL_MS);
  } else {
    console.log('[TRIGGERS] rejectChatTrigger NULL -> retries exhausted, giving up');
  }
};

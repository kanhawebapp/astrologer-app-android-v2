/*
  Instrumentation ONLY. No analysis, no fixes.

  Purpose:
  Trace handleAccept() from button press until one of:
  - chat_started_astrologer
  - chat_rejected_astrologer (aka chat_rejected)
  - leave_chat
  - completed_chat

  This file exports helpers used by UI and socket layers.
*/

import type { RootState } from '../store';

type TraceTarget =
  | 'handleAccept'
  | 'before dispatch(setActiveSession)'
  | 'after dispatch(setActiveSession)'
  | 'before navigation.navigate'
  | 'after navigation.navigate'
  | 'before acceptChatAstrologer'
  | 'inside acceptChatAstrologer'
  | 'before chat_accepted_astrologer emit'
  | 'after chat_accepted_astrologer emit'
  | 'before joinChat emit'
  | 'after joinChat emit'
  | 'socket event received'
  | 'terminal: chat_started_astrologer'
  | 'terminal: chat_rejected'
  | 'terminal: leave_chat'
  | 'terminal: completed_chat';

type TraceRecord = {
  traceId: string;
  timestamp: string;
  phase: TraceTarget;
  functionEntered?: string;
  payload?: any;
  reduxStateBefore?: Partial<RootState> | any;
  reduxStateAfter?: Partial<RootState> | any;
  emittedSocketEvent?: string;
  receivedSocketEvent?: string;
};

const TRACE_PREFIX = '[CHAT_ACCEPT_TRACE]';

const safeJson = (value: any) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const nowIso = () => new Date().toISOString();

export const getOrCreateTraceId = (): string => {
  // Keep trace id in-memory; if app reloads, new trace id.
  const w = globalThis as any;
  if (!w.__CHAT_ACCEPT_TRACE_ID__) {
    w.__CHAT_ACCEPT_TRACE_ID__ = `trace_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
  return w.__CHAT_ACCEPT_TRACE_ID__ as string;
};

export const resetTraceId = () => {
  const w = globalThis as any;
  delete w.__CHAT_ACCEPT_TRACE_ID__;
};

export const captureReduxSnapshot = (state: RootState) => {
  // Avoid huge logs; capture minimal relevant slice.
  return {
    chat: {
      chatStatus: state.chat.chatStatus,
      activeSession: state.chat.activeSession,
      chatRequestsLength: state.chat.chatRequests?.length,
      error: state.chat.error,
    },
  };
};

export const logTrace = (args: {
  traceId?: string;
  timestamp?: string;
  phase: TraceTarget;
  functionEntered?: string;
  payload?: any;
  reduxStateBefore?: RootState;
  reduxStateAfter?: RootState;
  emittedSocketEvent?: string;
  receivedSocketEvent?: string;
}) => {
  const traceId = args.traceId ?? getOrCreateTraceId();
  const timestamp = args.timestamp ?? nowIso();

  const record: TraceRecord = {
    traceId,
    timestamp,
    phase: args.phase,
    functionEntered: args.functionEntered,
    payload: args.payload,
    reduxStateBefore: args.reduxStateBefore ? captureReduxSnapshot(args.reduxStateBefore) : undefined,
    reduxStateAfter: args.reduxStateAfter ? captureReduxSnapshot(args.reduxStateAfter) : undefined,
    emittedSocketEvent: args.emittedSocketEvent,
    receivedSocketEvent: args.receivedSocketEvent,
  };

  // 7 fields requirement is handled by phase payload + snapshots.
  // Still print explicit format.
  console.log(`${TRACE_PREFIX} ${phaseToLabel(record.phase)}`);
  console.log('1. timestamp:', record.timestamp);
  console.log('2. function entered:', record.functionEntered ?? '');
  console.log('3. payload:', record.payload ?? '');
  console.log('4. redux state before:', record.reduxStateBefore ?? '');
  console.log('5. redux state after:', record.reduxStateAfter ?? '');
  console.log('6. emitted socket event:', record.emittedSocketEvent ?? '');
  console.log('7. received socket event:', record.receivedSocketEvent ?? '');
};

const phaseToLabel = (p: TraceTarget) => p;

export const installChatAcceptTraceTerminalGuards = () => {
  // No-op helper placeholder.
  // Terminal guards will be logged from the socket event layer.
};


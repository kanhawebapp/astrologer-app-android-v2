export const CallSocketEvents = {
  INCOMING_CALL: 'incoming_call',
  JOIN_CALL: 'join_call',
  CALL_ACCEPTED_BY_ASTROLOGER: 'callAcceptedByAstrologer',
  CALL_REJECTED: 'call_cancel_by_astrologer',
  OFFER: 'offer',
  ANSWER: 'answer',
  ICE_CANDIDATE: 'ice-candidate',
  CALL_ENDED_BY_USER: 'call_ended_by_user',
  CALL_ENDED_BY_ASTROLOGER: 'call_ended_by_astrologer',
  PEER_JOINED: 'peer_joined',
  CALL_TIMEOUT: 'call_timeout',
  CALL_CANCEL_BY_USER: 'call_cancel_by_user',
} as const;

export type CallSocketEventName =
  (typeof CallSocketEvents)[keyof typeof CallSocketEvents];

export type CallState = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

export interface CallStateData {
   callState: CallState;
   roomId: string | null;
   callId: string | null;
   callerId: string | null;
   participant: Participant | null;
   callTime: number; 
   isMuted: boolean;
   isSpeakerOn: boolean;
   callDuration: number;
   error: string | null;
}

export interface IncomingCallPayload {
   room_id: string;
   callerId: string;
   receiverId: string;
   callId: string;
   callTime: number;
   consultationType: 'call';
   callerName?: string;
   callerAvatar?: string;
}

// Simple type for SDP offer/answer (platform-specific serialization)
export interface SDP {
  type: 'offer' | 'answer';
  sdp: string;
}

export interface CallOfferPayload {
  room_id: string;
  offer: SDP;
}

export interface CallAnswerPayload {
  room_id: string;
  answer: SDP;
}

export interface IceCandidatePayload {
  room_id: string;
  candidate: {
    candidate: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
  };
}

export interface CallEndedPayload {
  roomId: string;
}

export interface JoinCallPayload {
  roomId: string;
}

export interface CallAcceptedByAstrologerPayload {
  roomId: string;
  astroId: string;
}
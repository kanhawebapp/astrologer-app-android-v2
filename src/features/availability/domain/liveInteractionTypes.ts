export type LiveInteractionType = 'AUDIO' | 'VIDEO';

export type LiveInteractionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'ENDED';

export type LiveInteractionAction = 'ACCEPT' | 'REJECT';

export interface LiveInteractionRequest {
  id: string;
  liveStreamId: string;
  userId: string;
  astrologerId: string;
  agoraUid: number;
  interactionType: LiveInteractionType;
  status: LiveInteractionStatus;
  requestedAt: string;
  acceptedAt?: string | null;
  endedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetPendingLiveInteractionsResponse {
  getPendingLiveInteractions: LiveInteractionRequest[] | null;
}

export interface RespondLiveInteractionRequestResponse {
  respondLiveInteractionRequest: LiveInteractionRequest | null;
}

export interface EndLiveInteractionResponse {
  endLiveInteraction: LiveInteractionRequest | null;
}

export type HostInteractionPhase =
  | 'idle'
  | 'incoming'
  | 'responding'
  | 'connecting'
  | 'connected'
  | 'ending';

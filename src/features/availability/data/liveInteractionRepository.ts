import {
  LiveInteractionAction,
  LiveInteractionRequest,
} from '../domain/liveInteractionTypes';
import * as liveInteractionService from './liveInteractionService';
import {describeError, liveLog, liveWarn} from './liveLogger';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const normalizeRequest = (
  raw: LiveInteractionRequest | null | undefined,
): LiveInteractionRequest | null => {
  if (!raw || !isNonEmptyString(raw.id)) {
    return null;
  }
  if (!Number.isFinite(raw.agoraUid)) {
    return null;
  }
  return raw;
};

export const getPendingLiveInteractions = async (
  liveStreamId: string,
): Promise<LiveInteractionRequest[]> => {
  if (!isNonEmptyString(liveStreamId)) {
    throw new Error('Live stream id is required');
  }
  try {
    const response =
      await liveInteractionService.getPendingLiveInteractions(liveStreamId);
    const list = response.getPendingLiveInteractions;
    if (!Array.isArray(list)) {
      liveWarn('GetPendingLiveInteractions: not a list', {
        receivedNull: list === null,
      });
      return [];
    }
    const valid = list
      .map(normalizeRequest)
      .filter((item): item is LiveInteractionRequest => item !== null)
      .filter(item => item.status === 'PENDING');
    liveLog('GetPendingLiveInteractions', {
      liveStreamId,
      count: valid.length,
    });
    return valid;
  } catch (error) {
    liveWarn('GetPendingLiveInteractions error', describeError(error));
    throw error;
  }
};

export const respondLiveInteractionRequest = async (
  requestId: string,
  action: LiveInteractionAction,
): Promise<LiveInteractionRequest> => {
  if (!isNonEmptyString(requestId)) {
    throw new Error('Request id is required');
  }
  try {
    const response =
      await liveInteractionService.respondLiveInteractionRequest(
        requestId,
        action,
      );
    const result = normalizeRequest(response.respondLiveInteractionRequest);
    if (!result) {
      throw new Error('Server did not return an interaction response');
    }
    liveLog('RespondLiveInteractionRequest', {
      requestId,
      action,
      status: result.status,
    });
    return result;
  } catch (error) {
    liveWarn('RespondLiveInteractionRequest error', describeError(error));
    throw error;
  }
};

export const endLiveInteraction = async (
  requestId: string,
): Promise<LiveInteractionRequest> => {
  if (!isNonEmptyString(requestId)) {
    throw new Error('Request id is required');
  }
  try {
    const response = await liveInteractionService.endLiveInteraction(requestId);
    const result = normalizeRequest(response.endLiveInteraction);
    if (!result) {
      throw new Error('Server did not return an end-interaction response');
    }
    liveLog('EndLiveInteraction', {
      requestId,
      status: result.status,
    });
    return result;
  } catch (error) {
    liveWarn('EndLiveInteraction error', describeError(error));
    throw error;
  }
};

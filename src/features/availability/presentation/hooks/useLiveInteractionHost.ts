import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  HostInteractionPhase,
  LiveInteractionRequest,
} from '../../domain/liveInteractionTypes';
import * as liveInteractionRepo from '../../data/liveInteractionRepository';
import {liveWarn} from '../../data/liveLogger';
import {userDetailsApi} from '../../../../services/api/userDetail/userDetails.service';
import {getErrorMessage} from '../../../../utils/helpers';
import {usePendingLiveInteractions} from './usePendingLiveInteractions';

interface GuestProfile {
  id: string;
  name: string;
}

interface UseLiveInteractionHostOptions {
  liveStreamId: string | null | undefined;
  enabled: boolean;
  subscribeGuest: (
    uid: number,
    options: {subscribeVideo: boolean},
  ) => boolean;
  unsubscribeGuest: () => void;
  setOnGuestOffline: (handler: ((uid: number) => void) | null) => void;
}

/**
 * Astrologer-side live interaction: pending queue, ACCEPT/REJECT, and End.
 * Uses RespondLiveInteractionRequest + EndLiveInteraction; keeps the main
 * Agora broadcast channel running when an interaction ends.
 */
export const useLiveInteractionHost = ({
  liveStreamId,
  enabled,
  subscribeGuest,
  unsubscribeGuest,
  setOnGuestOffline,
}: UseLiveInteractionHostOptions) => {
  const pending = usePendingLiveInteractions({liveStreamId, enabled});
  const [activeRequest, setActiveRequest] =
    useState<LiveInteractionRequest | null>(null);
  const [phase, setPhase] = useState<HostInteractionPhase>('idle');
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const activeRequestRef = useRef<LiveInteractionRequest | null>(null);
  const endingRef = useRef(false);
  activeRequestRef.current = activeRequest;

  const incomingRequest = useMemo(() => {
    if (activeRequest) {
      return null;
    }
    return pending.requests[0] ?? null;
  }, [activeRequest, pending.requests]);

  const queuedCount = pending.requests.length;

  const profileUserId =
    activeRequest?.userId ?? incomingRequest?.userId ?? null;

  useEffect(() => {
    if (!profileUserId) {
      if (!activeRequest) {
        setGuestProfile(null);
      }
      return;
    }
    let cancelled = false;
    setGuestProfile(prev =>
      prev?.id === profileUserId
        ? prev
        : {id: profileUserId, name: 'Audience member'},
    );
    userDetailsApi
      .getUserDetails(profileUserId)
      .then(response => {
        if (cancelled) {
          return;
        }
        const details = response.getUserDetails;
        const name = details?.name?.trim();
        setGuestProfile({
          id: profileUserId,
          name: name && name.length > 0 ? name : 'Audience member',
        });
      })
      .catch(() => {
        // Keep fallback name — profile is non-critical for accept/reject.
      });
    return () => {
      cancelled = true;
    };
  }, [profileUserId, activeRequest]);

  const clearActiveInteraction = useCallback(() => {
    unsubscribeGuest();
    setActiveRequest(null);
    setPhase('idle');
    setIsEnding(false);
    endingRef.current = false;
  }, [unsubscribeGuest]);

  const endInteractionLocally = useCallback(() => {
    unsubscribeGuest();
    setActiveRequest(null);
    setPhase('idle');
    setIsEnding(false);
    endingRef.current = false;
  }, [unsubscribeGuest]);

  useEffect(() => {
    setOnGuestOffline(uid => {
      const current = activeRequestRef.current;
      if (!current || current.agoraUid !== uid || endingRef.current) {
        return;
      }
      // Guest left unexpectedly — sync server end, then clear local RTC UI.
      endingRef.current = true;
      setIsEnding(true);
      setPhase('ending');
      liveInteractionRepo
        .endLiveInteraction(current.id)
        .catch(() => {
          // Local cleanup still required even if the end mutation fails.
        })
        .finally(() => {
          endInteractionLocally();
        });
    });
    return () => setOnGuestOffline(null);
  }, [setOnGuestOffline, endInteractionLocally]);

  useEffect(() => {
    if (!enabled) {
      clearActiveInteraction();
      setRespondingId(null);
      setActionError(null);
    }
  }, [enabled, clearActiveInteraction]);

  const respond = useCallback(
    async (request: LiveInteractionRequest, action: 'ACCEPT' | 'REJECT') => {
      if (respondingId || activeRequest || endingRef.current) {
        return;
      }
      setRespondingId(request.id);
      setActionError(null);
      setPhase('responding');
      try {
        const result = await liveInteractionRepo.respondLiveInteractionRequest(
          request.id,
          action,
        );
        pending.removeRequest(request.id);

        if (action === 'REJECT') {
          setPhase('idle');
          return;
        }

        if (result.status !== 'ACCEPTED') {
          setPhase('idle');
          setActionError('Request could not be accepted. Please try again.');
          return;
        }

        setActiveRequest(result);
        setPhase('connecting');
        const subscribed = subscribeGuest(result.agoraUid, {
          subscribeVideo: result.interactionType === 'VIDEO',
        });
        if (!subscribed) {
          setActionError(
            'Accepted, but could not connect to the audience member audio/video.',
          );
          setPhase('idle');
          setActiveRequest(null);
          return;
        }
        setPhase('connected');
      } catch (error) {
        setPhase(activeRequest ? 'connected' : 'idle');
        setActionError(getErrorMessage(error));
      } finally {
        setRespondingId(null);
      }
    },
    [respondingId, activeRequest, pending.removeRequest, subscribeGuest],
  );

  const acceptRequest = useCallback(
    (request: LiveInteractionRequest) => respond(request, 'ACCEPT'),
    [respond],
  );

  const rejectRequest = useCallback(
    (request: LiveInteractionRequest) => respond(request, 'REJECT'),
    [respond],
  );

  const endInteraction = useCallback(async () => {
    const current = activeRequestRef.current;
    if (!current || endingRef.current) {
      return;
    }
    endingRef.current = true;
    setIsEnding(true);
    setPhase('ending');
    setActionError(null);
    try {
      const result = await liveInteractionRepo.endLiveInteraction(current.id);
      if (result.status !== 'ENDED' && result.status !== 'CANCELLED') {
        // Still tear down local tracks; broadcast must continue.
        liveWarn('Unexpected EndLiveInteraction status', {
          status: result.status,
          requestId: current.id,
        });
      }
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      // Always restore host UI without leaving the live broadcast channel.
      endInteractionLocally();
    }
  }, [endInteractionLocally]);

  return {
    incomingRequest,
    queuedCount,
    activeRequest,
    phase,
    guestProfile,
    guestName:
      guestProfile?.name ||
      (activeRequest
        ? 'Audience member'
        : incomingRequest
        ? 'Audience member'
        : ''),
    isResponding: respondingId != null,
    respondingId,
    isEnding,
    actionError,
    pendingError: pending.error,
    isPendingLoading: pending.isLoading,
    retryPending: pending.retry,
    acceptRequest,
    rejectRequest,
    endInteraction,
    clearActionError: () => setActionError(null),
  };
};

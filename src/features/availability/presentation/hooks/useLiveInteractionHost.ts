import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  HostInteractionPhase,
  LiveInteractionRequest,
} from '../../domain/liveInteractionTypes';
import * as liveInteractionRepo from '../../data/liveInteractionRepository';
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
 * Astrologer-side live interaction: pending queue, accept/reject, and active guest.
 * Ending an accepted interaction locally unsubscribes RTC; astroAuth has no
 * endLiveInteraction mutation — guest end or remote offline clears the session.
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const activeRequestRef = useRef<LiveInteractionRequest | null>(null);
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
    setActionError(null);
  }, [unsubscribeGuest]);

  useEffect(() => {
    setOnGuestOffline(uid => {
      const current = activeRequestRef.current;
      if (current && current.agoraUid === uid) {
        setActiveRequest(null);
        setPhase('idle');
        setActionError(null);
      }
    });
    return () => setOnGuestOffline(null);
  }, [setOnGuestOffline]);

  useEffect(() => {
    if (!enabled) {
      clearActiveInteraction();
      setRespondingId(null);
    }
  }, [enabled, clearActiveInteraction]);

  const respond = useCallback(
    async (request: LiveInteractionRequest, action: 'ACCEPT' | 'REJECT') => {
      if (respondingId || activeRequest) {
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
    [
      respondingId,
      activeRequest,
      pending.removeRequest,
      subscribeGuest,
    ],
  );

  const acceptRequest = useCallback(
    (request: LiveInteractionRequest) => respond(request, 'ACCEPT'),
    [respond],
  );

  const rejectRequest = useCallback(
    (request: LiveInteractionRequest) => respond(request, 'REJECT'),
    [respond],
  );

  const endInteraction = useCallback(() => {
    // astroAuth does not expose endLiveInteraction; stop local subscription only.
    setPhase('ending');
    clearActiveInteraction();
  }, [clearActiveInteraction]);

  return {
    incomingRequest,
    queuedCount,
    activeRequest,
    phase,
    guestProfile,
    guestName:
      guestProfile?.name ||
      (activeRequest ? 'Audience member' : incomingRequest ? 'Audience member' : ''),
    isResponding: respondingId != null,
    respondingId,
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

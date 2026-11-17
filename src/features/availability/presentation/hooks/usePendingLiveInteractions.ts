import {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {LiveInteractionRequest} from '../../domain/liveInteractionTypes';
import * as liveInteractionRepo from '../../data/liveInteractionRepository';
import {getErrorMessage} from '../../../../utils/helpers';

const POLL_INTERVAL_MS = 4000;

interface UsePendingLiveInteractionsOptions {
  liveStreamId: string | null | undefined;
  enabled: boolean;
}

/**
 * Polls pending audience interaction requests for the active live stream.
 * Stops when disabled, backgrounded, or unmounted. No GraphQL subscription exists.
 */
export const usePendingLiveInteractions = ({
  liveStreamId,
  enabled,
}: UsePendingLiveInteractionsOptions) => {
  const [requests, setRequests] = useState<LiveInteractionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);
  const liveStreamIdRef = useRef(liveStreamId);
  liveStreamIdRef.current = liveStreamId;

  const refresh = useCallback(async (opts?: {silent?: boolean}) => {
    const id = liveStreamIdRef.current;
    if (!id || inFlightRef.current) {
      return;
    }
    inFlightRef.current = true;
    if (!opts?.silent) {
      setIsLoading(true);
    }
    try {
      const next = await liveInteractionRepo.getPendingLiveInteractions(id);
      if (liveStreamIdRef.current !== id) {
        return;
      }
      setRequests(next);
      setError(null);
    } catch (err) {
      if (liveStreamIdRef.current !== id) {
        return;
      }
      setError(getErrorMessage(err));
    } finally {
      inFlightRef.current = false;
      if (!opts?.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const removeRequest = useCallback((requestId: string) => {
    setRequests(prev => prev.filter(item => item.id !== requestId));
  }, []);

  useEffect(() => {
    if (!enabled || !liveStreamId) {
      setRequests([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      if (!cancelled && AppState.currentState === 'active') {
        refresh({silent: true});
      }
    };

    refresh();
    intervalId = setInterval(tick, POLL_INTERVAL_MS);

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        tick();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
      sub.remove();
    };
  }, [enabled, liveStreamId, refresh]);

  return {
    requests,
    isLoading,
    error,
    refresh,
    removeRequest,
    retry: refresh,
  };
};

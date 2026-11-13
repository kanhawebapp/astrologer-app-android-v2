import { useCallback, useEffect, useRef, useState } from 'react';
import { previousRemediesApi } from '../../../../services/api/previousRemedies/previousRemedies.service';
import type { PreviousRemedy } from '../../../../services/api/previousRemedies/previousRemedies.types';

export const usePreviousRemedies = (userId?: string | null) => {
  const [remedies, setRemedies] = useState<PreviousRemedy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedUserIdRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  const fetchPreviousRemedies = useCallback(async (force = false) => {
    if (!userId) {
      setRemedies([]);
      setError(null);
      setLoading(false);
      lastFetchedUserIdRef.current = null;
      return;
    }

    if (
      !force &&
      (inFlightRef.current || lastFetchedUserIdRef.current === userId)
    ) {
      return;
    }

    try {
      inFlightRef.current = true;
      setLoading(true);
      setError(null);

      const response = await previousRemediesApi.getPreviousRemedies({
        userId,
      });

      const data = response?.getPreviousRemedies;
      setRemedies(Array.isArray(data) ? data : []);
      lastFetchedUserIdRef.current = userId;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load previous remedies';
      setError(message);
      setRemedies([]);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPreviousRemedies();
  }, [fetchPreviousRemedies]);

  return {
    remedies,
    loading,
    error,
    refetch: () => fetchPreviousRemedies(true),
  };
};

import { useState, useCallback } from 'react';
import { SessionRemedy, RemedyType } from '../../domain/types';

interface UseRemediesReturn {
  remedies: SessionRemedy[];
  isLoading: boolean;
  getRemediesBySessionId: (sessionId: string) => SessionRemedy[];
  sendRemedy: (
    sessionId: string,
    title: string,
    description: string,
    type: RemedyType,
    price?: number,
  ) => void;
  clearRemedies: () => void;
}

const generateId = () => {
  return `remedy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useRemedies = (): UseRemediesReturn => {
  const [remedies, setRemedies] = useState<SessionRemedy[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getRemediesBySessionId = useCallback(
    (sessionId: string): SessionRemedy[] => {
      return remedies.filter(remedy => remedy.sessionId === sessionId);
    },
    [remedies],
  );

  const sendRemedy = useCallback(
    (
      sessionId: string,
      title: string,
      description: string,
      type: RemedyType,
      price?: number,
    ) => {
      setIsLoading(true);
      const newRemedy: SessionRemedy = {
        id: generateId(),
        sessionId,
        title,
        description,
        type,
        price,
        createdAt: new Date().toISOString(),
      };
      setRemedies(prev => [...prev, newRemedy]);
      setIsLoading(false);
    },
    [],
  );

  const clearRemedies = useCallback(() => {
    setRemedies([]);
  }, []);

  return {
    remedies,
    isLoading,
    getRemediesBySessionId,
    sendRemedy,
    clearRemedies,
  };
};

export default useRemedies;

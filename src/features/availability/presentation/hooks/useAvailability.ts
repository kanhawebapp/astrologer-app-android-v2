import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../store';
import {
  fetchAvailabilityThunk,
  toggleOnlineThunk,
  toggleChatThunk,
  toggleCallThunk,
  toggleBusyModeThunk,
  toggleAutoAcceptThunk,
  updateMaxSessionsThunk,
  updateWorkingHoursThunk,
  clearError,
} from '../../../../store/slices/availabilitySlice';
import { WorkingHours } from '../../domain/types';
import { useToast } from '../../../../hooks/useToast';

export const useAvailability = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useToast();
  const { availability, isLoading, isUpdating, error, isMockData } =
    useSelector((state: RootState) => state.availability);

  const loadAvailability = useCallback(() => {
    dispatch(fetchAvailabilityThunk());
  }, [dispatch]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  useEffect(() => {
    if (error) {
      showError(error, 'Availability Error');
      dispatch(clearError());
    }
  }, [error, dispatch, showError]);

  const toggleOnline = useCallback(
    async (isOnline: boolean) => {
      await dispatch(toggleOnlineThunk(isOnline));
      showSuccess(isOnline ? 'You are now online' : 'You are now offline');
    },
    [dispatch, showSuccess],
  );

  const toggleChat = useCallback(
    async (enabled: boolean) => {
      if (!availability.isOnline) {
        showError('Go online first to enable chat');
        return;
      }
      await dispatch(toggleChatThunk(enabled));
      showSuccess(enabled ? 'Chat enabled' : 'Chat disabled');
    },
    [dispatch, showSuccess, availability.isOnline],
  );

  const toggleCall = useCallback(
    async (enabled: boolean) => {
      if (!availability.isOnline) {
        showError('Go online first to enable call');
        return;
      }
      await dispatch(toggleCallThunk(enabled));
      showSuccess(enabled ? 'Call enabled' : 'Call disabled');
    },
    [dispatch, showSuccess, availability.isOnline],
  );

  const toggleBusyMode = useCallback(
    async (enabled: boolean) => {
      await dispatch(toggleBusyModeThunk(enabled));
      showSuccess(enabled ? 'Busy mode enabled' : 'Busy mode disabled');
    },
    [dispatch, showSuccess],
  );

  const toggleAutoAccept = useCallback(
    async (enabled: boolean) => {
      await dispatch(toggleAutoAcceptThunk(enabled));
      showSuccess(enabled ? 'Auto accept enabled' : 'Auto accept disabled');
    },
    [dispatch, showSuccess],
  );

  const updateMaxSessions = useCallback(
    async (maxSessions: number) => {
      await dispatch(updateMaxSessionsThunk(maxSessions));
      showSuccess(`Max sessions set to ${maxSessions}`);
    },
    [dispatch, showSuccess],
  );

  const updateWorkingHours = useCallback(
    async (workingHours: WorkingHours) => {
      await dispatch(updateWorkingHoursThunk(workingHours));
      showSuccess('Working hours updated');
    },
    [dispatch, showSuccess],
  );

  return {
    availability,
    isLoading,
    isUpdating,
    isMockData,
    toggleOnline,
    toggleChat,
    toggleCall,
    toggleBusyMode,
    toggleAutoAccept,
    updateMaxSessions,
    updateWorkingHours,
    refresh: loadAvailability,
  };
};

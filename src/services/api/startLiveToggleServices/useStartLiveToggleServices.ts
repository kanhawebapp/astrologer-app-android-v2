import {useCallback, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../../../store';
import {getErrorMessage} from '../../../utils/helpers';
import {startLiveToggleServicesApi} from './startLiveToggleServices.service';
import {
  LIVE_DISABLED_SUCCESS_MESSAGE,
  LIVE_ENABLED_SUCCESS_MESSAGE,
  ToggleServiceResponse,
} from './startLiveToggleServices.types';

export type LiveToggleResult =
  | {ok: true; response: ToggleServiceResponse}
  | {ok: false; message: string};

const expectedSuccessMessage = (status: boolean): string =>
  status ? LIVE_ENABLED_SUCCESS_MESSAGE : LIVE_DISABLED_SUCCESS_MESSAGE;

/**
 * Reusable LIVE service toggle used by Go Live (status: true)
 * and End Live (status: false).
 *
 * Callers must only start/stop Agora after `ok: true`.
 * `ok` requires both `success === true` and the exact expected message.
 */
export const useStartLiveToggleServices = () => {
  const [isLoading, setIsLoading] = useState(false);
  const inFlightRef = useRef(false);

  const astrologerId = useSelector(
    (state: RootState) =>
      state.account.profile?.id || state.auth.user?.id || null,
  );

  const toggleLiveService = useCallback(
    async (status: boolean): Promise<LiveToggleResult> => {
      if (inFlightRef.current) {
        return {ok: false, message: 'Request already in progress'};
      }

      if (!astrologerId) {
        return {
          ok: false,
          message: 'Unable to identify astrologer. Please sign in again.',
        };
      }

      inFlightRef.current = true;
      setIsLoading(true);

      try {
        const response =
          await startLiveToggleServicesApi.startLiveToggleServices({
            astrologerId: String(astrologerId),
            serviceType: 'LIVE',
            status,
          });

        const apiMessage =
          response?.message?.trim() || 'Failed to update LIVE service';

        // Gate LIVE start/end on both success flag and exact message.
        if (
          response?.success === true &&
          apiMessage === expectedSuccessMessage(status)
        ) {
          return {ok: true, response: {...response, message: apiMessage}};
        }

        return {ok: false, message: apiMessage};
      } catch (error) {
        return {ok: false, message: getErrorMessage(error)};
      } finally {
        inFlightRef.current = false;
        setIsLoading(false);
      }
    },
    [astrologerId],
  );

  return {
    astrologerId: astrologerId ? String(astrologerId) : null,
    toggleLiveService,
    isLoading,
  };
};

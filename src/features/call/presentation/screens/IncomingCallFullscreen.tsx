import React, {useEffect, useRef} from 'react';
import {useRoute, RouteProp} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../../../../store';
import {
  setRoomId,
  setCallId,
  setCallerId,
  setParticipant,
  setCallState,
  setCallTime,
  setError,
} from '../../../../store/slices/callSlice';
import {IncomingCallFullScreen} from '../components/IncomingCallFullScreen';
import {navigationService} from '../../../../services/navigation/navigationService';
import type {RootStackParamList} from '../../../../navigation/types';

const DEBUG_PREFIX = '[IncomingCallFullscreen]';

type IncomingCallFullscreenRoute = RouteProp<
  RootStackParamList,
  'IncomingCallFullscreen'
>;

// Navigation-based entry point for the incoming call UI. Replaces the old
// absolute-positioned overlay inside MainNavigator so the UI can be opened
// from a cold/killed launch (notification tap) as soon as navigation is ready,
// without waiting for GraphQL/profile loading.
export const IncomingCallFullscreen: React.FC = () => {
  const route = useRoute<IncomingCallFullscreenRoute>();
  const dispatch = useDispatch<AppDispatch>();
  const callState = useSelector((state: RootState) => state.call.callState);
  const roomId = useSelector((state: RootState) => state.call.roomId);
  const restoredRef = useRef(false);

  console.log(`${DEBUG_PREFIX} mounted`);

  // Reconcile the route params into the call store exactly once. If the call
  // state was already prepared (e.g. handleAcceptCall set 'ringing' before
  // navigating), leave it untouched so we never clobber an in-progress accept.
  useEffect(() => {
    const params = route.params as any;
    if (!params?.roomId || restoredRef.current) {
      return;
    }
    restoredRef.current = true;

    const callAlreadyActive =
      callState === 'ringing' ||
      callState === 'connecting' ||
      callState === 'connected';

    if (roomId === params.roomId && callAlreadyActive) {
      console.log(
        `${DEBUG_PREFIX} call already active for room ${params.roomId} - skipping restore`,
      );
      return;
    }

    console.log(
      `${DEBUG_PREFIX} restoring call state from route params`,
      JSON.stringify(params),
    );

    dispatch(setRoomId(params.roomId));
    dispatch(setCallId(params.callId ?? null));
    dispatch(setCallerId(params.callerId ?? null));
    dispatch(
      setParticipant({
        id: params.callerId ?? '',
        name: params.callerName ?? 'Unknown',
        avatar: undefined,
      }),
    );
    dispatch(setCallTime(Number(params.callTime || 0) * 60));
    dispatch(setError(null));
    dispatch(setCallState('ringing'));

    console.log(
      `${DEBUG_PREFIX} call state restored to 'ringing' for room ${params.roomId}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Allow a future call on the same roomId to re-navigate.
  useEffect(() => {
    return () => {
      navigationService.resetNavigationDedupe();
    };
  }, []);

  return <IncomingCallFullScreen />;
};

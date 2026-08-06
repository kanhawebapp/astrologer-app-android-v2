import {useEffect, useCallback, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../store';
import {setCallState, setError} from '../store/slices/callSlice';
import {webrtcService} from '../services/call/webrtc.service';
import {callSocketEmitters} from '../features/call/data/callSocketEmitters';
import {callSocketService} from '../features/call/data/callSocketService';
import {ringtoneManager} from '../services/call/ringtoneManager';

const DEBUG_PREFIX = '[useGlobalCallSocket]';

export const useGlobalCallSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isMounted = useRef(true);
  const isInitialized = useRef(false);
  const queuedCandidatesRef = useRef<any[]>([]);
  const remoteDescriptionReadyRef = useRef(false);
  const roomIdRef = useRef<string | null>(null);
  // Auth token gate: only set up call socket listeners once a valid token
  // exists (post auth hydration). SocketAuthBridge reconnects with the token
  // after hydration and re-runs setupListeners.
  const token = useSelector((state: RootState) => state.auth.token);

  // console.log('[useGlobalCallSocket] effect');

  const handleIncomingCall = useCallback((data: any) => {
    // console.log(`${DEBUG_PREFIX} Received incoming call`, data);
    // Redux already set by handler
  }, []);

  const handleIceCandidate = useCallback(
    async (payload: {roomId: string; candidate: any}) => {
      const {roomId, candidate} = payload;
      roomIdRef.current = roomId;

      // console.log(`${DEBUG_PREFIX} Received ICE candidate`);

      // Queue if remote description not ready
      if (!remoteDescriptionReadyRef.current) {
        // console.log(
        //   `${DEBUG_PREFIX} Queueing ICE candidate - remote description not ready`,
        // );
        queuedCandidatesRef.current.push(candidate);
        return;
      }

      try {
        await webrtcService.addIceCandidate(candidate);
        // console.log(`${DEBUG_PREFIX} ICE candidate added`);
      } catch (error) {
        // console.log(`${DEBUG_PREFIX} Error adding ICE candidate:`, error);
      }
    },
    [],
  );

  const handleCallEndedByUser = useCallback(
    (data: any) => {
      // console.log(
      //   `${DEBUG_PREFIX} Call ended by user [CALL END TRIGGER: call_ended_by_user]`,
      //   data,
      // );
      remoteDescriptionReadyRef.current = false;
      queuedCandidatesRef.current = [];
      ringtoneManager.stopRingtone();
      dispatch(setCallState('ended'));
      dispatch(setError('User ended the call'));
      webrtcService.cleanup('call_ended_by_user');
    },
    [dispatch],
  );

  const handleCallEndedByAstrologer = useCallback(
    (data: any) => {
      // console.log(
      //   `${DEBUG_PREFIX} Call ended by astrologer (self?) [CALL END TRIGGER: call_ended_by_astrologer]`,
      //   data,
      // );
      remoteDescriptionReadyRef.current = false;
      queuedCandidatesRef.current = [];
      ringtoneManager.stopRingtone();
      dispatch(setCallState('ended'));
      webrtcService.cleanup('call_ended_by_astrologer');
    },
    [dispatch],
  );

  const handlePeerJoined = useCallback((data: any) => {
    // console.log(`${DEBUG_PREFIX} Peer joined`, data);
  }, []);

  useEffect(() => {
    // Auth gate: defer listener setup until the token is restored.
    if (!token) {
      // console.log(
      //   `${DEBUG_PREFIX} Auth token not available yet - deferring call socket listener setup until hydration`,
      // );
      return;
    }

    if (isInitialized.current) {
      return;
    }

    isMounted.current = true;
    isInitialized.current = true;

    // console.log(`${DEBUG_PREFIX} Initializing global call socket listeners...`);

    // callSocketService.setCallbacks({
    //   onIncomingCall: handleIncomingCall,
    //   onIceCandidate: handleIceCandidate,
    //   onCallEndedByUser: handleCallEndedByUser,
    //   onCallEndedByAstrologer: handleCallEndedByAstrologer,
    //   onPeerJoined: handlePeerJoined,
    // });
    callSocketService.setCallbacks({
      onIncomingCall: handleIncomingCall,
      onIceCandidate: handleIceCandidate,
      onCallEndedByUser: handleCallEndedByUser,
      onCallEndedByAstrologer: handleCallEndedByAstrologer,
      onPeerJoined: handlePeerJoined,
    });

    callSocketService
      .setupListeners()
      .then(() => {
        // console.log(`${DEBUG_PREFIX} Call socket listeners setup complete`);
      })
      .catch((error: Error) => {
        // console.log(`${DEBUG_PREFIX} Failed to setup call listeners:`, error);
      });

    return () => {
      isMounted.current = false;
      // Stop ringtone on hook cleanup (e.g., navigation away)
      ringtoneManager.stopRingtone();
      // console.log(`${DEBUG_PREFIX} Cleanup called`);
    };
  }, [
    token,
    handleIncomingCall,
    handleIceCandidate,
    handleCallEndedByUser,
    handleCallEndedByAstrologer,
    handlePeerJoined,
  ]);
};

export default useGlobalCallSocket;

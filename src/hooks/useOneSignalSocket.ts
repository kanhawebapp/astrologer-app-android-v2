import {useEffect, useRef, useCallback} from 'react';
import {useSelector} from 'react-redux';
import {AppState, AppStateStatus} from 'react-native';
import {RootState} from '../store';
import {socketManager} from '../services/socket/socketManager';
import { oneSignalService } from '../services/onesignal/oneSignalService';
import { useAccount } from '../features/account/presentation/hooks/useAccount';
// import {oneSignalService} from '../services/onesignal/OneSignalService';

const DEBUG_PREFIX = '[OneSignalSocket]';

const REGISTER_EVENT = 'register';
const APP_STATE_EVENT = 'app_state';

interface SyncState {
  isAuthenticated: boolean;
  astrologerId: string | null;
}

/**
 * Synchronizes Authentication, Socket.IO and OneSignal.
 *
 * Responsibilities (nothing else):
 * - Emit `register` only when ALL conditions are true:
 *     1. authenticated
 *     2. socket connected
 *     3. astrologer id available
 *     4. OneSignal player id available
 * - Re-emit `register` on reconnect.
 * - Re-emit `register` immediately when the player id becomes available.
 * - Avoid duplicate `register` emits (track last registered combination).
 * - Emit `app_state` on AppState changes while connected.
 */
export const useOneSignalSocket = (): void => {
  // console.log(`${DEBUG_PREFIX} >>> HOOK EXECUTING (mounted)`);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const astrologerId = useSelector(
    (state: RootState) => state.auth.user?.id ?? null, 
  ); 
 
   const {
      profile,
    
    } = useAccount();

  const stateRef = useRef<SyncState>({isAuthenticated, astrologerId});
  stateRef.current = {isAuthenticated, astrologerId};

  const socketConnectedRef = useRef<boolean>(socketManager.isConnected());
  const playerIdRef = useRef<string | null>(oneSignalService.getPlayerId());
  const lastRegisteredComboRef = useRef<string | null>(null);
  const mountedRef = useRef<boolean>(true);
 
  const tryRegister = useCallback(() => {
    // console.log(
    //   `${DEBUG_PREFIX} tryRegister() called`,
    //   {
    //     mounted: mountedRef.current,
    //     authenticated: stateRef.current.isAuthenticated,
    //     astrologerId: !!stateRef.current.astrologerId,
    //     connected: socketConnectedRef.current,
    //     playerId: !!playerIdRef.current,
    //   },
    // );
    if (!mountedRef.current) {  
      return;
    }   
    
    // console.log("profileprofileprofileprofi le---",profile)
 
    const {isAuthenticated: authenticated, astrologerId: astrologer} =
      stateRef.current;
    const connected = socketConnectedRef.current;
    const playerId = playerIdRef.current;
   // console.log("PlayerIdplayerIdplayerIdplayerId---",playerId)
    const canRegister =
      authenticated && connected && !!astrologer && !!playerId;

    if (!canRegister) {
      // console.log(`${DEBUG_PREFIX} Register deferred`, {
      //   authenticated,
      //   connected,
      //   astrologerId: !!astrologer,
      //   playerId: !!playerId,
      // });
      return;
    }

    const combo = `${astrologer}|${playerId}`;

    if (lastRegisteredComboRef.current === combo) {
      // console.log(
      //   `${DEBUG_PREFIX} Register skipped (combination already registered)`,
      // );
      return;
    }

    lastRegisteredComboRef.current = combo;

    // console.log(`[Register] Emitting "${REGISTER_EVENT}"`, {
    //   astrologerId: astrologer,
    //   playerId,
    // });

    socketManager.emit(REGISTER_EVENT, {
      astrologerId: astrologer,
      playerId,
    });

    socketManager.markRegisterEmitted();
  }, []);

  // Initialize OneSignal (idempotent within the service).
  useEffect(() => {
    // console.log(`${DEBUG_PREFIX} useEffect[init] running`);
    oneSignalService.init();
  }, []);

  // Socket connection lifecycle -> register / reset.
  useEffect(() => {
    // console.log(`${DEBUG_PREFIX} useEffect[socket] running`);
    mountedRef.current = true;

    const unsubscribe = socketManager.onConnectionChange(connected => {
      socketConnectedRef.current = connected;

      if (connected) {
        // console.log(`${DEBUG_PREFIX} Socket connected -> attempt register`);
        tryRegister();
      } else {
        // Reset so a reconnect always re-emits `register`.
        lastRegisteredComboRef.current = null;
        // console.log(
        //   `${DEBUG_PREFIX} Socket disconnected -> reset register state`,
        // );
      }
    });

    // Sync current connection state (in case already connected before subscribe).
    socketConnectedRef.current = socketManager.isConnected();
    tryRegister();

    return () => {
      // console.log(`${DEBUG_PREFIX} useEffect[socket] cleanup`);
      unsubscribe();
      mountedRef.current = false;
    };
  }, [tryRegister]);

  // OneSignal push subscription changes -> register.
  useEffect(() => {
    // console.log(`${DEBUG_PREFIX} useEffect[onesignal] running`);
    const unsubscribe = oneSignalService.onSubscriptionChange(playerId => {
      playerIdRef.current = playerId;

      if (playerId) {
        // console.log(`${DEBUG_PREFIX} Player id available -> attempt register`);
      } else {
        // console.log(`${DEBUG_PREFIX} Player id null (permission denied)`);
      }

      tryRegister();
    });

    playerIdRef.current = oneSignalService.getPlayerId();
    tryRegister();

    return () => {
      // console.log(`${DEBUG_PREFIX} useEffect[onesignal] cleanup`);
      unsubscribe();
    };
  }, [tryRegister]);

  // Authentication / astrologer changes -> register or lockout.
  useEffect(() => {
    // console.log(`${DEBUG_PREFIX} useEffect[auth] running`, {
    //   isAuthenticated,
    //   astrologerId,
    // });
    if (!isAuthenticated) {
      // Logout: prevent future register emits until next login.
      lastRegisteredComboRef.current = null;
      // console.log(
      //   `${DEBUG_PREFIX} Not authenticated -> lock register until login`,
      // );
      return;
    }

    // console.log(`${DEBUG_PREFIX} Auth state changed`, {astrologerId});
    tryRegister();
  }, [isAuthenticated, astrologerId, tryRegister]);

  // AppState changes -> emit `app_state` while connected.
  useEffect(() => {
    // console.log(`${DEBUG_PREFIX} useEffect[appstate] running`);
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (socketManager.isConnected()) {
          // console.log(`[AppState] Emitting "${APP_STATE_EVENT}"`, {
          //   state: nextState,
          // });
          socketManager.emit(APP_STATE_EVENT, {state: nextState});
        }
      },
    );

    return () => {
      // console.log(`${DEBUG_PREFIX} useEffect[appstate] cleanup`);
      subscription.remove();
    };
  }, []);
};

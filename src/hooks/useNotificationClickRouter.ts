import {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import {socketManager} from '../services/socket/socketManager';
import {oneSignalService} from '../services/onesignal/oneSignalService';
import {store, RootState} from '../store';
import {handleRequestNotification} from './notificationRequestHandler';
import {usePendingCallFromNative} from './usePendingCallFromNative';

// const DEBUG_PREFIX = '[NotificationClickRouter]';

export const useNotificationClickRouter = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const tokenRef = useRef<string | null>(token);
  tokenRef.current = token;

  useEffect(() => {
    // console.log(`${DEBUG_PREFIX} Setting up notification click listener`);

    const connectIfNeeded = () => {
      if (!socketManager.isConnected()) {
        // console.log(`${DEBUG_PREFIX} Socket not connected, connecting now`);
        socketManager.connect();
      } else {
        // console.log(`${DEBUG_PREFIX} Socket already connected`);
      }
    };

    const unsubscribe = oneSignalService.onNotificationClick(event => {
      // console.log(`${DEBUG_PREFIX} Notification clicked`);

      // console.log('[TRACE 1] notification.additionalData');
      // console.log(JSON.stringify(event?.notification?.additionalData, null, 2));

      const additionalData = (event?.notification?.additionalData ??
        {}) as Record<string, any>;

      // Drive the incoming chat/call UI immediately from the notification
      // payload. This is the source of truth - we do NOT wait for the missed
      // socket event (Socket.IO does not replay it). The socket reconnects
      // in parallel below; later cancel/timeout events keep the UI in sync.
      const driveUI = () => {
        handleRequestNotification(additionalData);
        connectIfNeeded();
      };

      // Auth may not be hydrated yet (app launched from a killed/background
      // state by tapping the push). Connecting before the token is restored
      // yields a tokenless socket ("Token missing"). Wait for hydration.
      if (!tokenRef.current) {
        // console.log(
        //   `${DEBUG_PREFIX} Auth not hydrated yet - waiting for token before connecting`,
        // );
        const unsubscribeStore = store.subscribe(() => {
          const hydratedToken = (store.getState() as RootState).auth.token;
          if (hydratedToken) {
            unsubscribeStore();
            // console.log(
            //   `${DEBUG_PREFIX} Auth hydrated - connecting socket + driving UI`,
            // );
            driveUI();
          }
        });
        return;
      }

      driveUI();
    });

    return () => {
      // console.log(`${DEBUG_PREFIX} Cleaning up notification click listener`);
      unsubscribe();
    };
  }, []);

  usePendingCallFromNative();
};

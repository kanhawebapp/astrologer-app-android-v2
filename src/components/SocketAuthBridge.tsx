// import React, { useEffect, useRef } from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '../store';
// import { connectSocket, socketManager } from '../services/socket/socketManager';
// import chatSocketService from '../features/chat/data/chatSocketService';
// import callSocketService from '../features/call/data/callSocketService';


// /**
//  * Bridges auth/token availability to socket connection.
//  *
//  * Rationale:
//  * - `AppContent` currently calls `connectSocket()` only on initial mount.
//  * - OTP verification stores token in AsyncStorage and updates Redux.
//  * - If the initial socket attempt happened before token existed, the socket never connects.
//  */


// export const SocketAuthBridge: React.FC = () => {
//   const token = useSelector((state: RootState) => state.auth.token);

//   // We need to ignore the *initial* token restore (startup) and only react to
//   // a genuine token transition caused by a fresh login (OTP).
//   //
//   // Strategy:
//   // - Skip the first time we observe a non-null token (startup restore).
//   // - Thereafter, reconnect on real transitions into a non-null token.
//   const hasSkippedInitialRestoreRef = useRef(false);
//   const prevTokenRef = useRef<string | null>(null);



//   useEffect(() => {
//     console.log("STEP 1 - useEffect");

//     const prevToken = prevTokenRef.current;

//     console.log("STEP 2", {
//       token: !!token,
//       prevToken: !!prevToken,
//       skipped: hasSkippedInitialRestoreRef.current,
//     });

//     if (!token) {
//       console.log("STEP 3 - no token");
//       prevTokenRef.current = token;
//       return;
//     }

//     if (!hasSkippedInitialRestoreRef.current) {
//       console.log("STEP 4 - first token, skipping");
//       hasSkippedInitialRestoreRef.current = true;
//       prevTokenRef.current = token;
//       return;
//     }

//     if (prevToken && prevToken === token) {
//       console.log("STEP 5 - same token");
//       prevTokenRef.current = token;
//       return;
//     }

//     console.log("STEP 6 - reconnect");

//     prevTokenRef.current = token;
//   }, [token]);




//   // Temporary logging to verify auth->socket ordering during OTP login.
//   console.log(
//     '[SocketAuthBridge] token changed',
//     token ? `${token.substring(0, 10)}...` : 'null',
//   );

//   useEffect(() => {
//     const prevToken = prevTokenRef.current;

//     // Update prev token at the end of this effect.
//     // (So the comparisons are based on last render.)

//     // Only act when we *enter* a truthy token state.
//     if (!token) {
//       prevTokenRef.current = token;
//       return;
//     }

//     // Detect startup restore: first time token becomes non-null.
//     if (!hasSkippedInitialRestoreRef.current) {
//       hasSkippedInitialRestoreRef.current = true;
//       prevTokenRef.current = token;
//       return; // ignore initial restore
//     }

//     // Avoid reconnecting if token didn't actually change.
//     if (prevToken && prevToken === token) {
//       prevTokenRef.current = token;
//       return;
//     }

//     // Ensure socket is connected with the latest token.
//     // Prefer `reconnect(token)` so we don't duplicate listeners unnecessarily.\
//     console.log(
//       '🔥 [SocketAuthBridge] Calling socketManager.reconnect()',
//     );
//     socketManager.reconnect(token).catch(async () => {
//       // Fallback: in case reconnect fails for any reason, try connectSocket.
//       console.log(
//         '🔥 [SocketAuthBridge] reconnect failed, trying connectSocket()',
//       );
//       await connectSocket().catch(() => undefined);
//     });

//     const reconnectSocket = async () => {
//       try {
//         console.log(
//           '🔥 [SocketAuthBridge] Calling socketManager.reconnect()',
//         );

//         await socketManager.reconnect(token);
//         await chatSocketService.setupListeners();

//         await callSocketService.setupListeners();

//         console.log(
//           '✅ Chat & Call listeners reattached',
//         );

//         console.log(
//           '✅ [SocketAuthBridge] Socket reconnected',
//         );
//       } catch (e) {
//         console.log(
//           '🔥 [SocketAuthBridge] reconnect failed, trying connectSocket()',
//         );

//         await connectSocket().catch(() => undefined);
//       }
//     };

//     reconnectSocket();

//     prevTokenRef.current = token;
//   }, [token]);

//   return null;
// };


import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { connectSocket, socketManager } from '../services/socket/socketManager';
import chatSocketService from '../features/chat/data/chatSocketService';
import callSocketService from '../features/call/data/callSocketService';

export const SocketAuthBridge: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const prevTokenRef = useRef<string | null>(null);

  // console.log(
  //   '[SocketAuthBridge] token:',
  //   token ? token.substring(0, 10) + '...' : 'null',
  // );

  useEffect(() => {
    const reconnect = async () => {
      try {
        // console.log('==========================');
        // console.log('[SocketAuthBridge]');
        // console.log('Previous Token:', !!prevTokenRef.current);
        // console.log('Current Token :', !!token);
        // console.log('==========================');

        // logout
        if (!token) {
          prevTokenRef.current = null;
          return;
        }

        // first login OR token changed
        if (prevTokenRef.current !== token) {
          // console.log('🔥 Token changed -> reconnect socket');

          prevTokenRef.current = token;

          await socketManager.reconnect(token);

          // console.log('✅ Socket Connected');

          await chatSocketService.setupListeners();
          // console.log('✅ Chat listeners attached');

          await callSocketService.setupListeners();
          // console.log('✅ Call listeners attached');
        }
      } catch (err) {
        // console.log(
        //   '❌ reconnect failed, trying connectSocket()',
        //   err,
        // );

        try {
          await connectSocket();

          await chatSocketService.setupListeners();
          await callSocketService.setupListeners();
        } catch (e) {
          // console.log('❌ connectSocket also failed', e);
        }
      }
    };

    reconnect();
  }, [token]);

  return null;
};


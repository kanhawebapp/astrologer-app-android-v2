import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, store, RootState } from '../store';
import {
  addChatRequest,
  removeChatRequest,
  setActiveSession,
  setTypingInfo,
  endChatSession,
  setError,
  setChatStatus,
  // hardResetChatFlow,
  setLatestRequest,
  clearAllChatData,
} from '../store/slices/chatSlice';
import { chatSocketService } from '../features/chat/data/chatSocketService';
import type {
  ChatRequest,
  ActiveChatSession,
  ChatMessage,
  TypingInfo,
} from '../features/chat/domain/chatTypes';
import { hardResetChatFlow } from '../features/chat/data/chatSlice';

const DEBUG_PREFIX = '[useGlobalChatSocket]';

export const useGlobalChatSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isMounted = useRef(true);
  // Auth token gate: only set up chat socket listeners once a valid token
  // exists (post auth hydration). Connecting before the token is restored
  // creates a tokenless/stale socket ("Token missing"). SocketAuthBridge
  // reconnects with the token after hydration and re-runs setupListeners.
  const token = useSelector((state: RootState) => state.auth.token);
  // token-aware singleton guard (prevents multiple socket listener setups)
  // STRICT: listeners must be registered exactly once for the app lifecycle.
  const socketInitializedRef = useRef<{ initialized: boolean }>({
    initialized: false,
  });
  console.log("SETTING CHAT LISTENERS");

  const latestNewChatRequestSessionIdRef = useRef<string | null>(null);

  // Always use the latest callbacks without re-registering socket listeners.
  const latestCallbacksRef = useRef({
    onNewChatRequest: null as any,
    onChatStarted: null as any,
    onReceiveMessage: null as any,
    onCompletedChat: null as any,
    onLeaveChat: null as any,
    onChatRejectAuto: null as any,
    onChatCancelByUser: null as any,
  });

  // const handleNewChatRequest = useCallback(
  //   (data: ChatRequest | ChatRequest[]) => {
  //     console.log(`📥 ${DEBUG_PREFIX} Received: "new_chat_request"`);

  //     let request: ChatRequest | null = null;

  //     if (Array.isArray(data)) {
  //       console.log(`   Payload is array with ${data.length} items`);
  //       request = data[0] || null;
  //     } else {
  //       request = data;
  //     }

  //     if (!request) {
  //       console.log(`${DEBUG_PREFIX} Empty payload, ignoring`);
  //       return;
  //     }

  //     console.log(`   Room ID: ${request.roomId}`);
  //     console.log(`   Maximum Time: ${request.maximumTime} min`);
  //     console.log(`   User: ${request.userName}`);
  //     console.log(`   Session ID: ${request.sessionId}`);

  //     if (!request.roomId) {
  //       console.log(`${DEBUG_PREFIX} Missing roomId, ignoring request`);
  //       return;
  //     }

  //     const sessionId = request.sessionId;
  //     if (!sessionId) {
  //       console.log(`${DEBUG_PREFIX} Missing sessionId, ignoring request`);
  //       return;
  //     }

  //     // Safety guard: ignore if same sessionId already exists (prevents popup flapping)
  //     const state = (store as any).getState?.() as any;
  //     const existingRequest = state?.chat?.chatRequests?.find(
  //       (r: any) => r?.sessionId === sessionId,
  //     );
  //     if (existingRequest?.sessionId === sessionId) {
  //       console.log(
  //         `${DEBUG_PREFIX} Ignoring new_chat_request: same sessionId already exists: ${sessionId}`,
  //       );
  //       return;
  //     }

  //     // IMPORTANT ordering:
  //     // validate -> set REQUEST -> set latestRequest
  //     if (latestNewChatRequestSessionIdRef.current === sessionId) {
  //       console.log(
  //         `${DEBUG_PREFIX} Ignoring new_chat_request: same sessionId already processed: ${sessionId}`,
  //       );
  //       return;
  //     }

  //     latestNewChatRequestSessionIdRef.current = sessionId;

  //     dispatch(setChatStatus('REQUEST'));
  //     dispatch(setLatestRequest(request));
  //     dispatch(addChatRequest(request));

  //     console.log(`✅ ${DEBUG_PREFIX} Request processed (REQUEST + latestRequest)`);
  //   },
  //   [dispatch],
  // );

  //   const handleNewChatRequest = useCallback(
  //   (data: ChatRequest | ChatRequest[]) => {
  //     console.log(`📥 ${DEBUG_PREFIX} Received: "new_chat_request"`);

  //     let request: ChatRequest | null = null;

  //     if (Array.isArray(data)) {
  //       console.log(`   Payload is array with ${data.length} items`);
  //       request = data[0] || null;
  //     } else {
  //       request = data;
  //     }
  //     console.log("whole request data ===---==-=-==-",request)
  //     if (!request) {
  //       console.log(`${DEBUG_PREFIX} Empty payload, ignoring`);
  //       return;
  //     }

  //     console.log(`   Room ID: ${request.roomId}`);
  //     console.log(`   Maximum Time: ${request.maximumTime} min`);
  //     console.log(`   User: ${request.userName}`);
  //     console.log(`   Session ID: ${request.sessionId}`);

  //     if (!request.roomId) {
  //       console.log(`${DEBUG_PREFIX} Missing roomId, ignoring request`);
  //       return;
  //     }

  //     const sessionId = request.sessionId;
  //     if (!sessionId) {
  //       console.log(`${DEBUG_PREFIX} Missing sessionId, ignoring request`);
  //       return;
  //     }

  //     const state = (store as any).getState?.() as any;

  //     // ✅ Logged in astrologer id
  //     const loggedInAstrologerId = state?.auth?.user?.id;

  //     // ✅ Astrologer id received in socket event
  //     const requestAstrologerId = request?.astrologerId; // <-- replace if backend field name is different

  //     console.log('==============================');
  //     console.log('Logged In Astrologer :', loggedInAstrologerId);
  //     console.log('Request Astrologer   :', requestAstrologerId);
  //     console.log('==============================');

  //     // ✅ Ignore if request belongs to another astrologer
  //     if (
  //       requestAstrologerId &&
  //       loggedInAstrologerId &&
  //       requestAstrologerId !== loggedInAstrologerId
  //     ) {
  //       console.log(
  //         `${DEBUG_PREFIX} Ignoring request. Astrologer mismatch.`,
  //       );
  //       return;
  //     }

  //     // Safety guard: ignore if same sessionId already exists
  //     const existingRequest = state?.chat?.chatRequests?.find(
  //       (r: any) => r?.sessionId === sessionId,
  //     );

  //     if (existingRequest?.sessionId === sessionId) {
  //       console.log(
  //         `${DEBUG_PREFIX} Ignoring new_chat_request: same sessionId already exists: ${sessionId}`,
  //       );
  //       return;
  //     }

  //     // Ignore already processed session
  //     if (latestNewChatRequestSessionIdRef.current === sessionId) {
  //       console.log(
  //         `${DEBUG_PREFIX} Ignoring new_chat_request: same sessionId already processed: ${sessionId}`,
  //       );
  //       return;
  //     }

  //     latestNewChatRequestSessionIdRef.current = sessionId;

  //     dispatch(setChatStatus('REQUEST'));
  //     dispatch(setLatestRequest(request));
  //     dispatch(addChatRequest(request));

  //     console.log(
  //       `✅ ${DEBUG_PREFIX} Request processed (REQUEST + latestRequest)`,
  //     );
  //   },
  //   [dispatch],
  // );

  const handleNewChatRequest = useCallback(
    (data: ChatRequest | ChatRequest[]) => {
      let request: ChatRequest | null = Array.isArray(data)
        ? data[0] || null
        : data;

      if (!request) {
        console.log(`${DEBUG_PREFIX} Empty chat request received`);
        return;
      }

      const {
        roomId,
        sessionId,
        userId,
        astrologerId,
      } = request;

      // Validate required fields
      if (!roomId || !sessionId || !userId || !astrologerId) {
        console.log(
          `${DEBUG_PREFIX} Invalid chat request payload. Ignoring.`,
        );
        return;
      }

      const state = (store as any).getState?.() as any;

      const loggedInAstrologerId = state?.auth?.user?.id;

      // Ignore if request belongs to another astrologer
      if (!loggedInAstrologerId || loggedInAstrologerId !== astrologerId) {
        return;
      }

      // Prevent duplicate request already in Redux
      const existingRequest = state?.chat?.chatRequests?.find(
        (r: any) => r?.sessionId === sessionId,
      );

      if (existingRequest) {
        return;
      }

      // Prevent duplicate processing
      if (latestNewChatRequestSessionIdRef.current === sessionId) {
        return;
      }

      latestNewChatRequestSessionIdRef.current = sessionId;

      dispatch(setChatStatus('REQUEST'));
      dispatch(setLatestRequest(request));
      dispatch(addChatRequest(request));

      console.log(
        `${DEBUG_PREFIX} Chat request accepted for astrologer ${loggedInAstrologerId}`,
      );
    },
    [dispatch],
  );


  const handleChatStarted = useCallback(
    (data: ActiveChatSession) => {
      console.log(`📥 ${DEBUG_PREFIX} Received: "chat_started_astrologer"`);
      console.log(`   Room ID: ${data.roomId}`);
      console.log(`   User: ${data.userName}`);

      if (isMounted.current) {
        dispatch(setActiveSession(data));
        console.log(`${DEBUG_PREFIX} Active session set in Redux`);
      }
    },
    [dispatch],
  );

  const handleReceiveMessage = useCallback((data: ChatMessage) => {
    console.log(`📥 ${DEBUG_PREFIX} Received: "receive_message"`);
    console.log(`   Message: ${data.text?.substring(0, 50)}...`);
  }, []);

  // const handleCompletedChat = useCallback(
  //   (data: { sessionId: string; roomId: string }) => {
  //     console.log(`📥 ${DEBUG_PREFIX} Received: "completed_chat"`);
  //     if (isMounted.current) {
  //       // FULL CLEAN STATE
  //       // Also clear the ref used to ignore duplicate requests, otherwise next session can be ignored forever.
  //       latestNewChatRequestSessionIdRef.current = null;
  //       dispatch(hardResetChatFlow());
  //     }
  //   },
  //   [dispatch],
  // );

const handleCompletedChat = useCallback(
  (data: { sessionId: string; roomId: string }) => {
    console.log(`${DEBUG_PREFIX} completed_chat`, data);

    if (!isMounted.current) {
      return;
    }

    latestNewChatRequestSessionIdRef.current = null;

    chatSocketService.clearRoomSessionMap();

    dispatch(removeChatRequest(data.sessionId));

    dispatch(hardResetChatFlow());

    dispatch(setChatStatus('IDLE'));

    dispatch(setError(null));
  },
  [dispatch],
);

  const handleLeaveChat = useCallback(
    (data: { sessionId: string; roomId: string; reason: string }) => {
      console.log(`📥 ${DEBUG_PREFIX} Received: "leave_chat"`);
      console.log(`   Reason: ${data.reason}`);
      if (isMounted.current) {
        // Align with manual End Chat behavior:
        // set Redux to ENDED so ChatViewModel's existing navigation effect runs.
        latestNewChatRequestSessionIdRef.current = null;
        dispatch(endChatSession());
        dispatch(setError(data.reason || 'User left the chat'));
      }
    },
    [dispatch],
  );


  const handleChatRejectAuto = useCallback(
    (data: { sessionId: string; roomId: string; reason: string }) => {
      console.log(`📥 ${DEBUG_PREFIX} Received: "chat_reject_auto"`);
      console.log(`   Reason: ${data.reason}`);
      if (isMounted.current) {
        dispatch(removeChatRequest(data.sessionId));
        dispatch(setError(data.reason || 'Chat request auto-rejected'));
      }
    },
    [dispatch],
  );

  // const handleChatCancelByUser = useCallback(

  //   (data: {
  //     room_id: string | null;
  //     session_id: string | null;
  //     status: string;
  //     message: string;
  //   }) => {
  //     console.log(`📥 ${DEBUG_PREFIX} Received: "chat_cancel_by_user"`);
  //     console.log(`   Room ID: ${data.room_id}`);
  //     console.log(`   Session ID: ${data.session_id}`);
  //     console.log(`   Message: ${data.message}`);

  //     if (isMounted.current) {
  //       console.log(`${DEBUG_PREFIX} Ending chat session...`);
  //       latestNewChatRequestSessionIdRef.current = null;
  //       dispatch(hardResetChatFlow());
  //       chatSocketService.clearRoomSessionMap();

  //       dispatch(clearAllChatData());

  //       setTimeout(() => {
  //         const state = store.getState();
  //         console.log('CHAT STATE AFTER RESET:', state.chat);
  //       }, 100);

  //       dispatch(setChatStatus('IDLE'));
  //       dispatch(setError(data.message || 'User has cancelled the chat'));
  //       console.log(
  //         `✅ ${DEBUG_PREFIX} Chat session ended, status set to ENDED`,
  //       );

  //     }
  //   },
  //   [dispatch],
  // );

  const handleChatCancelByUser = useCallback(
  (data: {
    room_id: string | null;
    session_id: string | null;
    status: string;
    message: string;
  }) => {
    console.log(`${DEBUG_PREFIX} chat_cancel_by_user`, data);

    if (!isMounted.current) {
      return;
    }

    latestNewChatRequestSessionIdRef.current = null;

    chatSocketService.clearRoomSessionMap();

    if (data.session_id) {
      dispatch(removeChatRequest(data.session_id));
    }

    dispatch(hardResetChatFlow());

    dispatch(setChatStatus('IDLE'));

    dispatch(setError(null));
  },
  [dispatch],
);
  
  useEffect(() => {
    isMounted.current = true;
    console.log(`${DEBUG_PREFIX} Hook initialized / effect run`);

    // Auth gate: defer listener setup until the token is restored.
    if (!token) {
      console.log(
        `${DEBUG_PREFIX} Auth token not available yet - deferring chat socket listener setup until hydration`,
      );
      return;
    }

    // Token-aware guard:

    // If the token changes or listeners were never initialized, allow setup.
    // Otherwise, skip to avoid duplicated socket listeners.
    if (socketInitializedRef.current.initialized) {
      console.log(
        `${DEBUG_PREFIX} Chat socket listeners already initialized for app lifecycle, skipping`,
      );
      return;
    }

    socketInitializedRef.current.initialized = true;

    console.log(
      `${DEBUG_PREFIX} Initializing global chat socket listeners... (once)`,
    );

    // Bind latest callbacks for safety, but do NOT re-setup socket listeners.
    latestCallbacksRef.current = {
      onNewChatRequest: handleNewChatRequest,
      onChatStarted: handleChatStarted,
      onReceiveMessage: handleReceiveMessage,
      onCompletedChat: handleCompletedChat,
      onLeaveChat: handleLeaveChat,
      onChatRejectAuto: handleChatRejectAuto,
      onChatCancelByUser: handleChatCancelByUser,
    };

    chatSocketService.setCallbacks({
      onNewChatRequest: ((...args: any[]) =>
        latestCallbacksRef.current.onNewChatRequest(...args)) as any,
      onChatStarted: ((...args: any[]) =>
        latestCallbacksRef.current.onChatStarted(...args)) as any,
      onReceiveMessage: ((...args: any[]) =>
        latestCallbacksRef.current.onReceiveMessage(...args)) as any,
      onCompletedChat: ((...args: any[]) =>
        latestCallbacksRef.current.onCompletedChat(...args)) as any,
      onLeaveChat: ((...args: any[]) =>
        latestCallbacksRef.current.onLeaveChat(...args)) as any,
      onChatRejectAuto: ((...args: any[]) =>
        latestCallbacksRef.current.onChatRejectAuto(...args)) as any,
      onChatCancelByUser: ((...args: any[]) =>
        latestCallbacksRef.current.onChatCancelByUser(...args)) as any,
    });

    chatSocketService
      .setupListeners()
      .then(() => {
        console.log(`${DEBUG_PREFIX} Socket listeners setup complete`);
      })
      .catch(error => {
        console.log(`${DEBUG_PREFIX} Failed to setup listeners:`, error);
      });

    return () => {
      isMounted.current = false;
      console.log(`${DEBUG_PREFIX} Cleanup called`);
      // Do not tear down socket listeners here; ChatSocketService is a singleton.
      // Just clear local mounted state to prevent dispatching from stale callbacks.
    };
  }, [
    token,
    handleNewChatRequest,
    handleChatStarted,
    handleReceiveMessage,
    handleCompletedChat,
    handleLeaveChat,
    handleChatRejectAuto,
    handleChatCancelByUser,
  ]);

  // avoid per-render noise
};

export default useGlobalChatSocket;

import AsyncStorage from '@react-native-async-storage/async-storage';
import { socketClient } from './socketClient';
import { Config } from '../../config/env';
import { AuthEvents } from './socketEvents';
import type { EmitOptions, EventCallback } from './socketTypes';
import { ringtoneManager } from '../call/ringtoneManager';

const DEBUG_PREFIX = '[SocketManager]';

let currentAuthToken: string | null = null;
let connectionChangeCallbacks: Array<(connected: boolean) => void> = [];
let errorCallbacks: Array<(error: Error) => void> = [];
let isConnecting: boolean = false;

// Tracks completion of the OneSignalSocket `register` emit so notification
// flows can wait until the socket is fully registered (not just connected)
// before emitting their first business event.
let registerEmitted: boolean = false;
let registerWaiters: Array<() => void> = [];

const connectSocket = async (authToken?: string): Promise<void> => {
  if (isConnecting) {
    // console.log(`⏳ ${DEBUG_PREFIX} Already connecting, skipping...`);
    return;
  }

  if (socketClient.isConnected()) {
    // console.log(`⚡ ${DEBUG_PREFIX} Socket already connected, skipping...`);
    return;
  }

  isConnecting = true;
  // console.log(`🔄 ${DEBUG_PREFIX} Socket connect requested`);

  try {
    let token = authToken || currentAuthToken;
    // console.log(`[SOCKET] Token from param or currentAuthToken: ${token ? 'YES' : 'NO/UNDEFINED'}`);
    if (token) {
      // console.log(`[SOCKET] Token Preview: ${token.substring(0, 20)}...`);
    }

    if (!token) {
      try {
        token = await AsyncStorage.getItem(Config.TOKEN_KEY);
        // console.log(`[SOCKET] Token retrieved from storage: ${token ? 'YES' : 'NO'}`);
        if (token) {
          // console.log(`[SOCKET] Token Preview: ${token.substring(0, 20)}...`);
        }
      } catch {
        // Failed to read the token from storage; fall through and try to
        // connect without it (connectSocket defers if no token is available).
      }
    }

    currentAuthToken = token || null;

    // GATE: never connect without a valid access token.
    // Auth hydration (restoreSession / verifyOtp) supplies the token via
    // SocketAuthBridge.reconnect(token). Connecting earlier (e.g. at app
    // mount or on a raw notification click) produces a tokenless / stale-token
    // socket and the server "Authentication error: Token missing".
    if (!currentAuthToken) {
      // console.log(
      //   `⚠️ ${DEBUG_PREFIX} No auth token available - socket connection deferred until token is restored`,
      // );
      isConnecting = false;
      return;
    }

    if (token) {
      // console.log(`${DEBUG_PREFIX} Token loaded (length: ${token.length})`);
      // console.log(
      //   `${DEBUG_PREFIX} Token preview: ${token.substring(0, 20)}...`,
      // );
      socketClient.setToken(token);
    } else {
      // console.log(
      //   `⚠️ ${DEBUG_PREFIX} No token available - will try without token`,
      // );
      // console.log(`[SOCKET] Auth object sent to socket contains token: NO`);
      socketClient.setToken(null);
    }

    const socket = await socketClient.getSocket();

    // console.log(
    //   `[SOCKET_OWNER] connect proceeding — instanceId=${socketClient.getInstanceId()} ` +
    //     `socketId=${socket.id ?? 'null'} connected=${socket.connected} ` +
    //     `transport=${socket.io.engine?.transport?.name ?? 'null'}`,
    // );
    const setupListeners = () => {
      // console.log(`${DEBUG_PREFIX} Registering listeners...`);

      socket.on('connect', () => {
        // console.log(`✅ ${DEBUG_PREFIX} Socket Connected - ID: ${socket.id}`);
        // console.log(`   Connection Status: CONNECTED`);
        // console.log(`   Transport: ${socket.io.engine?.transport?.name}`);
        connectionChangeCallbacks.forEach(cb => cb(true));
      });

      //  GLOBAL DEBUG LISTENER (VERY IMPORTANT)
      socket.onAny((eventName: string, ...args: any[]) => {
        // console.log(`🧠 [GLOBAL SOCKET EVENT] → ${eventName}`);
        // console.log(`📦 DATA:`, JSON.stringify(args?.[0], null, 2));
      });

      socket.on('disconnect', (reason: string) => {
        // console.log(
        //   `⚠️ ${DEBUG_PREFIX} Socket Disconnected - Reason: ${reason}`,
        // );
        // console.log(`   Connection Status: DISCONNECTED`);
        // Stop ringtone if socket disconnects while ringing
        if (ringtoneManager.isRingtonePlaying()) {
          // console.log(`${DEBUG_PREFIX} Socket disconnected during ringing - stopping ringtone`);
          ringtoneManager.stopRingtone();
        }
        // A disconnect invalidates any prior `register`; a reconnect must
        // re-emit it before notification flows consider the socket ready.
        registerEmitted = false;
        connectionChangeCallbacks.forEach(cb => cb(false));
      });

      socket.on('connect_error', (error: Error) => {
        // console.log(
        //   `❌ ${DEBUG_PREFIX} Socket Connect Error: ${error.message}`,
        // );
        errorCallbacks.forEach(cb => cb(error));
      });

      socket.on(AuthEvents.AUTH_REQUIRED, () => {
        // console.log(
        //   `${DEBUG_PREFIX} Auth Required event - sending token via authenticate`,
        // );
        if (currentAuthToken) {
          socket.emit('authenticate', { token: currentAuthToken });
          // console.log(
          //   `${DEBUG_PREFIX} Token emitted (preview: ${currentAuthToken.substring(
          //     0,
          //     10,
          //   )}...)`,
          // );
        }
      });

      socket.on(AuthEvents.AUTH_SUCCESS, (data: unknown) => {
        // console.log(`${DEBUG_PREFIX} Auth Success:`, data);
      });

      socket.on(AuthEvents.AUTH_FAILED, (error: unknown) => {
        // console.log(`${DEBUG_PREFIX} Auth Failed:`, error);
      });

      socket.on('reconnect_attempt', (attemptNumber: number) => {
        // console.log(
        //   `${DEBUG_PREFIX} Reconnecting... Attempt: ${attemptNumber}`,
        // );
      });

      socket.on('reconnect', (attemptNumber: number) => {
        // console.log(
        //   `${DEBUG_PREFIX} Socket Reconnected after ${attemptNumber} attempts`,
        // );
      });

      socket.io.on('reconnect_failed', () => {
        // console.log(`❌ ${DEBUG_PREFIX} Reconnect failed after max attempts`);
      });

      // console.log(`${DEBUG_PREFIX} All listeners registered successfully`);
    };

    // socketClient.setupSocketEvents() already registers its own `connect`
    // listener, so `socket.hasListeners('connect')` is always true here. The
    // previous guard therefore skipped socketManager's connection-change
    // notifier (which drives `onConnectionChange` subscribers). Use a
    // per-socket marker so the notifier is attached exactly once per socket
    // instance and is re-attached after a reconnect creates a new socket.
    const SM_NOTIFIER_KEY = '__smConnectionNotifier';
    const socketWithMarker = socket as unknown as Record<string, boolean>;
    if (!socketWithMarker[SM_NOTIFIER_KEY]) {
      socketWithMarker[SM_NOTIFIER_KEY] = true;
      // console.log(`${DEBUG_PREFIX} No notifier on this socket, setting up...`);
      setupListeners();
    } else {
      // console.log(
      //   `${DEBUG_PREFIX} Notifier already attached to this socket, skipping setup`,
      // );
    }

    if (!socket.connected) {
      socket.connect();
    }
  } catch (error) {
    // console.log(`❌ ${DEBUG_PREFIX} Socket Connect Error:`, error);
    // console.log(`[SOCKET] Connect Error`);
    isConnecting = false;
    throw error;
  }

  // console.log(`[SOCKET] Socket Connection Attempt Complete`);
  setTimeout(() => {
    isConnecting = false;
  }, 5000);
};

const waitUntilConnected = (): Promise<void> => {
  return new Promise((resolve) => {
    if (socketClient.isConnected()) {
      resolve();
      return;
    }

    const unsubscribe = onConnectionChange((connected) => {
      if (connected) {
        unsubscribe();
        resolve();
      }
    });
  });
};

const disconnectSocket = async (): Promise<void> => {
  // A disconnect must clear the connecting guard so a follow-up connect/reconnect
  // is never silently skipped (which previously left the app with no socket
  // and no recovery path).
  isConnecting = false;
  // console.log(
  //   `[SOCKET_OWNER] disconnect called — instanceId=${socketClient.getInstanceId()} ` +
  //     `stack:\n${new Error().stack}`,
  // );
  socketClient.disconnectSocket();
  currentAuthToken = null;
  // console.log(`❌ ${DEBUG_PREFIX} Socket manually disconnected`);
  connectionChangeCallbacks.forEach(cb => cb(false));
};

const setAuthToken = (token: string): void => {
  currentAuthToken = token;
  // console.log(`${DEBUG_PREFIX} Auth token updated`);
  // console.log(`   Token preview: ${token.substring(0, 10)}...`);
};

const getAuthToken = (): string | null => {
  return currentAuthToken;
};

const isConnected = (): boolean => {
  return socketClient.isConnected();
};

const emit = async <T = unknown>(
  event: string,
  data?: T,
  _options?: EmitOptions,
): Promise<void> => {
  const socket = await socketClient.getSocket();
  const isSocketConnected = socket.connected;
  const timestamp = new Date().toISOString();

  // console.log(
  //   `📤 ${DEBUG_PREFIX} [SOCKET FLOW TRACE] EMIT: "${event}" [${timestamp}]`,
  // );
  // console.log(
  //   `   [SOCKET_OWNER] instanceId=${socketClient.getInstanceId()} ` +
  //     `socketId=${socket.id ?? 'null'} connected=${isSocketConnected} ` +
  //     `transport=${socket.io.engine?.transport?.name ?? 'null'}`,
  // );
  // console.log(`   🔍 Data:`, JSON.stringify(data, null, 2));
  // console.log(`   🔍 Data keys:`, data ? Object.keys(data as object) : 'none');
  // console.log(
  //   `   🔍 Connection Status: ${
  //     isSocketConnected ? 'CONNECTED ✅' : 'NOT CONNECTED ❌'
  //   }`,
  // );

  if (!isSocketConnected) {
    // console.warn(
    //   `⚠️ ${DEBUG_PREFIX} WARNING: Emitting on disconnected socket! Event: "${event}"`,
    // );
    // console.warn(
    //   `   ⚠️ ${DEBUG_PREFIX} EMIT WILL BE SKIPPED - no data sent to server`,
    // );
    return;
  }

  // console.log('i am here');
  // Important: emit() must NOT register new listeners.
  // Listener registration belongs only in dedicated socket lifecycle/setup code.

  socket.emit(event, data);
  // console.log(`✅ ${DEBUG_PREFIX} Emitted successfully: "${event}"`);
  // console.log(`   [EMIT COMPLETE] "${event}"`);
};

const emitWithAck = async <T = unknown, R = unknown>(
  event: string,
  data?: T,
  timeout?: number,
): Promise<R> => {
  const socket = await socketClient.getSocket();
  const isSocketConnected = socket.connected;
  const timestamp = new Date().toISOString();

  // console.log(
  //   `📤 ${DEBUG_PREFIX} [SOCKET FLOW TRACE] EMIT WITH ACK: "${event}" [${timestamp}]`,
  // );
  // console.log(
  //   `   [SOCKET_OWNER] instanceId=${socketClient.getInstanceId()} ` +
  //     `socketId=${socket.id ?? 'null'} connected=${isSocketConnected} ` +
  //     `transport=${socket.io.engine?.transport?.name ?? 'null'}`,
  // );
  // console.log(`   🔍 Data:`, JSON.stringify(data, null, 2));
  // console.log(`   🔍 Data keys:`, data ? Object.keys(data as object) : 'none');
  // console.log(`   Timeout: ${timeout ? timeout + 'ms' : 'default'}`);
  // console.log(
  //   `   🔍 Connection Status: ${
  //     isSocketConnected ? 'CONNECTED ✅' : 'NOT CONNECTED ❌'
  //   }`,
  // );

  if (!isSocketConnected) {
    // console.warn(
    //   `⚠️ ${DEBUG_PREFIX} WARNING: Emitting on disconnected socket! Event: "${event}"`,
    // );
    throw new Error(
      `${DEBUG_PREFIX} Socket not connected, cannot emit: ${event}`,
    );
  }

  return new Promise((resolve, reject) => {
    const ack = (response: R) => {
      // console.log(
      //   `📥 ${DEBUG_PREFIX} [ACK RECEIVED] for "${event}":`,
      //   JSON.stringify(response, null, 2),
      // );
      resolve(response);
    };

    if (timeout) {
      socket.emit(event, data, { timeout }, ack);
    } else {
      socket.emit(event, data, ack);
    }
    // console.log(`✅ ${DEBUG_PREFIX} [EMIT WITH ACK SENT] "${event}"`);
  });
};

const on = <T = unknown>(event: string, callback: EventCallback<T>, p0: string[]): void => {
  socketClient.getSocket().then(socket => {
    socket.on(event, callback);
    // console.log(`🎧 ${DEBUG_PREFIX} Listener registered for: "${event}"`);
  });
};

const off = <T = unknown>(event: string, callback?: EventCallback<T>): void => {
  socketClient.getSocket().then(socket => {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  });
};

const onConnectionChange = (
  callback: (connected: boolean) => void,
): (() => void) => {
  connectionChangeCallbacks.push(callback);
  return () => {
    connectionChangeCallbacks = connectionChangeCallbacks.filter(
      cb => cb !== callback,
    );
  };
};

const onError = (callback: (error: Error) => void): (() => void) => {
  errorCallbacks.push(callback);
  return () => {
    errorCallbacks = errorCallbacks.filter(cb => cb !== callback);
  };
};

// Ensures a (re)connect is in progress and resolves once the socket is
// connected. If already connected, it resolves immediately (zero delay).
// Does NOT wait for the OneSignal `register` emit.
const connectAndWait = async (): Promise<void> => {
  if (socketClient.isConnected()) {
    return;
  }
  const token = currentAuthToken ?? undefined;
  await reconnect(token);
  await waitUntilConnected();
};

// Notification flows wait on this so their first business emit only happens
// after OneSignalSocket has registered the player id with the server.
const waitForRegister = (): Promise<void> => {
  if (registerEmitted) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    registerWaiters.push(resolve);
  });
};

// Called by useOneSignalSocket immediately after the `register` emit
// succeeds, releasing any notification flow that is waiting on readiness.
const markRegisterEmitted = (): void => {
  registerEmitted = true;
  const waiters = registerWaiters;
  registerWaiters = [];
  waiters.forEach(resolve => resolve());
};

// Shared "wait until socket ready" logic for notification accept flows.
// Mirrors the chat notification click flow (which waits on the connected
// socket) but additionally guarantees the OneSignal `register` emit has
// completed, so the first business event is never lost on a reconnect.
const ensureSocketReady = async (): Promise<void> => {
  if (socketClient.isConnected() && registerEmitted) {
    return;
  }
  await connectAndWait();
  await waitUntilConnected();
  await waitForRegister();
};

const reset = async (): Promise<void> => {
  isConnecting = false;
  socketClient.reset();
  currentAuthToken = null;
};

const reconnect = async (token?: string): Promise<void> => {
  currentAuthToken = token || currentAuthToken;

  if (!currentAuthToken) {
    // console.log(
    //   `⚠️ ${DEBUG_PREFIX} reconnect: no auth token - deferring connection`,
    // );
    return;
  }

  const existing = socketClient.getExistingSocket();

  // PRESERVE THE SINGLE PERSISTENT SOCKET.
  // Never tear down a live, connected socket just because the token reference
  // changed. Re-authenticate on the existing instance instead. This is what
  // previously disconnected the socket (reconnect -> disconnectSocket ->
  // socket=null) and then got skipped by the isConnecting guard, leaving a
  // dead socket with no recovery (emit just skips when !connected).
  if (existing && existing.connected) {
    // console.log(
    //   `[SOCKET_OWNER] reconnect: preserving connected socket — ` +
    //     `instanceId=${socketClient.getInstanceId()} socketId=${existing.id}`,
    // );
    socketClient.setToken(currentAuthToken);
    existing.emit('authenticate', { token: currentAuthToken });
    return;
  }

  // No usable socket yet (first connect, or it was genuinely dropped) -> connect.
  // console.log(
  //   `[SOCKET_OWNER] reconnect: no connected socket, connecting — ` +
  //     `instanceId=${socketClient.getInstanceId()}`,
  // );
  await connectSocket(currentAuthToken);
};

export const socketManager = {
  connect: connectSocket,
  disconnect: disconnectSocket,
  reset,
  isConnected,
  emit,
  emitWithAck,
  on,
  off,
  onConnectionChange,
  onError,
  reconnect,
  setAuthToken,
  getAuthToken,
  waitUntilConnected,
  connectAndWait,
  waitForRegister,
  markRegisterEmitted,
  ensureSocketReady,
};

export { connectSocket, disconnectSocket, setAuthToken, getAuthToken };
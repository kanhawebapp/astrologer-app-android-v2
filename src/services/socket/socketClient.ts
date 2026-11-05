import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../../config/env';
import { AuthEvents } from './socketEvents';
import { SocketNamespaces } from './socketEvents';
 
const SOCKET_URL = 'https://dhwaniastro.com';
const SOCKET_NAMESPACE = SocketNamespaces.DHWANI_ASTRO;
const SOCKET_FULL_URL = `${SOCKET_URL}${SOCKET_NAMESPACE}`;
const SOCKET_PATH = '/astro-websocket-service-v2/socket.io';

// console.log('🌐 Socket URL:', SOCKET_FULL_URL);
// console.log('📂 Namespace:', SOCKET_NAMESPACE);
// console.log('🛣 Path:', SOCKET_PATH);

const DEBUG_PREFIX = '[SocketClient]';

class SocketClient {
  private static instance: SocketClient;
  private socket: Socket | null = null;
  private currentToken: string | null = null;
  private initPromise: Promise<Socket> | null = null;
  private debugLoggers: { incoming: boolean; outgoing: boolean } = {
    incoming: true,
    outgoing: true,
  };

  // Stable identity for the whole app lifetime. Used by SOCKET_OWNER logs
  // to prove a single persistent socket instance is preserved across reconnects.
  private readonly instanceId: string = `sock-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

  private constructor() {
    // console.log(`[SOCKET_OWNER] SocketClient created — instanceId=${this.instanceId}`);
  }

  getInstanceId(): string {
    return this.instanceId;
  }

  static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  setToken(token: string | null): void {
    this.currentToken = token;
    // console.log(
    //   '🔑 Token set in socketClient:',
    //   token ? `${token.substring(0, 10)}... (length: ${token.length})` : 'null',
    // );
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(Config.TOKEN_KEY);
      // console.log(
      //   '🔑 Token from storage:',
      //   token
      //     ? `${token.substring(0, 10)}... (length: ${token.length})`
      //     : 'null',
      // );
      return token;
    } catch (error) {
      // console.log('❌ Failed to retrieve token:', error);
      return null;
    }
  }

  async getSocket(): Promise<Socket> {
    // console.log(
    //   `[SOCKET_OWNER] getSocket called — instanceId=${this.instanceId} ` +
    //     `hasSocket=${!!this.socket} socketId=${
    //       this.socket?.id ?? 'null'
    //     } connected=${this.socket?.connected ?? false}`,
    // );
    if (this.socket) {
      return this.socket;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initializeSocket();
    return this.initPromise;
  }

  /**
   * Returns the current socket WITHOUT creating a new one.
   * Used by reconnect() to detect a healthy, already-connected socket so we
   * can preserve the single persistent instance instead of tearing it down.
   */
  getExistingSocket(): Socket | null {
    return this.socket;
  }

  private async initializeSocket(): Promise<Socket> {
    const token = await this.getAuthToken();
    this.currentToken = token;

    // console.log('[SOCKET] Socket connect requested');
    // console.log(`[SOCKET] Current access token: ${token ? token.substring(0, 20) + '...' : 'null/undefined'}`);
    // console.log(`[SOCKET] Whether token is null/undefined: ${token === null || token === undefined ? 'YES' : 'NO'}`);

    // console.log('📡 Initializing socket with:');
    // console.log('  - URL:', SOCKET_FULL_URL);
    // console.log('  - Path:', SOCKET_PATH);
    // console.log('  - Transports:', ['websocket', 'polling']);
    // console.log('  - withCredentials: true');
    // console.log('  - extraHeaders.Cookie: token=<JWT_TOKEN>');
    // console.log('  - timeout: 10000');
    // console.log('  - Token present:', !!token);

    const extraHeaders: Record<string, string> = {};
    if (token) {
      extraHeaders['Cookie'] = `token=${token}`;
      // console.log('  - Cookie header: token=<JWT_TOKEN>');
    }

    this.socket = io(SOCKET_FULL_URL, {
      path: SOCKET_PATH,
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
      extraHeaders: extraHeaders,
    });

    // console.log(
    //   `[SOCKET_OWNER] NEW socket instance created — instanceId=${this.instanceId} ` +
    //     `newSocketId=${this.socket.id ?? 'null'}`,
    // );

    this.setupSocketEvents();
    this.socket.connect();
    // console.log('📡 socket.connect() called after initialization');
    // console.log(`[SOCKET] Connected`);
    return this.socket;
  }

  private setupSocketEvents(): void {
    if (!this.socket) return;

    const socket = this.socket;

    // socket.onAny((eventName: string, ...args: unknown[]) => {
    //   const timestamp = new Date().toISOString();
    //   const payload = args.length === 1 ? args[0] : args;
    //   console.log(
    //     `📥 ${DEBUG_PREFIX} INCOMING EVENT: "${eventName}" [${timestamp}]`,
    //   );
    //   console.log(`   Payload:`, JSON.stringify(payload, null, 2));
    //   console.log(
    //     `   🔍 Raw payload keys:`,
    //     payload ? Object.keys(payload as object) : 'none',
    //   );
    // });

    // socket.onAny((event, payload) => {
    //   console.log(
    //     '🔥 [GLOBAL SOCKET DEBUG]',
    //     'EVENT:',
    //     event,
    //     'PAYLOAD:',
    //     JSON.stringify(payload, null, 2),
    //   );
    // });

    socket.onAnyOutgoing((eventName: string, ...args: unknown[]) => {
      const timestamp = new Date().toISOString();
      const payload = args.length === 1 ? args[0] : args;
      // console.log(
      //   `📤 ${DEBUG_PREFIX} OUTGOING EVENT: "${eventName}" [${timestamp}]`,
      // );
      // console.log(`   Payload:`, JSON.stringify(payload, null, 2));
      // console.log(
      //   `   🔍 Raw payload keys:`,
      //   payload ? Object.keys(payload as object) : 'none',
      // );
    });

    socket.on('connect', () => {
      // console.log(`✅ ${DEBUG_PREFIX} connect - Socket ID: ${socket.id}`);
      // console.log(`[SOCKET] Connected`);
      // console.log(`   Connection Status: CONNECTED`);
    });

    socket.on('connecting', () => {
      // console.log(`🔗 ${DEBUG_PREFIX} connecting...`);
    });

    socket.on('connect_error', (error: Error) => {
      // console.log(`[SOCKET] Connect Error: ${error.message}`);
      // console.log(
      //   `❌ ${DEBUG_PREFIX} connect_error - Full error object:`,
      //   error,
      // );
      // console.log(`   Message: ${error.message}`);
      // console.log(`   Type: ${error.name}`);
      // if ((error as any).description) {
      //   console.log(`   Description:`, (error as any).description);
      // }
      // if ((error as any).context) {
      //   console.log(`   Context:`, (error as any).context);
      // }
    });

    socket.on('disconnect', (reason: string) => {
      // console.log(`[SOCKET] Disconnect Reason: ${reason}`);
      // console.log(`⚠️ ${DEBUG_PREFIX} disconnect - Reason: ${reason}`);
      // console.log(`   Connection Status: DISCONNECTED`);
    });

    socket.on('error', (error: Error) => {
      // console.log(`❌ ${DEBUG_PREFIX} error - Message: ${error.message}`);
    });

    socket.io.on('reconnect_attempt', (attemptNumber: number) => {
      // console.log(
      //   `🔄 ${DEBUG_PREFIX} reconnect_attempt - Attempt: ${attemptNumber}`,
      // );
    });

    socket.io.on('reconnect', (attemptNumber: number) => {
      // console.log(
      //   `♻️ ${DEBUG_PREFIX} reconnect - Success after ${attemptNumber} attempts`,
      // );
    });

    socket.io.on('reconnect_error', (error: Error) => {
      // console.log(
      //   `❌ ${DEBUG_PREFIX} reconnect_error - Message: ${error.message}`,
      // );
    });

    socket.io.on('reconnect_failed', () => {
      // console.log(`❌ ${DEBUG_PREFIX} reconnect_failed - Max attempts reached`);
    });

    socket.on(AuthEvents.AUTH_REQUIRED, () => {
      // console.log(`🔑 ${DEBUG_PREFIX} authRequired event received`);
      if (this.currentToken) {
        socket.emit('authenticate', { token: this.currentToken });
        // console.log(`🔑 ${DEBUG_PREFIX} Token sent via authenticate event`);
        // console.log(
        //   `   Token preview: ${this.currentToken.substring(0, 10)}...`,
        // );
      } else {
        // console.log(`⚠️ ${DEBUG_PREFIX} No token available for authenticate`);
      }
    });

    socket.on(AuthEvents.AUTH_SUCCESS, (data: unknown) => {
      // console.log(`✅ ${DEBUG_PREFIX} authSuccess:`, data);
    });

    socket.on(AuthEvents.AUTH_FAILED, (error: unknown) => {
      // console.log(`❌ ${DEBUG_PREFIX} authFailed:`, error);
    });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  disconnectSocket(): void {
    const oldSocketId = this.socket?.id ?? 'null';
    const oldConnected = this.socket?.connected ?? false;
    const stack = new Error().stack;
    // console.log(
    //   `[SOCKET_OWNER] disconnect called — instanceId=${this.instanceId} ` +
    //     `oldSocketId=${oldSocketId} oldConnected=${oldConnected}`,
    // );
    // console.log(`[SOCKET_OWNER] disconnect stack:\n${stack}`);

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.initPromise = null;
      // console.log(
      //   '❌ Socket disconnected and instance cleared — oldSocketId=' +
      //     oldSocketId,
      // );
    }
  }

  /**
   * Hard reset of the cached socket + promise. Intentionally NOT called during
   * normal navigation / Redux updates / AppState changes / hook cleanup.
   * Exists only so a genuine logout/token wipe can fully clear the instance
   * while still preserving identity logging via getInstanceId().
   */
  reset(): void {
    // console.log(
    //   `[SOCKET_OWNER] reset called — instanceId=${this.instanceId} ` +
    //     `oldSocketId=${this.socket?.id ?? 'null'}`,
    // );
    if (this.socket) {
      this.socket.disconnect();
    }
    this.socket = null;
    this.initPromise = null;
    this.currentToken = null;
  }
}

export const socketClient = SocketClient.getInstance();

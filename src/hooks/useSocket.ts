import { useEffect, useCallback, useRef } from 'react';
import {
  NetInfoState,
  NetInfoSubscription,
} from '@react-native-community/netinfo';
import NetInfo from '@react-native-community/netinfo';
import { socketManager } from '../services/socket/socketManager';
import { socketClient } from '../services/socket/socketClient';
import { EmitOptions, EventCallback } from '../services/socket/socketTypes';

interface UseSocketOptions {
  autoConnect?: boolean;
  token?: string | null;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface UseSocketReturn {
  isConnected: boolean;
  connect: (token?: string) => void;
  disconnect: () => void;
  emit: <T = unknown>(event: string, data?: T, options?: EmitOptions) => void;
  emitWithAck: <T = unknown, R = unknown>(
    event: string,
    data?: T,
    timeout?: number,
  ) => Promise<R>;
  on: <T = unknown>(event: string, callback: EventCallback<T>) => void;
  off: <T = unknown>(event: string, callback?: EventCallback<T>) => void;
}

export const useSocket = (options: UseSocketOptions = {}): UseSocketReturn => {
  const {
    autoConnect = false,
    token = null,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const netInfoSubscription = useRef<NetInfoSubscription | null>(null);
  const wasConnected = useRef(false);

  const connect = useCallback(
    (authToken?: string) => {
      socketManager.connect(authToken ?? token ?? undefined);
    },
    [token],
  );

  const disconnect = useCallback(() => {
    socketManager.disconnect();
  }, []);

  const emit = useCallback(
    <T = unknown>(event: string, data?: T, options?: EmitOptions) => {
      socketManager.emit<T>(event, data, options);
    },
    [],
  );

  const emitWithAck = useCallback(
    <T = unknown, R = unknown>(
      event: string,
      data?: T,
      timeout?: number,
    ): Promise<R> => {
      return socketManager.emitWithAck<T, R>(event, data, timeout);
    },
    [],
  );

  const on = useCallback(
    <T = unknown>(event: string, callback: EventCallback<T>) => {
      socketManager.on<T>(event, callback);
    },
    [],
  );

  const off = useCallback(
    <T = unknown>(event: string, callback?: EventCallback<T>) => {
      socketManager.off<T>(event, callback);
    },
    [],
  );

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
  }, [autoConnect, connect]);

  useEffect(() => {
    if (onConnect) {
      const unsubscribe = socketManager.onConnectionChange((connected: any) => {
        if (connected) {
          onConnect();
        }
      });
      return unsubscribe;
    }
  }, [onConnect]);

  useEffect(() => {
    if (onDisconnect) {
      const unsubscribe = socketManager.onConnectionChange((connected: any) => {
        if (!connected) {
          onDisconnect();
        }
      });
      return unsubscribe;
    }
  }, [onDisconnect]);

  useEffect(() => {
    if (onError) {
      const unsubscribe = socketManager.onError(error => {
        if (error) {
          onError(error);
        }
      });
      return unsubscribe;
    }
  }, [onError]);

  useEffect(() => {
    netInfoSubscription.current = NetInfo.addEventListener(
      (state: NetInfoState) => {
        const isNowConnected = state.isConnected ?? false;

        if (!wasConnected.current && isNowConnected && token) {
          socketManager.reconnect(token);
        }

        wasConnected.current = isNowConnected;
      },
    );

    return () => {
      if (netInfoSubscription.current) {
        netInfoSubscription.current();
      }
    };
  }, [token]);

  const isConnected = socketManager.isConnected();

  return {
    isConnected,
    connect,
    disconnect,
    emit,
    emitWithAck,
    on,
    off,
  };
};

export default useSocket;

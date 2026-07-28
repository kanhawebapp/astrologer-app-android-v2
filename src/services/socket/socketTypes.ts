import { Socket } from 'socket.io-client';

export interface SocketConfig {
  url: string;
  path: string;
  withCredentials: boolean;
}

export interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface SocketEventMap {
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
  reconnect: (attemptNumber: number) => void;
  reconnect_attempt: (attemptNumber: number) => void;
  reconnect_failed: (error: Error) => void;
  ping: () => void;
  pong: (latency: number) => void;
}

export interface QueuedEvent {
  event: string;
  data: unknown;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
}

export interface LiveSessionEvent {
  sessionId: string;
  userId: string;
  action: 'join' | 'leave' | 'update';
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface NotificationEvent {
  id: string;
  type: 'chat' | 'live' | 'system';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface EmitOptions {
  ack?: (response: unknown) => void;
  timeout?: number;
}

export type EventCallback<T = unknown> = (data: T) => void;

export type SocketInstance = Socket;

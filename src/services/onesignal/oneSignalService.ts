import {OneSignal} from 'react-native-onesignal';
import type {
  PushSubscriptionChangedState,
  NotificationClickEvent,
  NotificationWillDisplayEvent,
} from 'react-native-onesignal';

const DEBUG_PREFIX = '[OneSignal]';

// const ONESIGNAL_APP_ID = 'a26df6aa-88d3-46db-8f39-e09f50059e01'; //old key
const ONESIGNAL_APP_ID = '39283c1e-760a-4aac-bcb0-6ee16864249d';

export type { NotificationClickEvent, NotificationWillDisplayEvent } from 'react-native-onesignal';

export type PushSubscriptionListener = (playerId: string | null) => void;
export type NotificationClickListener = (event: NotificationClickEvent) => void;
export type ForegroundNotificationListener = (
  event: NotificationWillDisplayEvent,
) => void;

class OneSignalService {
  private initialized = false;
  private playerId: string | null = null;

  private subscriptionListeners: PushSubscriptionListener[] = [];
  private notificationClickListeners: NotificationClickListener[] = [];
  private foregroundNotificationListeners: ForegroundNotificationListener[] =
    [];

  init(): void {
    if (this.initialized) {
      console.log(`${DEBUG_PREFIX} Already initialized, skipping`);
      return;
    }
    this.initialized = true;

    OneSignal.initialize(ONESIGNAL_APP_ID);

    // Request push permission (Android 13+ and iOS)
    OneSignal.Notifications.requestPermission(true).catch(error => {
      console.log(`${DEBUG_PREFIX} Permission request failed`, error);
    });

    OneSignal.User.pushSubscription.addEventListener(
      'change',
      this.handleSubscriptionChange,
    );
    OneSignal.Notifications.addEventListener(
      'click',
      this.handleNotificationClick,
    );
    OneSignal.Notifications.addEventListener(
      'foregroundWillDisplay',
      this.handleForegroundNotification,
    );

    this.refreshPlayerId();

    console.log(`${DEBUG_PREFIX} Initialized`);
  }

  private handleSubscriptionChange = (
    state: PushSubscriptionChangedState,
  ): void => {
    const id = state.current.id ?? null;
    console.log(`${DEBUG_PREFIX} Push subscription changed`, {
      id,
      optedIn: state.current.optedIn,
    });
    this.setPlayerId(id);
  };

  private handleNotificationClick = (event: NotificationClickEvent): void => {
    console.log(`${DEBUG_PREFIX} Notification clicked`);
    this.notificationClickListeners.forEach(listener => listener(event));
  };

  private handleForegroundNotification = (
    event: NotificationWillDisplayEvent,
  ): void => {
    console.log(`${DEBUG_PREFIX} Foreground notification received`);
    this.foregroundNotificationListeners.forEach(listener => listener(event));
  };

  private async refreshPlayerId(): Promise<void> {
    try {
      const id = await OneSignal.User.pushSubscription.getIdAsync();
      this.setPlayerId(id ?? null);
    } catch (error) {
      console.log(`${DEBUG_PREFIX} Failed to read push subscription id`, error);
    }
  }

  private setPlayerId(id: string | null): void {
    if (this.playerId === id) {
      return;
    }
    this.playerId = id;
    this.subscriptionListeners.forEach(listener => listener(id));
  }

  getPlayerId(): string | null {
    return this.playerId;
  }

  isSubscribed(): boolean {
    return this.playerId !== null;
  }

  onSubscriptionChange(listener: PushSubscriptionListener): () => void {
    this.subscriptionListeners.push(listener);
    return () => {
      this.subscriptionListeners = this.subscriptionListeners.filter(
        registered => registered !== listener,
      );
    };
  }

  onNotificationClick(listener: NotificationClickListener): () => void {
    this.notificationClickListeners.push(listener);
    return () => {
      this.notificationClickListeners = this.notificationClickListeners.filter(
        registered => registered !== listener,
      );
    };
  }

  onForegroundNotification(
    listener: ForegroundNotificationListener,
  ): () => void {
    this.foregroundNotificationListeners.push(listener);
    return () => {
      this.foregroundNotificationListeners =
        this.foregroundNotificationListeners.filter(
          registered => registered !== listener,
        );
    };
  }

  setExternalUserId(userId: string): void {
    OneSignal.login(userId);
  }

  logout(): void {
    OneSignal.logout();
  }
}

export const oneSignalService = new OneSignalService();

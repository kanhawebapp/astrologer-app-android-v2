import {createNavigationContainerRef} from '@react-navigation/native';
import type {RootStackParamList} from '../../navigation/types';

const DEBUG_PREFIX = '[NavigationService]';

// Module-level navigation ref so ANY code (hooks, socket handlers, native
// bridge handlers) can navigate once the NavigationContainer has mounted,
// without needing a component context.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

type PendingNavigation = {
  name: keyof RootStackParamList;
  params: any;
  dedupeKey?: string;
};

let isReady = false;
let pendingNavigation: PendingNavigation | null = null;
let lastDedupeKey: string | null = null;
let readyWaiters: Array<() => void> = [];

const getDedupeKey = (
  name: keyof RootStackParamList,
  params: any,
): string | undefined => {
  if (name === 'IncomingCallFullscreen' && params?.roomId) {
    return `incoming:${params.roomId}`;
  }
  return undefined;
};

const doNavigate = (navigation: PendingNavigation): void => {
  console.log(
    `${DEBUG_PREFIX} navigation.navigate('${String(navigation.name)}')`,
    navigation.params ?? {},
  );

  if (!navigationRef.isReady()) {
    console.warn(
      `${DEBUG_PREFIX} Navigation container not ready - dropping navigation to '${String(
        navigation.name,
      )}'`,
    );
    return;
  }

  navigationRef.navigate(
    navigation.name as any,
    navigation.params ?? undefined,
  );
};

// Called by NavigationContainer's onReady. Flushes any queued pending call.
export const markNavigationReady = (): void => {
  console.log(`${DEBUG_PREFIX} NavigationContainer ready`);
  isReady = true;

  const waiters = readyWaiters;
  readyWaiters = [];
  waiters.forEach(resolve => resolve());

  if (pendingNavigation) {
    const pending = pendingNavigation;
    pendingNavigation = null;
    doNavigate(pending);
  }
};

// Navigate immediately if the container is ready; otherwise queue the action
// until markNavigationReady() runs. Dedupes repeated requests for the same
// incoming call (OneSignal click + native pending action + socket replay can
// all arrive for the same roomId) to prevent double navigation.
export const navigateWhenReady = (
  name: keyof RootStackParamList,
  params?: any,
): void => {
  const dedupeKey = getDedupeKey(name, params);
  if (dedupeKey) {
    if (dedupeKey === lastDedupeKey) {
      console.log(
        `${DEBUG_PREFIX} Skipping duplicate navigation '${String(
          name,
        )}' (${dedupeKey})`,
      );
      return;
    }
    lastDedupeKey = dedupeKey;
  }

  if (isReady && navigationRef.isReady()) {
    doNavigate({name, params, dedupeKey});
    return;
  }

  console.log(
    `${DEBUG_PREFIX} Navigation container not ready - queuing '${String(
      name,
    )}'`,
  );
  pendingNavigation = {name, params, dedupeKey};
};

// Resolves once the NavigationContainer is fully initialized. Used by the
// accept flow so the IncomingCallFullscreen screen (and its registered accept
// trigger) is guaranteed to be mounted before the accept is triggered.
export const waitUntilReady = (): Promise<void> => {
  if (isReady) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    readyWaiters.push(resolve);
  });
};

// Clear the dedupe guard (called when the incoming call screen unmounts) so a
// subsequent call for the same roomId can navigate again.
export const resetNavigationDedupe = (): void => {
  lastDedupeKey = null;
  pendingNavigation = null;
};

export const navigationService = {
  navigationRef,
  markNavigationReady,
  navigateWhenReady,
  waitUntilReady,
  resetNavigationDedupe,
};

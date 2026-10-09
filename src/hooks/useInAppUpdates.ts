import {useEffect} from 'react';
import {Alert, AppState, AppStateStatus, Platform} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {getBuildNumber} from 'react-native-device-info';
import SpInAppUpdates, {
  AndroidNeedsUpdateResponse,
  IAUInstallStatus,
  IAUUpdateKind,
  StatusUpdateEvent,
} from 'sp-react-native-in-app-updates';

const DEBUG_PREFIX = '[useInAppUpdates]';

// Releases rolled out with a Play Console in-app update priority (0-5) at or
// above this value are treated as mandatory and use the IMMEDIATE flow.
const MANDATORY_UPDATE_PRIORITY = 4;

let inAppUpdates: SpInAppUpdates | null = null;
let isChecking = false;
let flexibleUpdatePrompted = false;
let installPromptShown = false;

const getInAppUpdates = () => {
  if (!inAppUpdates) {
    inAppUpdates = new SpInAppUpdates(false);
  }
  return inAppUpdates;
};

const promptInstallDownloadedUpdate = () => {
  if (installPromptShown) {
    return;
  }
  installPromptShown = true;
  Alert.alert(
    'Update ready',
    'A new version has been downloaded. Restart the app to finish updating.',
    [
      {
        text: 'Later',
        style: 'cancel',
        onPress: () => {
          installPromptShown = false;
        },
      },
      {text: 'Restart', onPress: () => getInAppUpdates().installUpdate()},
    ],
  );
};

const onStatusUpdate = ({status}: StatusUpdateEvent) => {
  if (status === IAUInstallStatus.DOWNLOADED) {
    promptInstallDownloadedUpdate();
  }
};

const checkForUpdate = async () => {
  if (isChecking) {
    return;
  }
  isChecking = true;
  try {
    const netState = await NetInfo.fetch();
    if (
      netState.isConnected === false ||
      netState.isInternetReachable === false
    ) {
      return;
    }

    const updates = getInAppUpdates();
    const result = (await updates.checkNeedsUpdate({
      curVersion: getBuildNumber(),
    })) as AndroidNeedsUpdateResponse;

    if (!result.shouldUpdate) {
      return;
    }

    const {updatePriority, isImmediateUpdateAllowed, isFlexibleUpdateAllowed} =
      result.other;

    if (
      updatePriority >= MANDATORY_UPDATE_PRIORITY &&
      isImmediateUpdateAllowed
    ) {
      await updates.startUpdate({updateType: IAUUpdateKind.IMMEDIATE});
    } else if (isFlexibleUpdateAllowed && !flexibleUpdatePrompted) {
      flexibleUpdatePrompted = true;
      await updates.startUpdate({updateType: IAUUpdateKind.FLEXIBLE});
    }
  } catch (error: any) {
    // Expected for sideloaded/debug builds, missing Play Store, or network failures.
    console.log(
      `${DEBUG_PREFIX} Update check failed:`,
      error?.message ?? error,
    );
  } finally {
    isChecking = false;
  }
};

export const useInAppUpdates = () => {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const updates = getInAppUpdates();
    updates.addStatusUpdateListener(onStatusUpdate);
    checkForUpdate();

    // Re-check on resume so a dismissed mandatory update is shown again.
    let appState: AppStateStatus = AppState.currentState;
    const subscription = AppState.addEventListener('change', nextState => {
      if (appState.match(/inactive|background/) && nextState === 'active') {
        checkForUpdate();
      }
      appState = nextState;
    });

    return () => {
      subscription.remove();
      updates.removeStatusUpdateListener(onStatusUpdate);
    };
  }, []);
};

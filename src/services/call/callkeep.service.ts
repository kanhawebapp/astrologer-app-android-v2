import AppState from 'react-native';

const DEBUG_PREFIX = '[CallKeepService]';

const CALLKEEP_OPTIONS = {
  ios: {
    appName: 'DhwaniPartner',
    iconName: 'icon_notification',
    ringtoneSound: 'ringtone.mp3',
    supportsVideo: false,
    includesCallsInRecents: false,
  },
  android: {
    alertTitle: 'Permissions required',
    alertDescription: 'Need phone permissions to receive calls',
    cancelButton: 'Cancel',
    okButton: 'OK',
    additionalPermissions: [],
    foregroundService: {
      channelId: 'partner.dhwaniastro.com.callkeep',
      channelName: 'CallKeep Service',
      notificationTitle: 'DhwaniPartner',
      notificationIcon: 'ic_notification',
    },
  },
};

let answerCallCallback: (() => void) | null = null;
let endCallCallback: (() => void) | null = null;

export const setupCallKeep = async (): Promise<void> => {
  try {
    console.log(`${DEBUG_PREFIX} Setting up CallKeep`);
    await RNCallKeep.setup(CALLKEEP_OPTIONS);
    RNCallKeep.setAvailable(true);
    console.log(`${DEBUG_PREFIX} CallKeep setup completed`);
  } catch (error: any) {
    console.log(`${DEBUG_PREFIX} CallKeep setup failed:`, error.message);
    throw error;
  }
};

export const addCallKeepEventListeners = (
  onAnswer: () => void,
  onEnd: () => void,
): void => {
  console.log(`${DEBUG_PREFIX} Adding CallKeep event listeners`);
  answerCallCallback = onAnswer;
  endCallCallback = onEnd;

  RNCallKeep.addEventListener('answerCall', () => {
    console.log(`${DEBUG_PREFIX} CallKeep answerCall event`);
    if (answerCallCallback) {
      answerCallCallback();
    }
  });

  RNCallKeep.addEventListener('endCall', () => {
    console.log(`${DEBUG_PREFIX} CallKeep endCall event`);
    if (endCallCallback) {
      endCallCallback();
    }
  });
};

export const removeCallKeepEventListeners = (): void => {
  console.log(`${DEBUG_PREFIX} Removing CallKeep event listeners`);
  answerCallCallback = null;
  endCallCallback = null;

  RNCallKeep.removeEventListener('answerCall');
  RNCallKeep.removeEventListener('endCall');
};

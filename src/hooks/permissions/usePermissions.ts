import {
  Platform,
  PermissionsAndroid,
  Alert,
  Linking,
  NativeModules,
} from 'react-native';

export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'undetermined'
  | 'blocked';

export interface PermissionState {
  camera: PermissionStatus;
  microphone: PermissionStatus;
}

interface PermissionActions {
  checkPermissions: () => Promise<PermissionState>;
  requestPermissions: () => Promise<PermissionState>;
  openSettings: () => void;
  hasAllPermissions: () => Promise<boolean>;
}

const openAppSettings = () => {
  Linking.openSettings();
};

const checkCameraPermission = async (): Promise<PermissionStatus> => {
  if (Platform.OS === 'android') {
    const result = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    return result ? 'granted' : 'undetermined';
  }
  const { Camera } = NativeModules;
  if (!Camera) return 'undetermined';
  const status = await Camera.getCameraPermissionStatus?.();
  if (status === 'authorized') return 'granted';
  if (status === 'denied') return 'denied';
  if (status === 'restricted') return 'blocked';
  return 'undetermined';
};

const checkMicrophonePermission = async (): Promise<PermissionStatus> => {
  if (Platform.OS === 'android') {
    const result = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    return result ? 'granted' : 'undetermined';
  }
  const { Camera } = NativeModules;
  if (!Camera) return 'undetermined';
  const status = await Camera.getMicrophonePermissionStatus?.();
  if (status === 'authorized') return 'granted';
  if (status === 'denied') return 'denied';
  if (status === 'restricted') return 'blocked';
  return 'undetermined';
};

const requestCameraPermission = async (): Promise<PermissionStatus> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'We need camera access for live sessions',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED
        ? 'granted'
        : 'denied';
    } catch {
      return 'denied';
    }
  }
  const { Camera } = NativeModules;
  if (!Camera?.requestCameraPermission) return 'denied';
  try {
    const status = await Camera.requestCameraPermission();
    if (status === 'authorized') return 'granted';
    if (status === 'denied') return 'denied';
    return 'blocked';
  } catch {
    return 'denied';
  }
};

const requestMicrophonePermission = async (): Promise<PermissionStatus> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'We need microphone access for live audio',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED
        ? 'granted'
        : 'denied';
    } catch {
      return 'denied';
    }
  }
  const { Camera } = NativeModules;
  if (!Camera?.requestMicrophonePermission) return 'denied';
  try {
    const status = await Camera.requestMicrophonePermission();
    if (status === 'authorized') return 'granted';
    if (status === 'denied') return 'denied';
    return 'blocked';
  } catch {
    return 'denied';
  }
};

export const usePermissions = (): PermissionActions => {
  const checkPermissions = async (): Promise<PermissionState> => {
    const [camera, microphone] = await Promise.all([
      checkCameraPermission(),
      checkMicrophonePermission(),
    ]);
    return { camera, microphone };
  };

  const requestPermissions = async (): Promise<PermissionState> => {
    const [camera, microphone] = await Promise.all([
      requestCameraPermission(),
      requestMicrophonePermission(),
    ]);
    return { camera, microphone };
  };

  const hasAllPermissions = async (): Promise<boolean> => {
    const { camera, microphone } = await checkPermissions();
    return camera === 'granted' && microphone === 'granted';
  };

  return {
    checkPermissions,
    requestPermissions,
    openSettings: openAppSettings,
    hasAllPermissions,
  };
};

export const showPermissionDeniedAlert = (onOpenSettings: () => void) => {
  Alert.alert(
    'Camera & Mic Access Required',
    'To go live, we need access to your camera and microphone. Please enable them in Settings.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: onOpenSettings },
    ],
    { cancelable: true },
  );
};

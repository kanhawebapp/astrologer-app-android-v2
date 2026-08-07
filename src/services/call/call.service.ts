import InCallManager from 'react-native-incall-manager';
import {Platform} from 'react-native';

export const startIncomingRing = () => {
  try {
    InCallManager.startRingtone('_BUNDLE_');
    // console.log('🔔 Ring started');
  } catch (e) {
    console.log('❌ Ring start error:', e);
  }
};

export const stopIncomingRing = () => {
  try {
    InCallManager.stopRingtone();
    // console.log(
    //   '[CallService] 🔕 Ring stopped via InCallManager.stopRingtone()',
    // );
  } catch (e) {
    console.log('[CallService] ❌ Ring stop error:', e);
  }
  // Also call stop() to ensure any ringback tones are stopped
  try {
    InCallManager.stop();
    // console.log(
    //   '[CallService] 🔕 InCallManager.stop() called for complete stop',
    // );
  } catch (e) {
    console.log('[CallService] ❌ InCallManager.stop() error:', e);
  }
};

/**
 * Start InCallManager for call audio routing.
 * This enables automatic wired headset and Bluetooth headset detection on Android.
 * Note: Does NOT play ringback tone - for incoming call acceptance.
 */
export const startCallAudio = (roomId: string) => {
  if (Platform.OS === 'android') {
    InCallManager.start({
      media: 'audio',
      auto: true,
      includesBluetooth: true,
      includesWired: true,
    });
    InCallManager.setKeepScreenOn(true);
    // Set to false - allows automatic routing to connected headsets
    InCallManager.setForceSpeakerphoneOn(false);
    console.log('[CallService] InCallManager started for room:', roomId);
  }
};

/**
 * Stop InCallManager when call ends.
 */
export const stopCallAudio = () => {
  try {
    InCallManager.stop();
    InCallManager.setKeepScreenOn(false);
    console.log('🔕 Call audio stopped');
  } catch (e) {
    console.log('❌ Call audio stop error:', e);
  }
};

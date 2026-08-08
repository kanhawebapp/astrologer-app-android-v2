import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { RTCView } from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import { RootState, AppDispatch, store } from '../../../../store';
import {
  setCallState,
  incrementCallDuration,
  toggleMute,
  setError,
  resetCall,
  setCallDuration,
  decrementCallTime,
  toggleSpeaker,
  setSpeakerOn,
} from '../../../../store/slices/callSlice';
import { webrtcService } from '../../../../services/call/webrtc.service';
import { callSocketEmitters } from '../../data/callSocketEmitters';
import { useTheme } from '../../../../hooks/useTheme';
import { RootStackParamList } from '../../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ringtoneManager } from '../../../../services/call/ringtoneManager';
import { stopCallAudio } from '../../../../services/call/call.service';

type CallScreenRouteProp = RouteProp<RootStackParamList, 'CallScreen'>;
type CallScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CallScreen'>;

const DEBUG_PREFIX = '[CallScreen]';

export const CallScreen: React.FC = () => {
  const navigation = useNavigation<CallScreenNavigationProp>();
  const route = useRoute<CallScreenRouteProp>();
  const { roomId, callerName } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const [speakerOn, setSpeakerOnState] = React.useState(false);
  const { theme } = useTheme();

  // console.log(`${DEBUG_PREFIX} mounted`, { roomId, callerName });

  const { callState, callDuration, callTime, isMuted, isSpeakerOn, error } = useSelector(
    (state: RootState) => state.call,
  );

  // Guard against the screen being removed by navigation (e.g. a background
  // Splash -> MainTabs transition during a killed-mode launch) while a call is
  // still active. The call UI must stay on top until the call is ended; the
  // end-call flows set callState to 'ended' before navigating away, so they are
  // unaffected.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (
        callState === 'ringing' ||
        callState === 'connecting' ||
        callState === 'connected'
      ) {
        e.preventDefault();
      }
    });

    return unsubscribe;
  }, [navigation, callState]);

  const timerIntervalRef = useRef<any | null>(null);
  const callTimeTimerRef = useRef<any | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const endedRef = useRef(false);
  const astroId = (store.getState().auth.user as any)?.id;

  // Start timer when connected
  useEffect(() => {
    if (callState === 'connected') {
      timerIntervalRef.current = setInterval(() => {
        dispatch(incrementCallDuration());
      }, 1000);

      callTimeTimerRef.current = setInterval(() => {
        dispatch(decrementCallTime());
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (callTimeTimerRef.current) {
        clearInterval(callTimeTimerRef.current);
        callTimeTimerRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (callTimeTimerRef.current) {
        clearInterval(callTimeTimerRef.current);
      }
    };
  }, [callState, dispatch]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // Cleanup on unmount - stop InCallManager
  useEffect(() => {
    return () => {
      InCallManager.stop();
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = useCallback(async () => {
    const isNowMuted = await webrtcService.toggleMute();
    dispatch(toggleMute());
    console.log(`${DEBUG_PREFIX} Mute toggled: ${isNowMuted}`);
  }, [dispatch]);

  const handleToggleSpeaker = useCallback(async () => {
    setSpeakerOnState(prev => !prev);
    const speakerOn = await webrtcService.toggleAudioRoute();
    dispatch(setSpeakerOn(speakerOn));
    console.log(`${DEBUG_PREFIX} Speaker toggled:`, speakerOn);
  }, [dispatch]);

  const handleEndCallSilently = useCallback(async () => {
    try {
      await callSocketEmitters.endCall(roomId, astroId);
      console.log(`${DEBUG_PREFIX} End call emitted`);
    } catch (err) {
      console.log(`${DEBUG_PREFIX} Error ending call:`, err);
    } finally {
      ringtoneManager.stopRingtone();
      stopCallAudio();
      dispatch(setCallState('ended'));
      webrtcService.cleanup('end_call_button');
      dispatch(resetCall());
    }
  }, [roomId, dispatch]);

  const handleEndCall = useCallback(async () => {
    console.log(`${DEBUG_PREFIX} End call pressed`);
    endedRef.current = true;
    await handleEndCallSilently();
    navigation.goBack();
  }, [handleEndCallSilently, navigation]);

  // useEffect(() => {
  //   if (callState === 'connected' && callTime <= 0) {
  //     console.log(
  //       `${DEBUG_PREFIX} Call time expired (${callTime}s), ending call`,
  //     );
  //     handleEndCallSilently();
  //   }
  // }, [callTime, callState, handleEndCallSilently]);

  // Auto-navigate back when call ends
  useEffect(() => {
    if (callState === 'ended') {
      const timer = setTimeout(() => {
        navigation.goBack();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [callState, navigation]);

  const showConnecting = callState === 'connecting' || callState === 'ringing';
  const isConnected = callState === 'connected';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Hidden RTCView for audio playback */}
      <RTCView
        streamURL={webrtcService.getRemoteStream()?.toURL()}
        style={styles.hiddenAudio}
        objectFit="contain"
      />

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Voice Call</Text>

        <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primaryLight }]}>
          <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
            {callerName ? callerName.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>

        <Text style={[styles.callerName, { color: theme.colors.textPrimary }]}>
          {callerName || 'Unknown'}
        </Text>

        <View style={[styles.statusBadge, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
            {showConnecting ? 'Connecting...' : 'Connected'}
          </Text>
        </View>

        {isConnected && (
          <View style={[styles.timerContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.timerText, { color: theme.colors.primary }]}>
              {formatDuration(callDuration)}
            </Text>
            {callTime > 0 && (
              <Text style={[styles.countdownText, { color: theme.colors.error }]}>
                {Math.ceil(callTime / 60)}:{String(Math.ceil(callTime % 60)).padStart(2, '0')} remaining
              </Text>
            )}
          </View>
        )}

        {error && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}
      </View>

      <View style={styles.controls}>
        <View style={styles.middleControls}>
          {/* Speaker / Handsfree */}
          <TouchableOpacity
            style={[styles.controlButton, styles.speakerButton, {
              backgroundColor: speakerOn ? theme.colors.primary : theme.colors.surface,
            }]}
            onPress={handleToggleSpeaker}>
            <Icon
              name={speakerOn ? 'volume-up' : 'volume-off'}
              size={32}
              color={speakerOn ? theme.colors.white : theme.colors.text}
            />
            <Text style={[styles.controlLabel, {
              color: speakerOn ? theme.colors.white : theme.colors.text,
            }]}>Speaker</Text>
          </TouchableOpacity>

          {/* Low Voice / Mic */}
          <TouchableOpacity
            style={[styles.controlButton, styles.muteButton, {
              backgroundColor: isMuted ? theme.colors.primary : theme.colors.surface,
            }]}
            onPress={handleToggleMute}>
            <Icon
              name={isMuted ? 'mic-off' : 'mic'}
              size={32}
              color={isMuted ? theme.colors.white : theme.colors.text}
            />
            <Text style={[styles.controlLabel, {
              color: isMuted ? theme.colors.white : theme.colors.text,
            }]}>Low voice</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.controlButton, styles.endButton, { backgroundColor: theme.colors.error }]}
          onPress={handleEndCall}>
          <Icon name="call-end" size={32} color={theme.colors.white} />
          <Text style={[styles.controlLabel, { color: theme.colors.white }]}>End</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hiddenAudio: {
    width: 0,
    height: 0,
    opacity: 0,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
  },
  callerName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  timerText: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  countdownText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: 40,
    paddingHorizontal: 20,
    gap: 12,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  leftControls: {
    flexDirection: 'row',
    gap: 12,
  },
  middleControls: {
    flexDirection: 'row',
    gap: 12,
  },
  volButton: {},
  speakerButton: {},
  muteButton: {},
  endButton: {},
  controlLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
});
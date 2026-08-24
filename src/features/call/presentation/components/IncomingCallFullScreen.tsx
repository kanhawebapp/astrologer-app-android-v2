import React, { useCallback, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Alert,
  Vibration,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../../../../store';
import {
  setCallState,
  setError,
  resetCall,
  setCallDuration,
} from '../../../../store/slices/callSlice';
import { store } from '../../../../store';
import { webrtcService } from '../../../../services/call/webrtc.service';
import { callSocketEmitters } from '../../data/callSocketEmitters';
import { useTheme } from '../../../../hooks/useTheme';
import { ringtoneManager } from '../../../../services/call/ringtoneManager';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/types';
import { BlurView } from '@react-native-community/blur';
import { LinearGradient } from 'react-native-linear-gradient';
import { callActionBridge } from '../../../../services/call/callActionBridge';
import { setAcceptTrigger } from '../../../../services/call/callAcceptTrigger';
import { socketClient } from '../../../../services/socket';

const DEBUG_PREFIX = '[IncomingCallFullScreen]';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const MAX_DISTANCE = SCREEN_WIDTH * 0.3;
const MAX_VERTICAL_SWIPE = 120;

// Auto-reject timeout in seconds (1 minute)
const AUTO_REJECT_TIMEOUT = 60;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RingingTextProps {
  visible: boolean;
}

const RingingText: React.FC<RingingTextProps> = ({ visible }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const [dotCount, setDotCount] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      intervalRef.current = setInterval(() => {
        setDotCount(prev => (prev % 3) + 1);
      }, 500);
    } else {
      opacity.stopAnimation();
      opacity.setValue(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [visible, opacity]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={{ opacity }}>
      <Text style={styles.ringingText}>Ringing{' '.repeat(dotCount)}</Text>
    </Animated.View>
  );
};

export interface IncomingCallFullScreenRef {
  acceptCall: () => Promise<void>;
}

export const IncomingCallFullScreen = forwardRef<IncomingCallFullScreenRef>((props, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  // console.log(`${DEBUG_PREFIX} mounted`);

  const callStateData = useSelector((state: RootState) => state.call);
  if (!callStateData) {
    return null;
  }
  const { callState, participant, roomId, callerId, callTime } = callStateData;

  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const visible = callState === 'ringing' && !!participant;

  // Countdown timer for auto-reject (starts when ringing screen becomes visible)
  const [remainingTime, setRemainingTime] = useState(AUTO_REJECT_TIMEOUT);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Swipe hint animations
  const swipeHintOpacity = useRef(new Animated.Value(0)).current;
  const arrowTranslateX = useRef(new Animated.Value(0)).current;
  const waveOpacity = useRef(new Animated.Value(0.7)).current;
  const waveScale = useRef(new Animated.Value(1)).current;
  // console.log('callTime before accept =>', callTime);
  // Start auto-reject countdown when ringing screen becomes visible
  useEffect(() => {
    if (visible) {
      setRemainingTime(AUTO_REJECT_TIMEOUT);
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            // Auto-reject: time's up, reject the call
            const currentRoomId = roomIdRef.current;
            if (
              currentRoomId &&
              !acceptingRef.current &&
              !rejectingRef.current
            ) {
              console.log(
                `${DEBUG_PREFIX} Auto-reject: call timed out after ${AUTO_REJECT_TIMEOUT}s`,
              );
              setRejecting(true);
              ringtoneManager.stopRingtone();
              callSocketEmitters
                .rejectCall(
                  (store.getState().auth.user as any)?.id || 'unknown',
                  currentRoomId,
                )
                .catch(err =>
                  console.log(`${DEBUG_PREFIX} Error auto-rejecting:`, err),
                );
              dispatch(resetCall());
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [visible, dispatch]);

  // Animated values using React Native Animated API
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const acceptProgress = useRef(new Animated.Value(0)).current;
  const rejectProgress = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;

  // Refs for stable access
  const roomIdRef = useRef(roomId);
  const callerIdRef = useRef(callerId);
  const participantRef = useRef(participant);
  const acceptingRef = useRef(accepting);
  const rejectingRef = useRef(rejecting);

  roomIdRef.current = roomId;
  callerIdRef.current = callerId;
  participantRef.current = participant;
  acceptingRef.current = accepting;
  rejectingRef.current = rejecting;

  // Waveform animation for incoming call indicator
  const startWaveAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(waveScale, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(waveOpacity, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(waveScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(waveOpacity, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [waveScale, waveOpacity]);

  // Swipe hint animation
  useEffect(() => {
    if (visible && !accepting && !rejecting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(swipeHintOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(swipeHintOpacity, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(arrowTranslateX, {
            toValue: 10,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(arrowTranslateX, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      swipeHintOpacity.stopAnimation();
      swipeHintOpacity.setValue(0);
      arrowTranslateX.stopAnimation();
      arrowTranslateX.setValue(0);
    }
  }, [visible, accepting, rejecting, swipeHintOpacity, arrowTranslateX]);

  // Pulse animation
  const startPulseAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(pulseScale, {
        toValue: 1.2,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(pulseOpacity, {
        toValue: 0.3,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0.7,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [pulseScale, pulseOpacity]);

  // Start animations when visible
  useEffect(() => {
    if (visible) {
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Animated.spring(cardScale, {
        toValue: 1,
        damping: 15,
        stiffness: 100,
        useNativeDriver: true,
      }).start();

      startPulseAnimation();
      startWaveAnimation();
      Vibration.vibrate([0, 500, 200, 500]);
    } else {
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      Animated.timing(cardScale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }).start();

      pulseScale.setValue(1);
      pulseOpacity.setValue(0.7);
      waveScale.setValue(1);
      waveOpacity.setValue(0.7);
    }
  }, [
    visible,
    backgroundOpacity,
    cardScale,
    pulseScale,
    pulseOpacity,
    startPulseAnimation,
    startWaveAnimation,
  ]);

  // Continue pulse animation
  useEffect(() => {
    if (visible) {
      startPulseAnimation();
      const interval = setInterval(() => {
        startPulseAnimation();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [visible, startPulseAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callState === 'ringing') {
        // console.log(
        //   `${DEBUG_PREFIX} Component unmounting while ringing - stopping ringtone`,
        // );
        ringtoneManager.stopRingtone();
      }
    };
  }, [callState]);

  // Reset states when hidden
  // useEffect(() => {
  //   if (!visible) {
  //     setAccepting(false);
  //     setRejecting(false);
  //     translateX.setValue(0);
  //     translateY.setValue(0);
  //     acceptProgress.setValue(0);
  //     rejectProgress.setValue(0);
  //   }
  // }, [visible, translateX, translateY, acceptProgress, rejectProgress]);





  const handleAccept = useCallback(async () => {
    // console.log('[Call Accept Flow] Accept pressed');

    const currentRoomId = roomIdRef.current;

    if (!currentRoomId || acceptingRef.current || rejectingRef.current) {
      console.log(
        `${DEBUG_PREFIX} Accept validation failed - roomId:`,
        !!currentRoomId,
        'accepting:',
        acceptingRef.current,
        'rejecting:',
        rejectingRef.current,
      );
      return;
    }

    setAccepting(true);
    // console.log('[Call Accept Flow] Stopping ringtone...');
    ringtoneManager.stopRingtone();
    // console.log('[Call Accept Flow] Ringtone stopped successfully');
    Vibration.vibrate(50);

    try {
      const localStream = await webrtcService.getLocalStream();
      // console.log(
      //   `${DEBUG_PREFIX} Local stream obtained, tracks:`,
      //   localStream.getTracks().length,
      // );


      // 👇 YAHAN ADD KARO
const socket = await socketClient.getSocket();

// console.log('[KILL MODE] socket.connected =', socket.connected);
// console.log('[KILL MODE] socket.id =', socket.id);

const state = store.getState();

// console.log('[KILL MODE] auth token =', !!state.auth.token);
// console.log('[KILL MODE] userId =', state.auth.user?.id);
// console.log('[KILL MODE] roomId =', currentRoomId);
// console.log('[KILL MODE] callTime =', state.call.callTime);

// console.log("Redux callTime =", store.getState().call.callTime);

// Agar route params use ho rahe hain to
// console.log("Navigation callTime =", (props as any)?.route?.params?.callTime);

// console.log("Participant =", participantRef.current);

      await callSocketEmitters.joinCall(currentRoomId);
      // console.log(`${DEBUG_PREFIX} join_call emitted`);

      setTimeout(async () => {
        try {
          const state = store.getState();
          if (
            state.call.callState === 'idle' ||
            state.call.callState === 'ended'
          ) {
            // The call ended (reject/caller-cancel/auto-reject) while the
            // accept was still in flight; the incoming-call screen has already
            // been popped. Abort so we don't emit acceptCall or dispatch
            // navigation.replace from an unmounted screen (which would fall
            // back to replacing the focused route).
            console.log(
              `${DEBUG_PREFIX} Call inactive (callState=${state.call.callState}) before accept completed - aborting accept`,
            );
            acceptingRef.current = false;
            setAccepting(false);
            return;
          }
          const astroId = (state.auth.user as any)?.id;
          const callTimeInSeconds = state.call.callTime;
          const callTimeInMinutes = callTimeInSeconds / 60;
          // console.log("callTimeInSeconds>>>",callTimeInSeconds)

          if (callTimeInSeconds <= 0) {
            // A zero/negative duration is treated by the server as an invalid
            // call and can cause an immediate call_ended_by_user. This happens
            // in kill mode when the notification payload lacked maximumTime and
            // no authoritative socket incoming_call refresh arrived in time.
            // console.warn(
            //   `${DEBUG_PREFIX} ⚠️ callTime is ${callTimeInSeconds}s (<=0). Accepting with 0 duration - server may end the call immediately. Check notification payload maximumTime.`,
            // );
          }
          console.log(
            `${DEBUG_PREFIX} Emitting callAcceptedByAstrologer room=${currentRoomId} callTimeSeconds=${callTimeInSeconds} callTimeMinutes=${callTimeInMinutes}`,
          );

          await callSocketEmitters.acceptCall(
            currentRoomId,
            astroId,
            callTimeInMinutes,
          );
          console.log(`${DEBUG_PREFIX} callAcceptedByAstrologer emitted`);

          dispatch(setCallState('connecting'));
          dispatch(setError(null));
          dispatch(setCallDuration(0));

          // Replace the incoming call screen so the stack stays
          // [MainTabs, CallScreen] and goBack returns to the app after the
          // call ends.
          navigation.replace('CallScreen', {
            roomId: currentRoomId,
            callerId: callerIdRef.current || '',
            callerName: participantRef.current?.name || 'Unknown',
          });
        } catch (error) {
          console.log(`${DEBUG_PREFIX} Error during call acceptance:`, error);
          dispatch(setError('Failed to accept call'));
          dispatch(resetCall());
          setAccepting(false);
        }
      }, 500);
    } catch (error: any) {
      console.log(
        `${DEBUG_PREFIX} Error getting microphone permission:`,
        error,
      );
      Alert.alert(
        'Microphone Error',
        'Please allow microphone access for voice calls.',
      );
      setAccepting(false);
    }
  }, [dispatch, navigation]);

  const acceptCall = useCallback(async () => {
    console.log('[Call Accept Flow] Accept called from external trigger');
    await handleAccept();
  }, [handleAccept]);

  useImperativeHandle(ref, () => ({
    acceptCall,
  }), [acceptCall]);

  const handleReject = useCallback(async () => {
    const currentRoomId = roomIdRef.current;

    console.log(
      `[REJECT FLOW] Reject pressed - room=${currentRoomId} callState=${store.getState().call.callState}`,
    );

    if (!currentRoomId || rejectingRef.current || acceptingRef.current) {
      console.log(
        `${DEBUG_PREFIX} Reject validation failed - roomId:`,
        !!currentRoomId,
        'rejecting:',
        rejectingRef.current,
        'accepting:',
        acceptingRef.current,
      );
      return;
    }

    setRejecting(true);
    ringtoneManager.stopRingtone();
    Vibration.vibrate(50);

    try {
      const astroId = (store.getState().auth.user as any)?.id;
      await callSocketEmitters.rejectCall(astroId || 'unknown', currentRoomId);
      // console.log(`${DEBUG_PREFIX} Call rejected`);
    } catch (error) {
      console.log(`${DEBUG_PREFIX} Error rejecting call:`, error);
    }

    console.log(
      `[REJECT FLOW] Cleanup before resetCall - callState=${store.getState().call.callState}`,
    );
    webrtcService.cleanup('reject_call');
    dispatch(resetCall());
    console.log(
      `[REJECT FLOW] After resetCall - callState=${store.getState().call.callState}`,
    );
  }, [dispatch]);

  useEffect(() => {
    callActionBridge.setAcceptHandler(() => handleAccept());
    callActionBridge.setRejectHandler(() => handleReject());
    setAcceptTrigger(() => handleAccept());

    return () => {
      callActionBridge.setAcceptHandler(null);
      callActionBridge.setRejectHandler(null);
      setAcceptTrigger(null);
    };
  }, [handleAccept, handleReject]);

  // Button press animations
  const handleButtonPressIn = useCallback((scale: Animated.Value) => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleButtonPressOut = useCallback((scale: Animated.Value) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  // Reset animation values
  const resetAnimations = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(acceptProgress, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(rejectProgress, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, translateY, acceptProgress, rejectProgress]);

  // Accept button swipe
  const acceptButtonScale = useRef(new Animated.Value(1)).current;
  const acceptSwipeY = useRef(new Animated.Value(0)).current;


  const acceptPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !accepting && !rejecting,
      onMoveShouldSetPanResponder: () => !accepting && !rejecting,
      onPanResponderMove: (_evt, gestureState) => {
        if (gestureState.dy < 0) {
          const clampedDy = Math.max(gestureState.dy, -MAX_VERTICAL_SWIPE);
          acceptSwipeY.setValue(clampedDy);
          const progress = Math.min(
            Math.abs(clampedDy) / MAX_VERTICAL_SWIPE,
            1,
          );
          acceptProgress.setValue(progress);
        }
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dy < -MAX_VERTICAL_SWIPE) {
          handleAccept();
        }
        Animated.spring(acceptSwipeY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        acceptProgress.setValue(0);
      },
    }),
  ).current;

  // Reject button swipe
  const rejectButtonScale = useRef(new Animated.Value(1)).current;
  const rejectSwipeY = useRef(new Animated.Value(0)).current;

  const rejectPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !accepting && !rejecting,
      onMoveShouldSetPanResponder: () => !accepting && !rejecting,
      onPanResponderMove: (_evt, gestureState) => {
        if (gestureState.dy < 0) {
          const clampedDy = Math.max(gestureState.dy, -MAX_VERTICAL_SWIPE);
          rejectSwipeY.setValue(clampedDy);
          const progress = Math.min(
            Math.abs(clampedDy) / MAX_VERTICAL_SWIPE,
            1,
          );
          rejectProgress.setValue(progress);
        }
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dy < -MAX_VERTICAL_SWIPE) {
          handleReject();
        }
        Animated.spring(rejectSwipeY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        rejectProgress.setValue(0);
      },
    }),
  ).current;

  // PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);

        // Calculate progress for visual feedback
        const absX = Math.abs(gestureState.dx);
        const absY = Math.abs(gestureState.dy);

        if (gestureState.dx > 0) {
          acceptProgress.setValue(Math.min(absX / MAX_DISTANCE, 1));
        } else {
          const distance = Math.sqrt(absX * absX + absY * absY);
          rejectProgress.setValue(Math.min(distance / MAX_DISTANCE, 1));
        }
      },
      onPanResponderRelease: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        const absX = Math.abs(gestureState.dx);
        const absY = Math.abs(gestureState.dy);
        const shouldAccept =
          gestureState.dx > SWIPE_THRESHOLD && acceptProgress.getValue() > 0.6;
        const shouldReject = absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD;

        if (shouldAccept) {
          handleAccept();
        } else if (shouldReject) {
          handleReject();
        }

        resetAnimations();
      },
    }),
  ).current;

  // Animated styles
  const animatedCardStyle = {
    transform: [
      { translateX: translateX },
      { translateY: translateY },
      { scale: cardScale },
    ],
  };

  const animatedBackgroundStyle = {
    opacity: backgroundOpacity,
  };

  const animatedPulseStyle = {
    transform: [{ scale: pulseScale }],
    opacity: pulseOpacity,
  };

  const animatedButtonStyle = {
    transform: [{ scale: buttonScale }],
  };

  const acceptIndicatorStyle = {
    opacity: acceptProgress,
    transform: [
      {
        scale: acceptProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  };

  const rejectIndicatorStyle = {
    opacity: rejectProgress,
    transform: [
      {
        scale: rejectProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  };


  // new for cleanup
  useEffect(() => {
    if (!visible) {
      setAccepting(false);
      setRejecting(false);

      translateX.setValue(0);
      translateY.setValue(0);

      acceptProgress.setValue(0);
      rejectProgress.setValue(0);

      acceptSwipeY.setValue(0);
      rejectSwipeY.setValue(0);

      acceptButtonScale.setValue(1);
      rejectButtonScale.setValue(1);

      buttonScale.setValue(1);
    }
  }, [
    visible,
    translateX,
    translateY,
    acceptProgress,
    rejectProgress,
    acceptSwipeY,
    rejectSwipeY,
    acceptButtonScale,
    rejectButtonScale,
    buttonScale,
  ]);

  const waveAnimationStyle = {
    transform: [{ scale: waveScale }],
    opacity: waveOpacity,
  };

  if (!visible || !participant) {
    return null;
  }

  const initials = participant.name
    ? participant.name.charAt(0).toUpperCase()
    : '?';


  return (
    <Animated.View
      style={[styles.fullScreenContainer, animatedBackgroundStyle]}>
      <BlurView
        style={StyleSheet.absoluteFillObject}
        blurType={theme.mode === 'dark' ? 'dark' : 'light'}
        blurAmount={20}
        reducedTransparencyFallbackColor={theme.colors.background}
      />
      <LinearGradient
        colors={
          theme.mode === 'dark'
            ? ['rgba(15, 15, 35, 0.95)', 'rgba(22, 22, 42, 0.98)']
            : ['rgba(255, 255, 255, 0.95)', 'rgba(245, 245, 247, 0.98)']
        }
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.contentContainer} pointerEvents="box-none">
        <View style={styles.topSection}>
          <Text style={styles.incomingLabel}>Incoming Voice Call</Text>
          <RingingText visible={visible && !accepting && !rejecting} />
          {visible && !accepting && !rejecting && (
            <Text style={styles.countdownText}>
              Auto-disconnect in {remainingTime}s
            </Text>
          )}
        </View>

        <View style={styles.avatarSection}>
          <Animated.View style={[styles.pulseRing, animatedPulseStyle]} />
          <Animated.View style={[styles.pulseRing2, animatedPulseStyle]} />
          <Animated.View style={[styles.waveRing, waveAnimationStyle]} />

          <Animated.View
            style={animatedCardStyle}
            {...panResponder.panHandlers}>
            <Animated.View
              style={[styles.avatarContainer, animatedButtonStyle]}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: theme.colors.primary },
                ]}>
                <Text style={[styles.avatarText, { color: theme.colors.white }]}>
                  {initials}
                </Text>
              </View>
            </Animated.View>
          </Animated.View>

          <Animated.View style={[styles.acceptIndicator, acceptIndicatorStyle]}>
            <View
              style={[
                styles.indicatorCircle,
                { backgroundColor: theme.colors.success + '40' },
              ]}>
              <Text
                style={[styles.indicatorText, { color: theme.colors.success }]}>
                Accept
              </Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.rejectIndicator, rejectIndicatorStyle]}>
            <View
              style={[
                styles.indicatorCircle,
                { backgroundColor: theme.colors.error + '40' },
              ]}>
              <Text style={[styles.indicatorText, { color: theme.colors.error }]}>
                Reject
              </Text>
            </View>
          </Animated.View>
        </View>

        <View style={styles.infoSection}>
          <Text
            style={[styles.userName, { color: theme.colors.text }]}
            numberOfLines={1}>
            {participant.name}
          </Text>
          <Text style={[styles.callLabel, { color: theme.colors.textSecondary }]}>
            Incoming Voice Call
          </Text>
        </View>
      </View>

      <View style={styles.buttonSection} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.declineButton,
            { backgroundColor: theme.colors.error + '20' },
            {
              transform: [
                { translateY: rejectSwipeY },
                { scale: rejectButtonScale },
              ],
            },
          ]}
          {...rejectPanResponder.panHandlers}>
          <Animated.View
            style={[styles.declineIcon, { backgroundColor: theme.colors.error }]}>
            <Icon name="call-end" size={28} color="#FFFFFF" />
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[
            styles.acceptButton,
            { backgroundColor: theme.colors.success + '20' },
            {
              transform: [
                { translateY: acceptSwipeY },
                { scale: acceptButtonScale },
              ],
            },
          ]}
          {...acceptPanResponder.panHandlers}>
          <Animated.View
            style={[
              styles.acceptIcon,
              { backgroundColor: theme.colors.success },
            ]}>
            <Icon name="call" size={28} color="#FFFFFF" />
          </Animated.View>
        </Animated.View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 99999,
    elevation: 99999,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 100,
  },
  topSection: {
    alignItems: 'center',
  },
  incomingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  ringingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  countdownText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
    marginTop: 4,
  },
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'rgba(139, 133, 255, 0.3)',
  },
  pulseRing2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(139, 133, 255, 0.2)',
  },
  waveRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: 'rgba(139, 133, 255, 0.15)',
  },
  avatarContainer: {
    zIndex: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
  },
  acceptIndicator: {
    position: 'absolute',
    right: -60,
    top: '50%',
    marginTop: -20,
  },
  rejectIndicator: {
    position: 'absolute',
    left: -60,
    top: '50%',
    marginTop: -20,
  },
  indicatorCircle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  callLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  swipeHintContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  swipeHintText: {
    fontSize: 12,
    fontWeight: '500',
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 60,
    paddingBottom: 60,
    gap: 40,
  },
  declineButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React, { useCallback, useState, useEffect, useRef, memo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../../store';
import {
  clearChatRequests,
  endChatSession,
  removeChatRequest,
  resetChatStatus,
  setActiveSession,
} from '../../store/slices/chatSlice';
import { chatSocketService } from '../../features/chat/data/chatSocketService';
import { AUTO_REJECT_TIME_MS } from '../../features/chat/domain/chatEvents';
import {
  getOrCreateTraceId,
  logTrace,
} from '../../debug/chatAcceptInstrumentation';
import { useTheme } from '../../hooks/useTheme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import {
  setAcceptChatTrigger,
  setRejectChatTrigger,
} from './chatRequestCardTriggers';
import { ringtoneManager } from '../../services/call/ringtoneManager';

interface ChatRequestCardProps {
  onChatStarted?: (data: {
    roomId: string;
    userId: string;
    userName: string;
    maximumTime: number;
  }) => void;
}

type ChatRequestCardNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export const ChatRequestCard: React.FC<ChatRequestCardProps> = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<ChatRequestCardNavigationProp>();
  const { theme } = useTheme();
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAnimatingRef = useRef(false);
  const ringingSessionIdRef = useRef<string | null>(null);

  const { chatStatus, connecting, latestRequest } = useSelector(
    (state: RootState) => state.chat,
  );

  // Popup selector logic (STRICT):
  // Popup depends ONLY on:
  //   (chatStatus === 'REQUEST' && latestRequest != null)
  // No dependency on connecting, chatRequests length, or activeSession.
  const popupShouldShow =
    chatStatus === 'REQUEST' && latestRequest != null;

  const latestRequestSessionId = latestRequest?.sessionId;

  // Reuse the exact same incoming-call ringtone behavior.
  // This ensures the "chat request" foreground popup rings and then stops
  // based on the same start/stop utility.
  useEffect(() => {
    if (!popupShouldShow || !latestRequestSessionId) {
      ringingSessionIdRef.current = null;
      ringtoneManager.stopRingtone();
      return;
    }

    if (ringingSessionIdRef.current !== latestRequestSessionId) {
      // Stop first to reset the internal ringtone timeout when requests
      // replace each other.
      ringtoneManager.stopRingtone();
      ringtoneManager.startRingtone(AUTO_REJECT_TIME_MS);
      ringingSessionIdRef.current = latestRequestSessionId;
    }
  }, [popupShouldShow, latestRequestSessionId]);

  // Ensure we never leave a ringtone running if this component unmounts.
  useEffect(() => {
    return () => {
      ringtoneManager.stopRingtone();
    };
  }, []);


  const closeCard = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    // Stop ringing immediately when the card is dismissed/hidden.
    ringtoneManager.stopRingtone();

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const stopPulseAnimation = useCallback(() => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  useEffect(() => {
    if (countdown <= 10 && countdown > 0) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
    return () => {
      stopPulseAnimation();
    };
  }, [countdown, startPulseAnimation, stopPulseAnimation]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: latestRequest ? 0 : -200,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(fadeAnim, {
        toValue: latestRequest ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [latestRequest, slideAnim, fadeAnim]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (latestRequest) {
      isAnimatingRef.current = false;
      // Fixed 30-second auto-dismiss window, aligned with the backend
      // AUTO_REJECT_TIME_MS. Previously the countdown was maximumTime * 60.
      const timerSeconds = AUTO_REJECT_TIME_MS / 1000;
      setCountdown(timerSeconds);
      const sessionId = latestRequest.sessionId;
      const roomId = latestRequest.roomId;

      console.log(
        `[ChatRequestCard] ChatRequestCard shown session=${sessionId} roomId=${roomId}`,
      );
      console.log(
        `[ChatRequestCard] timer started (${timerSeconds}s) session=${sessionId}`,
      );

      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }

            console.log(
              `[ChatRequestCard] timer expired (${timerSeconds}s) session=${sessionId}`,
            );

            closeCard();

            console.log(
              `[ChatRequestCard] ChatRequestCard auto-dismissed session=${sessionId}`,
            );

            setTimeout(async () => {
              try {
                await chatSocketService.rejectChat(sessionId, roomId);
              } catch (error) {
                // Silent fail
              }
              dispatch(removeChatRequest(sessionId));
            }, 250);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [latestRequest, dispatch, closeCard]);

  const handleAccept = useCallback(async () => {
    // console.log('[ACCEPT TRACE 3] handleAccept entered');
    // console.log({
    //   accepting,
    //   rejecting,
    //   isAnimating: isAnimatingRef.current,
    //   latestRequest,
    // });
    const traceId = getOrCreateTraceId();
    const stateBefore = (require('../../store').store as any).getState?.();
    const functionEntered = 'ChatRequestCard.handleAccept()';
    
    logTrace({
      traceId,
      timestamp: new Date().toISOString(),
      phase: 'handleAccept',
      functionEntered,
      payload: latestRequest,
      reduxStateBefore: stateBefore,
    });

    // if (!latestRequest) console.log('[ACCEPT TRACE BLOCK] latestRequest missing');
    // if (accepting) console.log('[ACCEPT TRACE BLOCK] accepting');
    // if (rejecting) console.log('[ACCEPT TRACE BLOCK] rejecting');
    // if (isAnimatingRef.current) console.log('[ACCEPT TRACE BLOCK] animating');
    if (!latestRequest || accepting || rejecting || isAnimatingRef.current) {
      // console.log('[ChatRequestCard] handleAccept() EARLY RETURN guard: !latestRequest=', !latestRequest, 'accepting=', accepting, 'rejecting=', rejecting, 'isAnimating=', isAnimatingRef.current);
      return;
    }

    if (!latestRequest?.roomId) {
      // console.warn('[ChatRequestCard] Invalid roomId, cannot navigate');
      dispatch(removeChatRequest(latestRequest.sessionId));
      return;
    }

    console.log(
      `[ChatRequestCard] user accepted request session=${latestRequest.sessionId} roomId=${latestRequest.roomId}`,
    );

    setAccepting(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    closeCard();

    setTimeout(async () => {
      const maxTime = latestRequest.maximumTime || 1;
      const sessionData = {
        sessionId: latestRequest.sessionId,
        roomId: latestRequest.roomId,
        userId: latestRequest.userId,
        userName: latestRequest.userName,
        userProfilePic: latestRequest.userProfilePic,
        astrologerId: latestRequest.astrologerId,
        astrologerName: latestRequest.astrologerName,
        astrologerProfilePic: latestRequest.astrologerProfilePic,
        startedAt: Date.now(),
        maximumTime: maxTime,
        pricePerMinute: latestRequest.pricePerMinute,
        remainingTime: maxTime * 60,
      };

      const traceIdForTimeout = traceId;

      try {
        const reduxBeforeActiveSession = (
          require('../../store').store as any
        ).getState?.();

        logTrace({
          traceId,
          timestamp: new Date().toISOString(),
          phase: 'before dispatch(setActiveSession)',
          functionEntered: 'ChatRequestCard.handleAccept() [setActiveSession]',
          payload: sessionData,
          reduxStateBefore: reduxBeforeActiveSession,
        });

        dispatch(setActiveSession(sessionData));

        const reduxAfterActiveSession = (
          require('../../store').store as any
        ).getState?.();
        logTrace({
          traceId,
          timestamp: new Date().toISOString(),
          phase: 'after dispatch(setActiveSession)',
          functionEntered: 'ChatRequestCard.handleAccept() [setActiveSession]',
          payload: sessionData,
          reduxStateBefore: reduxBeforeActiveSession,
          reduxStateAfter: reduxAfterActiveSession,
        });

        logTrace({
          traceId,
          timestamp: new Date().toISOString(),
          phase: 'before navigation.navigate',
          functionEntered: 'ChatRequestCard.handleAccept() [navigation]',
          payload: {
            name: 'ChatScreen',
            params: {
              roomId: latestRequest.roomId,
              userId: latestRequest.userId,
              userName: latestRequest.userName,
              maximumTime: latestRequest.maximumTime,
            },
          },
          reduxStateAfter: reduxAfterActiveSession,
        });

        // console.log('[ChatRequestCard] BEFORE navigation.navigate("ChatScreen")');
        navigation.navigate('ChatScreen', {
          roomId: latestRequest.roomId,
          userId: latestRequest.userId,
          userName: latestRequest.userName,
          maximumTime: latestRequest.maximumTime,
        });
        // console.log('[ChatRequestCard] AFTER navigation.navigate("ChatScreen")');

        logTrace({
          traceId,
          timestamp: new Date().toISOString(),
          phase: 'after navigation.navigate',
          functionEntered: 'ChatRequestCard.handleAccept() [navigation]',
          payload: {
            name: 'ChatScreen',
            params: {
              roomId: latestRequest.roomId,
              userId: latestRequest.userId,
              userName: latestRequest.userName,
              maximumTime: latestRequest.maximumTime,
            },
          },
          reduxStateAfter: (require('../../store').store as any).getState?.(),
        });

        logTrace({
          traceId,
          timestamp: new Date().toISOString(),
          phase: 'before acceptChatAstrologer',
          functionEntered:
            'ChatRequestCard.handleAccept() [acceptChatAstrologer]',
          payload: {
            sessionId: latestRequest.sessionId,
            roomId: latestRequest.roomId,
          },
        });

        // console.log('[ChatRequestCard] BEFORE chatSocketService.acceptChatAstrologer()', { sessionId: latestRequest.sessionId, roomId: latestRequest.roomId });
        // console.log('[ACCEPT TRACE 4] emitting accept');
        // console.log({
        //   sessionId: latestRequest.sessionId,
        //   roomId: latestRequest.roomId,
        // });
        await chatSocketService.acceptChatAstrologer( latestRequest.sessionId, latestRequest.roomId, latestRequest.userId, );
        // console.log('[ChatRequestCard] AFTER chatSocketService.acceptChatAstrologer() resolved');
      } catch (error) {
        logTrace({
          traceId: traceIdForTimeout,
          timestamp: new Date().toISOString(),
          phase: 'terminal: chat_rejected',
          functionEntered: 'ChatRequestCard.handleAccept() [catch]',
          payload: {
            error: (error as any)?.message ?? String(error),
            sessionId: latestRequest.sessionId,
          },
          reduxStateBefore: (require('../../store').store as any).getState?.(),
        });
        setAccepting(false);
        dispatch(removeChatRequest(latestRequest.sessionId));
      } finally {
        // Ensure local UI never gets stuck on the second request.
        // This must not affect socket/Redux success logic.
        setAccepting(false);
      }
    }, 250);
  }, [latestRequest, accepting, rejecting, dispatch, navigation, closeCard]);


  const handleReject = useCallback(async () => {
    // console.log('[ChatRequestCard] handleReject() START');
    // console.log('[ChatRequestCard] [DEBUG] reject latestRequest.sessionId=', latestRequest?.sessionId ?? 'undefined', 'rejecting=', rejecting, 'accepting=', accepting);
    if (!latestRequest || rejecting || accepting) {
      // console.log('[ChatRequestCard] handleReject() EARLY RETURN guard: !latestRequest=', !latestRequest, 'rejecting=', rejecting, 'accepting=', accepting);
      return;
    }

    // console.log('[ChatRequestCard] handleReject() PASSED guards -> proceeding to reject');
    console.log(
      `[ChatRequestCard] user rejected request session=${latestRequest.sessionId} roomId=${latestRequest.roomId}`,
    );
    setRejecting(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    closeCard();

    try {
      // console.log('[ChatRequestCard] BEFORE chatSocketService.rejectChat()', { sessionId: latestRequest.sessionId, roomId: latestRequest.roomId });
      await chatSocketService.rejectChat(
        latestRequest.sessionId,
        latestRequest.roomId,
      );
      // console.log('[ChatRequestCard] AFTER chatSocketService.rejectChat() resolved');
    } catch {
      // console.log(e);
    } finally {

      dispatch(removeChatRequest(latestRequest.sessionId));

      dispatch(endChatSession());

      dispatch(resetChatStatus());

      dispatch(clearChatRequests());

      setRejecting(false);

      setAccepting(false);

      isAnimatingRef.current = false;

      setCountdown(60);

      slideAnim.setValue(-200);

      fadeAnim.setValue(0);

      stopPulseAnimation();
    }
  }, [
    latestRequest,
    rejecting,
    accepting,
    dispatch,
    closeCard,
    slideAnim,
    fadeAnim,
    stopPulseAnimation,
  ]);

  // Expose the EXACT SAME Accept/Reject handlers to native pending actions
  // (OneSignal chat_request notifications). A native tap invokes these
  // registered handlers via the trigger, guaranteeing a single business
  // logic path identical to physically tapping the buttons.
  useEffect(() => {
    // console.log(`[ChatRequestCard] registerChatTriggers() RUN (captured sessionId=${latestRequest?.sessionId ?? 'undefined'}, chatStatus=${chatStatus})`);
    // console.log('[ACCEPT TRACE 1] register');
    // console.log({
    //   sessionId: latestRequest?.sessionId,
    //   roomId: latestRequest?.roomId,
    // });
    setAcceptChatTrigger(() => {
      // console.log('[ACCEPT TRACE 2] trigger invoked');
      // console.log(`[ChatRequestCard] registered ACCEPT trigger invoked (captured sessionId=${latestRequest?.sessionId ?? 'undefined'})`);
      handleAccept();
    });
    setRejectChatTrigger(() => {
      // console.log(`[ChatRequestCard] registered REJECT trigger invoked (captured sessionId=${latestRequest?.sessionId ?? 'undefined'})`);
      handleReject();
    });
    return () => {
      setAcceptChatTrigger(null);
      setRejectChatTrigger(null);
    };
  }, [handleAccept, handleReject]);

  if (!popupShouldShow) {
    return null;
  }


  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.primary,
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}>
      <View style={styles.cardContent}>
        <View style={styles.profileSection}>
          <View
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.avatarText, { color: theme.colors.white }]}>
              {latestRequest.userName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.timerContainer}>
            <Animated.View
              style={[
                styles.timerBadge,
                {
                  backgroundColor:
                    countdown <= 10 ? theme.colors.error : theme.colors.primary,
                  transform: [{ scale: pulseAnim }],
                },
              ]}>
              <Text style={styles.timerText}>{formatCountdown(countdown)}</Text>
            </Animated.View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text
            style={[styles.userName, { color: theme.colors.textPrimary }]}
            numberOfLines={1}>
            {latestRequest.userName}
          </Text>
          <Text
            style={[styles.location, { color: theme.colors.textSecondary }]}
            numberOfLines={1}>
            {latestRequest.issue || 'Chat Request'}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
              ⏱ {latestRequest.maximumTime} min
            </Text>
            <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
              💰 ₹{latestRequest.pricePerMinute}/min
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[
            styles.rejectButton,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderColor: theme.colors.error,
            },
          ]}
          onPress={handleReject}
          disabled={rejecting || accepting}
          activeOpacity={0.7}>
          <Text style={[styles.rejectButtonText, { color: theme.colors.error }]}>
            {rejecting ? '...' : 'Reject'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.acceptButton,
            {
              backgroundColor: accepting
                ? theme.colors.textTertiary
                : theme.colors.primary,
            },
          ]}
          onPress={handleAccept}
          disabled={accepting || rejecting}
          activeOpacity={0.7}>
          <Text style={[styles.acceptButtonText, { color: theme.colors.white }]}>
            {accepting ? 'Accepting...' : 'Accept'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    zIndex: 999,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  profileSection: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  timerContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  timerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 40,
    alignItems: 'center',
  },
  timerText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  acceptButton: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ChatRequestCard;

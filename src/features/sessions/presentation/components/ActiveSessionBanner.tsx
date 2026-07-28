import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { AppButton } from '../../../../components/common/AppButton';
import { useTheme } from '../../../../hooks/useTheme';
import { Session, SessionType } from '../../domain/types';

interface ActiveSessionBannerProps {
  session: Session | null;
  onJoin: (session: Session) => void;
}

const formatTime = (isoTime: string): string => {
  const date = new Date(isoTime);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const ActiveSessionBanner: React.FC<ActiveSessionBannerProps> = ({
  session,
  onJoin,
}) => {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (session) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();

      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      );
      glowAnimation.start();

      return () => {
        pulseAnimation.stop();
        glowAnimation.stop();
      };
    }
  }, [session, pulseAnim, glowAnim]);

  if (!session) return null;

  const typeIcon = session.type === SessionType.CHAT ? 'chat' : 'phone';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.success,
          transform: [{ scale: pulseAnim }],
        },
      ]}>
      <Animated.View
        style={[
          styles.glowEffect,
          {
            backgroundColor: theme.colors.success,
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.15],
            }),
          },
        ]}
      />
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.successLight },
            ]}>
            <Icon
              name="fiber-manual-record"
              size={12}
              color={theme.colors.success}
            />
          </View>
          <View style={styles.textContent}>
            <View style={styles.headerRow}>
              <AppText
                variant="caption"
                color={theme.colors.success}
                style={styles.liveLabel}>
                LIVE SESSION
              </AppText>
              <View style={styles.pulsingDot} />
            </View>
            <AppText
              variant="body1"
              color={theme.colors.text}
              style={styles.userName}>
              {session.userName}
            </AppText>
            <View style={styles.metaRow}>
              <Icon
                name={typeIcon}
                size={12}
                color={theme.colors.textSecondary}
              />
              <AppText
                variant="caption"
                color={theme.colors.textSecondary}
                style={styles.metaText}>
                {session.type === SessionType.CHAT ? 'Chat' : 'Call'} • Started
                at {formatTime(session.startTime)}
              </AppText>
            </View>
          </View>
        </View>
        <View style={styles.rightSection}>
          <View style={styles.earningsContainer}>
            <AppText variant="caption" color={theme.colors.textTertiary}>
              Earnings
            </AppText>
            <AppText variant="h5" color={theme.colors.success}>
              ₹{session.earnings}
            </AppText>
          </View>
          <TouchableOpacity
            style={[
              styles.joinButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => onJoin(session)}
            activeOpacity={0.7}>
            <Icon name={typeIcon} size={16} color={theme.colors.white} />
            <AppText
              variant="caption"
              color={theme.colors.white}
              style={styles.joinText}>
              {session.type === SessionType.CHAT ? 'Open Chat' : 'Join Call'}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    marginLeft: 12,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveLabel: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  userName: {
    fontWeight: '600',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  metaText: {
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  earningsContainer: {
    alignItems: 'flex-end',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  joinText: {
    fontWeight: '600',
  },
});

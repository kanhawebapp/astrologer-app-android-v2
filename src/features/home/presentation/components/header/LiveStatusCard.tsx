import React, { memo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../../hooks/useTheme';
import { spacing, borderRadius } from './theme/timeThemeColors';
import { LiveStatus } from '../../domain/types';
import { StatusIndicator } from './StatusIndicator';
import { SessionTypeBadges } from './SessionTypeBadges';
import { AppText } from '../../../../components/common/AppText';

interface LiveStatusCardProps {
  liveStatus: LiveStatus;
  shimmerStyle?: {
    opacity: Animated.AnimatedInterpolation<number>;
  };
  floatStyle?: {
    transform: Array<{ translateY: Animated.AnimatedInterpolation<number> }>;
  };
  pulseStyle?: {
    transform: Array<{ scale: Animated.AnimatedInterpolation<number> }>;
  };
}

const activeSessionTypes = (status: LiveStatus): string[] => {
  const types: string[] = [];
  if (status.chatEnabled) types.push('Chat');
  if (status.callEnabled) types.push('Call');
  if (status.videoEnabled) types.push('Video');
  return types;
};

export const LiveStatusCard: React.FC<LiveStatusCardProps> = memo(
  ({ liveStatus, shimmerStyle, floatStyle, pulseStyle }) => {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';

    return (
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: liveStatus.isOnline
              ? isDark
                ? 'rgba(16, 185, 129, 0.08)'
                : 'rgba(16, 185, 129, 0.04)'
              : isDark
              ? 'rgba(30, 30, 55, 0.9)'
              : 'rgba(245, 245, 247, 0.95)',
            borderColor: liveStatus.isOnline
              ? 'transparent'
              : isDark
              ? 'rgba(55, 65, 81, 0.4)'
              : 'rgba(229, 231, 235, 0.8)',
          },
          floatStyle,
        ]}>
        {liveStatus.isOnline && (
          <View style={styles.gradientBorder}>
            <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />
          </View>
        )}

        {liveStatus.isOnline && (
          <Animated.View style={[styles.glowBackground, shimmerStyle]} />
        )}

        <View style={styles.left}>
          <StatusIndicator
            isOnline={liveStatus.isOnline}
            pulseStyle={pulseStyle}
          />
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <AppText
                variant="body1"
                style={{
                  color: theme.colors.text,
                  fontWeight: '800',
                  fontSize: 17,
                }}>
                {liveStatus.isOnline ? '🟢 You are Live' : '⚫ You are Offline'}
              </AppText>
            </View>
            <AppText
              variant="caption"
              style={{
                color: theme.colors.textSecondary,
                marginTop: 3,
              }}>
              {liveStatus.isOnline
                ? 'Users are connecting with you'
                : liveStatus.chatEnabled ||
                  liveStatus.callEnabled ||
                  liveStatus.videoEnabled
                ? `${activeSessionTypes(liveStatus).join(' • ')} available`
                : 'Go live to start earning'}
            </AppText>
          </View>
        </View>

        {!liveStatus.isOnline &&
          (liveStatus.chatEnabled ||
            liveStatus.callEnabled ||
            liveStatus.videoEnabled) && (
            <TouchableOpacity style={styles.goLiveButton}>
              <Icon name="radio-button-checked" size={16} color="#FFFFFF" />
              <AppText variant="caption" style={styles.goLiveText}>
                Go Live
              </AppText>
            </TouchableOpacity>
          )}

        <View style={styles.right}>
          <SessionTypeBadges liveStatus={liveStatus} />
        </View>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.xxl,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  gradientBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xxl,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#10B981',
  },
  glowBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  goLiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  goLiveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  right: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    maxWidth: '40%',
  },
});

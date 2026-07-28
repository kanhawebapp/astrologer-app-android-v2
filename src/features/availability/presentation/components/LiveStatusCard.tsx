import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { LiveSession } from '../../domain/liveTypes';

interface LiveStatusCardProps {
  currentLive: LiveSession | null;
  onEndLive: (sessionId: string) => void;
  formattedDuration: string;
  isLoading?: boolean;
}

export const LiveStatusCard: React.FC<LiveStatusCardProps> = ({
  currentLive,
  onEndLive,
  formattedDuration,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentLive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      pulseAnim.setValue(1);
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentLive, pulseAnim, glowAnim]);

  if (!currentLive) {
    return null;
  }

  const handleEndLive = () => {
    onEndLive(currentLive.id);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          transform: [{ scale: pulseAnim }],
        },
      ]}>
      <Animated.View
        style={[
          styles.glowBackground,
          {
            backgroundColor: theme.colors.error + '20',
            opacity: glowAnim,
          },
        ]}
      />

      <View style={styles.header}>
        <View style={styles.liveIndicator}>
          <View style={styles.redDot} />
          <AppText variant="caption" color={theme.colors.error}>
            LIVE
          </AppText>
        </View>
        <View
          style={[
            styles.durationBadge,
            { backgroundColor: theme.colors.errorLight },
          ]}>
          <Icon name="time-outline" size={14} color={theme.colors.error} />
          <AppText variant="caption" color={theme.colors.error}>
            {formattedDuration}
          </AppText>
        </View>
      </View>

      <AppText variant="h4" color={theme.colors.text} style={styles.title}>
        {currentLive.title}
      </AppText>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Icon name="eye-outline" size={18} color={theme.colors.primary} />
          <AppText variant="body2" color={theme.colors.textSecondary}>
            {currentLive.stats.viewers}
          </AppText>
          <AppText variant="caption" color={theme.colors.textTertiary}>
            viewers
          </AppText>
        </View>
        <View style={styles.statItem}>
          <Icon name="heart-outline" size={18} color={theme.colors.primary} />
          <AppText variant="body2" color={theme.colors.textSecondary}>
            {currentLive.stats.likes}
          </AppText>
          <AppText variant="caption" color={theme.colors.textTertiary}>
            likes
          </AppText>
        </View>
        <View style={styles.statItem}>
          <Icon name="cash-outline" size={18} color={theme.colors.success} />
          <AppText variant="body2" color={theme.colors.textSecondary}>
            ₹{currentLive.stats.earnings}
          </AppText>
          <AppText variant="caption" color={theme.colors.textTertiary}>
            earned
          </AppText>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.endButton, { backgroundColor: theme.colors.error }]}
        onPress={handleEndLive}
        disabled={isLoading}
        activeOpacity={0.8}>
        <Icon name="close" size={20} color={theme.colors.white} />
        <AppText variant="button" color={theme.colors.white}>
          END LIVE
        </AppText>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  glowBackground: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    borderRadius: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 6,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  title: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
});

export default LiveStatusCard;

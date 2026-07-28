import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { Availability } from '../../domain/types';
import { AvailabilityStatus } from '../../domain/enums';

interface OnlineStatusCardProps {
  availability: Availability;
  onToggleOnline: (isOnline: boolean) => void;
  isLoading?: boolean;
}

export const OnlineStatusCard: React.FC<OnlineStatusCardProps> = ({
  availability,
  onToggleOnline,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (availability.isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
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
  }, [availability.isOnline, pulseAnim, glowAnim]);

  const handleToggle = () => {
    onToggleOnline(!availability.isOnline);
  };

  const statusColor = availability.isOnline
    ? theme.colors.success
    : theme.colors.textTertiary;

  const isOnlineStatus =
    availability.status === AvailabilityStatus.ONLINE || availability.isOnline;

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
            backgroundColor: theme.colors.successLight,
            opacity: glowAnim,
          },
        ]}
      />

      <View style={styles.statusHeader}>
        <View style={styles.statusInfo}>
          <Animated.View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: statusColor,
              },
            ]}
          />
          <AppText variant="h4" color={theme.colors.text}>
            {isOnlineStatus ? 'Online' : 'Offline'}
          </AppText>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isOnlineStatus
                ? theme.colors.successLight
                : theme.colors.surfaceSecondary,
            },
          ]}>
          <Icon
            name={isOnlineStatus ? 'checkmark-circle' : 'close-circle'}
            size={14}
            color={statusColor}
          />
          <AppText
            variant="caption"
            color={statusColor}
            style={styles.badgeText}>
            {availability.currentSessions} active
          </AppText>
        </View>
      </View>

      <AppText
        variant="body2"
        color={theme.colors.textSecondary}
        style={styles.subtitle}>
        {availability.isOnline
          ? 'You are visible to clients and can receive sessions'
          : 'You are currently not accepting any sessions'}
      </AppText>

      <TouchableOpacity
        style={[
          styles.toggleButton,
          {
            backgroundColor: availability.isOnline
              ? theme.colors.success
              : theme.colors.surfaceSecondary,
          },
        ]}
        onPress={handleToggle}
        disabled={isLoading}
        activeOpacity={0.8}>
        <View style={styles.toggleContent}>
          <Icon
            name={availability.isOnline ? 'power' : 'power'}
            size={24}
            color={
              availability.isOnline
                ? theme.colors.white
                : theme.colors.textTertiary
            }
          />
          <AppText
            variant="button"
            color={
              availability.isOnline
                ? theme.colors.white
                : theme.colors.textTertiary
            }>
            {availability.isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
          </AppText>
        </View>
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    marginLeft: 4,
  },
  subtitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  toggleButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

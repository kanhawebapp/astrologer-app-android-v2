import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../../components/common/AppText';
import { useTheme } from '../../../../../hooks/useTheme';
import { spacing, borderRadius } from './theme/timeThemeColors';

interface NotificationButtonProps {
  notificationCount: number;
  onPress: () => void;
  animatedStyle?: {
    transform: Array<{ scale: Animated.AnimatedInterpolation<number> }>;
  };
}

export const NotificationButton: React.FC<NotificationButtonProps> = memo(
  ({ notificationCount, onPress, animatedStyle }) => {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';
    const pulseRef = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      if (notificationCount > 0) {
        const pulse = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseRef, {
              toValue: 1.08,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(pulseRef, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        );
        pulse.start();
        return () => pulse.stop();
      }
    }, [notificationCount, pulseRef]);

    const glassColors = isDark
      ? [
          'rgba(255, 255, 255, 0.08)',
          'rgba(255, 255, 255, 0.03)',
          'rgba(139, 133, 255, 0.08)',
        ]
      : [
          'rgba(255, 255, 255, 0.85)',
          'rgba(255, 255, 255, 0.6)',
          'rgba(248, 248, 255, 0.75)',
        ];

    return (
      <Animated.View
        style={[animatedStyle, { transform: [{ scale: pulseRef }] }]}>
        <TouchableOpacity
          style={styles.container}
          onPress={onPress}
          activeOpacity={0.7}>
          <LinearGradient
            colors={glassColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glass}
            borderRadius={borderRadius.xl}>
            <View style={styles.glassHighlight} />
            <View
              style={[
                styles.border,
                {
                  borderColor: isDark
                    ? 'rgba(139, 133, 255, 0.25)'
                    : 'rgba(108, 99, 255, 0.15)',
                },
              ]}
            />
            <Icon
              name="notifications-none"
              size={24}
              color={theme.colors.text}
              style={styles.icon}
            />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <View style={styles.badgeInner}>
                  <AppText variant="caption" style={styles.badgeText}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </AppText>
                </View>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: '#8B85FF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  glass: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 21,
    marginTop: 18.3,
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: '15%',
    right: '15%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  icon: {
    zIndex: 2,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm - 2,
    right: spacing.sm - 2,
    zIndex: 10,
  },
  badgeInner: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#EF4444',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../../components/common/AppText';
import { spacing, borderRadius } from './theme/timeThemeColors';

interface PremiumBadgeProps {
  visible?: boolean;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = memo(
  ({ visible = true }) => {
    const shineAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const shine = Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(shineAnim, {
            toValue: 0,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
      shine.start();
      return () => shine.stop();
    }, [shineAnim]);

    useEffect(() => {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
      shimmer.start();
      return () => shimmer.stop();
    }, [shimmerAnim]);

    if (!visible) return null;

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#F7971E', '#FFD200', '#F7971E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
          borderRadius={borderRadius.lg}>
          <Animated.View
            style={[
              styles.shimmer,
              {
                opacity: shimmerAnim,
                transform: [
                  {
                    translateX: shineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 80],
                    }),
                  },
                ],
              },
            ]}
          />
        </LinearGradient>
        <View style={styles.content}>
          <Icon name="auto-awesome" size={10} color="#FFFFFF" />
          <AppText variant="caption" style={styles.text}>
            PREMIUM
          </AppText>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 25,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ skewX: '-20deg' }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    gap: spacing.xs,
  },
  text: {
    fontWeight: '800',
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

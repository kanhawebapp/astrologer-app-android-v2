import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
  scale?: boolean;
  scaleFrom?: number;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  duration = 800,
  style,
  scale = false,
  scaleFrom = 0.85,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(scaleFrom)).current;

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ];

    if (scale) {
      animations.push(
        Animated.timing(scaleValue, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        }),
      );
    }

    Animated.parallel(animations).start();
  }, [opacity, scaleValue, delay, duration, scale]);

  const animatedStyle: ViewStyle = {
    opacity,
    ...(scale && {
      transform: [{ scale: scaleValue }],
    }),
  };

  return (
    <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  );
};

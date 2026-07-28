import React, { useMemo, useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animDuration: number;
  animDelay: number;
}

const STAR_COUNT = 80;

const generateStars = (): Star[] => {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    size: Math.random() * 2.5 + 0.5,
    opacity: Math.random() * 0.6 + 0.2,
    animDuration: Math.random() * 3000 + 2000,
    animDelay: Math.random() * 4000,
  }));
};

const StarDot: React.FC<{ star: Star }> = React.memo(({ star }) => {
  const opacityAnim = useRef(new Animated.Value(star.opacity)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: star.opacity * 0.2,
          duration: star.animDuration,
          delay: star.animDelay,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: star.opacity,
          duration: star.animDuration,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [opacityAnim, star.opacity, star.animDuration, star.animDelay]);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          opacity: opacityAnim,
        },
      ]}
    />
  );
});

StarDot.displayName = 'StarDot';

export const StarField: React.FC = () => {
  const stars = useMemo(() => generateStars(), []);

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map(star => (
        <StarDot key={star.id} star={star} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});

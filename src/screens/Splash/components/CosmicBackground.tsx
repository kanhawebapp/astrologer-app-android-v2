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

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  length: number;
  duration: number;
  delay: number;
}

interface NebulaBlob {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  animDuration: number;
}

const STAR_COUNT = 120;
const SHOOTING_STAR_COUNT = 4;
const NEBULA_COUNT = 5;

const generateStars = (): Star[] => {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    size: Math.random() * 2.5 + 0.5,
    opacity: Math.random() * 0.7 + 0.15,
    animDuration: Math.random() * 3000 + 2000,
    animDelay: Math.random() * 5000,
  }));
};

const generateShootingStars = (): ShootingStar[] => {
  return Array.from({ length: SHOOTING_STAR_COUNT }, (_, i) => ({
    id: i,
    startX: Math.random() * SCREEN_WIDTH * 0.6,
    startY: Math.random() * SCREEN_HEIGHT * 0.3,
    angle: Math.random() * 30 + 15,
    length: Math.random() * 80 + 60,
    duration: Math.random() * 1200 + 800,
    delay: Math.random() * 8000 + i * 3000,
  }));
};

const generateNebulae = (): NebulaBlob[] => {
  const colors = [
    'rgba(139, 92, 246, 0.08)',
    'rgba(108, 99, 255, 0.06)',
    'rgba(212, 175, 55, 0.04)',
    'rgba(139, 133, 255, 0.05)',
    'rgba(99, 102, 241, 0.07)',
  ];
  return Array.from({ length: NEBULA_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    size: Math.random() * 200 + 100,
    color: colors[i % colors.length],
    opacity: Math.random() * 0.5 + 0.3,
    animDuration: Math.random() * 6000 + 4000,
  }));
};

const StarDot: React.FC<{ star: Star }> = React.memo(({ star }) => {
  const opacityAnim = useRef(new Animated.Value(star.opacity)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const opacityLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: star.opacity * 0.15,
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

    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.4,
          duration: star.animDuration * 1.2,
          delay: star.animDelay + 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: star.animDuration * 1.2,
          useNativeDriver: true,
        }),
      ]),
    );

    opacityLoop.start();
    scaleLoop.start();
    return () => {
      opacityLoop.stop();
      scaleLoop.stop();
    };
  }, [opacityAnim, scaleAnim, star.opacity, star.animDuration, star.animDelay]);

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
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
});

StarDot.displayName = 'StarDot';

const ShootingStarElement: React.FC<{ star: ShootingStar }> = React.memo(
  ({ star }) => {
    const progress = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const runAnimation = () => {
        opacity.setValue(0);
        progress.setValue(0);

        Animated.sequence([
          Animated.delay(star.delay),
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(progress, {
              toValue: 1,
              duration: star.duration,
              easing: Easing ? Easing.out(Easing.quad) : undefined,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => runAnimation());
      };

      runAnimation();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, star.length * Math.cos((star.angle * Math.PI) / 180)],
    });

    const translateY = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, star.length * Math.sin((star.angle * Math.PI) / 180)],
    });

    return (
      <Animated.View
        style={[
          styles.shootingStarContainer,
          {
            left: star.startX,
            top: star.startY,
            opacity,
            transform: [{ translateX }, { translateY }],
          },
        ]}>
        <View style={styles.shootingStarHead} />
        <View
          style={[
            styles.shootingStarTail,
            {
              width: star.length * 0.6,
              transform: [{ rotate: `${star.angle}deg` }],
            },
          ]}
        />
      </Animated.View>
    );
  },
);

ShootingStarElement.displayName = 'ShootingStarElement';

const NebulaBlobElement: React.FC<{ nebula: NebulaBlob }> = React.memo(
  ({ nebula }) => {
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: nebula.animDuration,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: nebula.animDuration,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }, [pulseAnim, nebula.animDuration]);

    const scale = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.15],
    });

    const opacityVal = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [nebula.opacity * 0.7, nebula.opacity],
    });

    return (
      <Animated.View
        style={[
          styles.nebula,
          {
            left: nebula.x - nebula.size / 2,
            top: nebula.y - nebula.size / 2,
            width: nebula.size,
            height: nebula.size,
            borderRadius: nebula.size / 2,
            backgroundColor: nebula.color,
            opacity: opacityVal,
            transform: [{ scale }],
          },
        ]}
      />
    );
  },
);

NebulaBlobElement.displayName = 'NebulaBlobElement';

import { Easing } from 'react-native';

export const CosmicBackground: React.FC = () => {
  const stars = useMemo(() => generateStars(), []);
  const shootingStars = useMemo(() => generateShootingStars(), []);
  const nebulae = useMemo(() => generateNebulae(), []);

  return (
    <View style={styles.container} pointerEvents="none">
      {nebulae.map(n => (
        <NebulaBlobElement key={`nebula-${n.id}`} nebula={n} />
      ))}
      {stars.map(star => (
        <StarDot key={star.id} star={star} />
      ))}
      {shootingStars.map(s => (
        <ShootingStarElement key={`shoot-${s.id}`} star={s} />
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
  shootingStarContainer: {
    position: 'absolute',
  },
  shootingStarHead: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  shootingStarTail: {
    position: 'absolute',
    top: 1,
    left: -60,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 0.5,
  },
  nebula: {
    position: 'absolute',
  },
});

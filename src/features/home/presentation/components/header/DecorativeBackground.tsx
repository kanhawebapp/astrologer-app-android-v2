import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface DecorativeBackgroundProps {
  timeOfDay: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const STAR_POSITIONS = [
  { left: SCREEN_WIDTH * 0.15, top: SCREEN_HEIGHT * 0.08 },
  { left: SCREEN_WIDTH * 0.35, top: SCREEN_HEIGHT * 0.05 },
  { left: SCREEN_WIDTH * 0.55, top: SCREEN_HEIGHT * 0.1 },
  { left: SCREEN_WIDTH * 0.7, top: SCREEN_HEIGHT * 0.03 },
  { left: SCREEN_WIDTH * 0.25, top: SCREEN_HEIGHT * 0.15 },
  { left: SCREEN_WIDTH * 0.6, top: SCREEN_HEIGHT * 0.12 },
  { left: SCREEN_WIDTH * 0.8, top: SCREEN_HEIGHT * 0.18 },
];

const STAR_SIZES = [2.5, 2, 3, 2, 2.5, 2, 2];

const Star: React.FC<{
  index: number;
  opacityAnim: Animated.Value;
  scaleAnim: Animated.Value;
}> = memo(({ index, opacityAnim, scaleAnim }) => {
  const position = STAR_POSITIONS[index];
  const size = STAR_SIZES[index];

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: position.left,
          top: position.top,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
});

export const DecorativeBackground: React.FC<DecorativeBackgroundProps> = memo(
  ({ timeOfDay }) => {
    const breathingAnim = useRef(new Animated.Value(0)).current;
    const glowPulseAnim = useRef(new Animated.Value(0)).current;
    const moonOpacityAnim = useRef(new Animated.Value(0)).current;
    const star1Opacity = useRef(new Animated.Value(0.4)).current;
    const star1Scale = useRef(new Animated.Value(0.9)).current;
    const star2Opacity = useRef(new Animated.Value(0.4)).current;
    const star2Scale = useRef(new Animated.Value(0.9)).current;
    const star3Opacity = useRef(new Animated.Value(0.4)).current;
    const star3Scale = useRef(new Animated.Value(0.9)).current;
    const star4Opacity = useRef(new Animated.Value(0.4)).current;
    const star4Scale = useRef(new Animated.Value(0.9)).current;
    const star5Opacity = useRef(new Animated.Value(0.4)).current;
    const star5Scale = useRef(new Animated.Value(0.9)).current;
    const star6Opacity = useRef(new Animated.Value(0.4)).current;
    const star6Scale = useRef(new Animated.Value(0.9)).current;
    const star7Opacity = useRef(new Animated.Value(0.4)).current;
    const star7Scale = useRef(new Animated.Value(0.9)).current;

    const starAnimations = [
      { opacityAnim: star1Opacity, scaleAnim: star1Scale, delay: 400 },
      { opacityAnim: star2Opacity, scaleAnim: star2Scale, delay: 800 },
      { opacityAnim: star3Opacity, scaleAnim: star3Scale, delay: 1200 },
      { opacityAnim: star4Opacity, scaleAnim: star4Scale, delay: 1600 },
      { opacityAnim: star5Opacity, scaleAnim: star5Scale, delay: 2000 },
      { opacityAnim: star6Opacity, scaleAnim: star6Scale, delay: 2400 },
      { opacityAnim: star7Opacity, scaleAnim: star7Scale, delay: 2800 },
    ];

    useEffect(() => {
      const breathing = Animated.loop(
        Animated.sequence([
          Animated.timing(breathingAnim, {
            toValue: 1,
            duration: 5000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breathingAnim, {
            toValue: 0,
            duration: 5000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      breathing.start();
      return () => breathing.stop();
    }, [breathingAnim]);

    useEffect(() => {
      const glowPulse = Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulseAnim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowPulseAnim, {
            toValue: 0,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      glowPulse.start();
      return () => glowPulse.stop();
    }, [glowPulseAnim]);

    useEffect(() => {
      Animated.timing(moonOpacityAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, [moonOpacityAnim]);

    useEffect(() => {
      starAnimations.forEach((star, index) => {
        const randomDuration = 2500 + Math.random() * 1500;

        const twinkle = Animated.loop(
          Animated.sequence([
            Animated.delay(star.delay),
            Animated.parallel([
              Animated.timing(star.opacityAnim, {
                toValue: 1,
                duration: randomDuration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(star.scaleAnim, {
                toValue: 1.2,
                duration: randomDuration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(star.opacityAnim, {
                toValue: 0.3,
                duration: randomDuration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(star.scaleAnim, {
                toValue: 0.8,
                duration: randomDuration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ]),
        );
        twinkle.start();
      });
    }, [starAnimations]);

    const moonScale = breathingAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.04],
    });

    const moonGlowOpacity = breathingAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0.75],
    });

    const outerGlowOpacity = glowPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.08, 0.18],
    });

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1E1B4B', '#312E81', '#0F172A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBase}
        />
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            marginTop: 20,
          }}>
          <View style={styles.radialGlow} />
          <View style={styles.radialGlowSecondary} />
          <Animated.View
            style={[
              styles.moonContainer,
              {
                opacity: moonOpacityAnim,
                transform: [{ scale: moonScale }],
              },
            ]}>
            <Animated.View
              style={[styles.moonOuterGlow, { opacity: outerGlowOpacity }]}
            />
            <Animated.View
              style={[styles.moonMiddleGlow, { opacity: moonGlowOpacity }]}
            />
            <View style={styles.moonBody} />
          </Animated.View>
        </View>
        {starAnimations.map((_, index) => (
          <Star
            key={`star-${index}`}
            index={index}
            opacityAnim={starAnimations[index].opacityAnim}
            scaleAnim={starAnimations[index].scaleAnim}
          />
        ))}
        <View style={styles.sparkleContainer}>
          <View style={[styles.sparkle, styles.sparkle1]} />
          <View style={[styles.sparkle, styles.sparkle2]} />
          <View style={[styles.sparkle, styles.sparkle3]} />
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    // borderRadius: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28

  },
  gradientBase: {
    ...StyleSheet.absoluteFillObject,
  },
  radialGlow: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: SCREEN_WIDTH * 0.4,
    backgroundColor: '#4F46E5',
    top: -SCREEN_WIDTH * 0.2,
    right: -SCREEN_WIDTH * 0.15,
    opacity: 0.15,
  },
  radialGlowSecondary: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: SCREEN_WIDTH * 0.25,
    backgroundColor: '#818CF8',
    top: SCREEN_HEIGHT * 0.3,
    left: -SCREEN_WIDTH * 0.1,
    opacity: 0.08,
  },
  moonContainer: {
    position: 'absolute',
    top: 24,
    right: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moonOuterGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8FAFC',
  },
  moonMiddleGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F8FAFC',
  },
  moonBody: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F8FAFC',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 2,
  },
  sparkleContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  sparkle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
    opacity: 0.2,
  },
  sparkle1: {
    left: SCREEN_WIDTH * 0.2,
    top: SCREEN_HEIGHT * 0.12,
  },
  sparkle2: {
    left: SCREEN_WIDTH * 0.75,
    top: SCREEN_HEIGHT * 0.22,
  },
  sparkle3: {
    left: SCREEN_WIDTH * 0.45,
    top: SCREEN_HEIGHT * 0.26,
  },
});

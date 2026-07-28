import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export interface HeaderAnimations {
  entryAnim: Animated.Value;
  pulseAnim: Animated.Value;
  shimmerAnim: Animated.Value;
  floatAnim: Animated.Value;
  badgeAnim: Animated.Value;
  entryStyle: {
    opacity: Animated.AnimatedInterpolation<number>;
    transform: Array<{
      translateY: Animated.AnimatedInterpolation<number>;
    }>;
  };
  pulseStyle: {
    transform: Array<{
      scale: Animated.AnimatedInterpolation<number>;
    }>;
  };
  shimmerStyle: {
    opacity: Animated.AnimatedInterpolation<number>;
  };
  floatStyle: {
    transform: Array<{
      translateY: Animated.AnimatedInterpolation<number>;
    }>;
  };
  badgeStyle: {
    transform: Array<{
      scale: Animated.AnimatedInterpolation<number>;
    }>;
  };
}

export interface NotificationAnimation {
  scale: Animated.Value;
  startBounce: () => void;
}

export interface HeaderAnimationConfig {
  isOnline: boolean;
  hasNotification: boolean;
}

export const useHeaderAnimations = ({
  isOnline,
  hasNotification,
}: HeaderAnimationConfig): HeaderAnimations => {
  const entryAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entryAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entryAnim]);

  useEffect(() => {
    if (isOnline) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isOnline, pulseAnim]);

  useEffect(() => {
    if (isOnline) {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
      );
      shimmer.start();
      return () => shimmer.stop();
    }
  }, [isOnline, shimmerAnim]);

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    float.start();
    return () => float.stop();
  }, [floatAnim]);

  useEffect(() => {
    if (hasNotification) {
      const badgePulse = Animated.loop(
        Animated.sequence([
          Animated.timing(badgeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(badgeAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      badgePulse.start();
      return () => badgePulse.stop();
    }
  }, [hasNotification, badgeAnim]);

  const entryStyle = {
    opacity: entryAnim,
    transform: [
      {
        translateY: entryAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 0],
        }),
      },
    ],
  };

  const pulseStyle = {
    transform: [
      {
        scale: pulseAnim,
      },
    ],
  };

  const shimmerStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.12],
    }),
  };

  const floatStyle = {
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  };

  const badgeStyle = {
    transform: [
      {
        scale: badgeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.15],
        }),
      },
    ],
  };

  return {
    entryAnim,
    pulseAnim,
    shimmerAnim,
    floatAnim,
    badgeAnim,
    entryStyle,
    pulseStyle,
    shimmerStyle,
    floatStyle,
    badgeStyle,
  };
};

export const useNotificationAnimation = (): NotificationAnimation => {
  const scale = useRef(new Animated.Value(1)).current;

  const startBounce = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    scale,
    startBounce,
  };
};

export const useShineAnimation = () => {
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shine = Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    shine.start();
    return () => shine.stop();
  }, [shineAnim]);

  return shineAnim;
};

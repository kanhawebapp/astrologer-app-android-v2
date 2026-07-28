import { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

const PAGE1_AUTO_DELAY = 4500;
const PAGE2_AUTO_DELAY = 3000;

interface UseSplashReturn {
  currentPage: number;
  animations: {
    logoOpacity: Animated.Value;
    logoScale: Animated.Value;
    logoRotate: Animated.Value;
    glowOpacity: Animated.Value;
    glowScale: Animated.Value;
    glow2Opacity: Animated.Value;
    glow2Scale: Animated.Value;
    glow3Opacity: Animated.Value;
    glow3Scale: Animated.Value;
    textOpacity: Animated.Value;
    textTranslateY: Animated.Value;
    taglineOpacity: Animated.Value;
    taglineTranslateY: Animated.Value;
    containerOpacity: Animated.Value;
    dotAnim: Animated.Value;
    shimmerAnim: Animated.Value;
    zodiacOpacity: Animated.Value;
    decorLineOpacity: Animated.Value;
    decorLineWidth: Animated.Value;
    subtitleOpacity: Animated.Value;
    subtitleTranslateY: Animated.Value;
    progressAnim: Animated.Value;
  };
  goToNextPage: () => void;
  animating: boolean;
}

export const useSplash = (onComplete?: () => void): UseSplashReturn => {
  const [currentPage, setCurrentPage] = useState(0);
  const [animating, setAnimating] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.6)).current;
  const glowScale = useRef(new Animated.Value(0.3)).current;
  const glow2Opacity = useRef(new Animated.Value(0.4)).current;
  const glow2Scale = useRef(new Animated.Value(0.3)).current;
  const glow3Opacity = useRef(new Animated.Value(0.2)).current;
  const glow3Scale = useRef(new Animated.Value(0.3)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(15)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const zodiacOpacity = useRef(new Animated.Value(0)).current;
  const decorLineOpacity = useRef(new Animated.Value(0)).current;
  const decorLineWidth = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(10)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const dotAnim = useRef(new Animated.Value(0)).current;
  const glowLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const shimmerLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentPageRef = useRef(0);
  const animatingRef = useRef(false);

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const animatePage2 = useCallback(() => {
    setCurrentPage(1);
    currentPageRef.current = 1;
    dotAnim.setValue(1);
    setAnimating(false);
    animatingRef.current = false;

    clearAutoTimer();
    autoTimerRef.current = setTimeout(() => {
      if (onCompleteRef.current) {
        containerOpacity.setValue(0);
        onCompleteRef.current();
      }
    }, PAGE2_AUTO_DELAY);
  }, [dotAnim, containerOpacity, clearAutoTimer]);

  const animatePage2Ref = useRef(animatePage2);
  animatePage2Ref.current = animatePage2;

  const goToNextPage = useCallback(() => {
    if (animatingRef.current || currentPageRef.current >= 1) return;
    clearAutoTimer();
    if (glowLoopRef.current) {
      glowLoopRef.current.stop();
    }
    if (shimmerLoopRef.current) {
      shimmerLoopRef.current.stop();
    }

    animatePage2Ref.current();
  }, [clearAutoTimer]);

  const goToNextPageRef = useRef(goToNextPage);
  goToNextPageRef.current = goToNextPage;

  useEffect(() => {
    setAnimating(true);
    animatingRef.current = true;
    setCurrentPage(0);
    currentPageRef.current = 0;

    const logoAnim = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 35,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const glowAnim = Animated.loop(
      Animated.parallel([
        Animated.timing(glowOpacity, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1.3,
          duration: 2000,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      { resetBeforeIteration: true },
    );

    const glow2Anim = Animated.loop(
      Animated.parallel([
        Animated.timing(glow2Opacity, {
          toValue: 0,
          duration: 2500,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glow2Scale, {
          toValue: 1.4,
          duration: 2500,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      { resetBeforeIteration: true },
    );

    const glow3Anim = Animated.loop(
      Animated.parallel([
        Animated.timing(glow3Opacity, {
          toValue: 0,
          duration: 3000,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glow3Scale, {
          toValue: 1.5,
          duration: 3000,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      { resetBeforeIteration: true },
    );

    glowLoopRef.current = Animated.parallel([glowAnim, glow2Anim, glow3Anim]);

    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    shimmerLoopRef.current = shimmerLoop;

    const zodiacAnim = Animated.timing(zodiacOpacity, {
      toValue: 1,
      duration: 1200,
      delay: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    const decorLineAnim = Animated.parallel([
      Animated.timing(decorLineOpacity, {
        toValue: 1,
        duration: 600,
        delay: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(decorLineWidth, {
        toValue: 1,
        delay: 700,
        friction: 6,
        tension: 40,
        useNativeDriver: false,
      }),
    ]);

    const textAnim = Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 700,
        delay: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 700,
        delay: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const taglineAnim = Animated.parallel([
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 700,
        delay: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(taglineTranslateY, {
        toValue: 0,
        duration: 700,
        delay: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const subtitleAnim = Animated.parallel([
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 700,
        delay: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(subtitleTranslateY, {
        toValue: 0,
        duration: 700,
        delay: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const progressAnimation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: PAGE1_AUTO_DELAY + 2500,
      delay: 1500,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    });

    glowLoopRef.current.start();
    shimmerLoop.start();

    Animated.sequence([
      Animated.delay(200),
      logoAnim,
      Animated.parallel([
        zodiacAnim,
        decorLineAnim,
        textAnim,
        taglineAnim,
        subtitleAnim,
      ]),
    ]).start(() => {
      progressAnimation.start();
      setAnimating(false);
      animatingRef.current = false;

      clearAutoTimer();
      autoTimerRef.current = setTimeout(() => {
        goToNextPageRef.current();
      }, PAGE1_AUTO_DELAY);
    });

    return () => {
      glowLoopRef.current?.stop();
      shimmerLoop.stop();
      clearAutoTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    currentPage,
    animations: {
      logoOpacity,
      logoScale,
      logoRotate,
      glowOpacity,
      glowScale,
      glow2Opacity,
      glow2Scale,
      glow3Opacity,
      glow3Scale,
      textOpacity,
      textTranslateY,
      taglineOpacity,
      taglineTranslateY,
      containerOpacity,
      dotAnim,
      shimmerAnim,
      zodiacOpacity,
      decorLineOpacity,
      decorLineWidth,
      subtitleOpacity,
      subtitleTranslateY,
      progressAnim,
    },
    goToNextPage,
    animating,
  };
};

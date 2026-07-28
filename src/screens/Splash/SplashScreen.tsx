import React, { useCallback, useRef } from 'react';
import { Animated, StyleSheet, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSplash } from './hooks/useSplash';
import { BrandingScreen } from './components/BrandingScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PageIndicator } from './components/PageIndicator';

const TOTAL_PAGES = 2;

interface SplashScreenProps {
  navigation: {
    replace: (name: string) => void;
  };
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { restore, isAuthenticated } = useAuth();
  const isAuthenticatedRef = useRef(isAuthenticated);
  isAuthenticatedRef.current = isAuthenticated;

  const handleNavigateToAuth = useCallback(() => {
    if (isAuthenticatedRef.current) {
      navigation.replace('MainTabs');
    } else {
      navigation.replace('AuthStack');
    }
  }, [navigation]);

  const { currentPage, animations } = useSplash(handleNavigateToAuth);

  React.useEffect(() => {
    console.log('[AUTH STEP 2] Splash Screen Mounted, Starting Auth Restore');
    const init = async () => {
      try {
        await restore();
      } catch {
        // No stored session
      }
    };
    init();
  }, [restore]);

  const handleGetStarted = () => {
    if (isAuthenticatedRef.current) {
      navigation.replace('MainTabs');
    } else {
      navigation.replace('AuthStack');
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.splashBackground,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.splashBackground}
        translucent
      />

      {currentPage === 0 ? (
        <Animated.View
          style={[
            styles.pageContainer,
            { opacity: animations.containerOpacity },
          ]}>
          <BrandingScreen
            logoOpacity={animations.logoOpacity}
            logoScale={animations.logoScale}
            logoRotate={animations.logoRotate}
            glowOpacity={animations.glowOpacity}
            glowScale={animations.glowScale}
            glow2Opacity={animations.glow2Opacity}
            glow2Scale={animations.glow2Scale}
            glow3Opacity={animations.glow3Opacity}
            glow3Scale={animations.glow3Scale}
            textOpacity={animations.textOpacity}
            textTranslateY={animations.textTranslateY}
            taglineOpacity={animations.taglineOpacity}
            taglineTranslateY={animations.taglineTranslateY}
            shimmerAnim={animations.shimmerAnim}
            zodiacOpacity={animations.zodiacOpacity}
            decorLineOpacity={animations.decorLineOpacity}
            decorLineWidth={animations.decorLineWidth}
            subtitleOpacity={animations.subtitleOpacity}
            subtitleTranslateY={animations.subtitleTranslateY}
            progressAnim={animations.progressAnim}
          />
        </Animated.View>
      ) : (
        <Animated.View
          style={[
            styles.pageContainer,
            { opacity: animations.containerOpacity },
          ]}>
          <WelcomeScreen onGetStarted={handleGetStarted} />
        </Animated.View>
      )}

      <View
        style={[
          styles.indicatorContainer,
          { paddingBottom: insets.bottom + 24 },
        ]}>
        <PageIndicator
          totalPages={TOTAL_PAGES}
          currentPage={currentPage}
          dotAnim={animations.dotAnim}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

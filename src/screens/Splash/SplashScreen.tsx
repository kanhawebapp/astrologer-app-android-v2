import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSplash } from './hooks/useSplash';
import { BrandingScreen } from './components/BrandingScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PageIndicator } from './components/PageIndicator';
import { STORAGE_KEYS } from '../../utils/constants';
import { store } from '../../store';
import type { RootNavigationProp } from '../../navigation/types';

const TOTAL_PAGES = 2;

interface SplashScreenProps {
  navigation: RootNavigationProp;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { restore, isAuthenticated } = useAuth();
  const isAuthenticatedRef = useRef(isAuthenticated);
  isAuthenticatedRef.current = isAuthenticated;
  const [skipWelcome, setSkipWelcome] = useState(false);
  const [skipWelcomeReady, setSkipWelcomeReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const done = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE);
        setSkipWelcome(!!done);
      } catch {
        setSkipWelcome(false);
      } finally {
        setSkipWelcomeReady(true);
      }
    })();
  }, []);

  const navigateAwayFromSplash = useCallback(
    (destination: 'MainTabs' | 'AuthStack') => {
      if (destination === 'AuthStack') {
        navigation.replace('AuthStack');
        return;
      }

      const state = navigation.getState();

      // navigation.replace() dispatches a REPLACE action without a target, so
      // the stack router replaces the *focused* route (state.index), not the
      // Splash route that dispatched it. When the splash finishes while an
      // incoming/active call is on top of the stack (killed-mode launch), that
      // would tear down IncomingCallFullscreen/CallScreen. Reset instead: map
      // Splash -> MainTabs and preserve every route stacked above it while a
      // call is active (keeping their keys so the call screens don't remount),
      // leaving the active call UI on top. Once no call is active, reset to
      // [MainTabs] so any stale incoming-call screen is dropped too.
      const callState = store.getState().call.callState;
      const callActive =
        callState === 'ringing' ||
        callState === 'connecting' ||
        callState === 'connected';

      if (state?.routes?.length) {
        const preservedRoutes = callActive
          ? state.routes.filter(route => route.name !== 'Splash')
          : [];
        navigation.reset({
          index: preservedRoutes.length,
          routes: [
            { name: 'MainTabs' },
            ...preservedRoutes.map(route => ({
              key: route.key,
              name: route.name,
              params: route.params,
            })),
          ],
        });
        return;
      }

      navigation.replace('MainTabs');
    },
    [navigation],
  );

  const handleNavigateToAuth = useCallback(() => {
    navigateAwayFromSplash(
      isAuthenticatedRef.current ? 'MainTabs' : 'AuthStack',
    );
  }, [navigateAwayFromSplash]);

  const { currentPage, animations } = useSplash(
    handleNavigateToAuth,
    skipWelcome && skipWelcomeReady,
  );

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
    navigateAwayFromSplash(
      isAuthenticatedRef.current ? 'MainTabs' : 'AuthStack',
    );
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

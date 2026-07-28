import React from 'react';
import { View, Image, Animated, StyleSheet, Dimensions } from 'react-native';
import { AppText } from '../../../components/common/AppText';
import { useTheme } from '../../../hooks/useTheme';
import { CosmicBackground } from './CosmicBackground';
import { ZodiacRing } from './ZodiacRing';

const logoImage = require('../../../assets/images/Logo3.png');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BrandingScreenProps {
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
  shimmerAnim: Animated.Value;
  zodiacOpacity: Animated.Value;
  decorLineOpacity: Animated.Value;
  decorLineWidth: Animated.Value;
  subtitleOpacity: Animated.Value;
  subtitleTranslateY: Animated.Value;
  progressAnim: Animated.Value;
}

export const BrandingScreen: React.FC<BrandingScreenProps> = ({
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
  shimmerAnim,
  zodiacOpacity,
  decorLineOpacity,
  decorLineWidth,
  subtitleOpacity,
  subtitleTranslateY,
  progressAnim,
}) => {
  const { theme } = useTheme();

  const logoSpin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  const decorWidthInterpolated = decorLineWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const progressShimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-30, 35, 100],
  });

  return (
    <View style={styles.container}>
      <CosmicBackground />

      <View style={styles.topAccent}>
        <View
          style={[
            styles.accentLine,
            { backgroundColor: 'rgba(212, 175, 55, 0.15)' },
          ]}
        />
      </View>

      <View style={styles.centerContent}>
        <View style={styles.ringContainer}>
          <ZodiacRing opacity={zodiacOpacity} ringRadius={155} />

          <Animated.View
            style={[
              styles.glowOuter,
              {
                backgroundColor: 'rgba(212, 175, 55, 0.08)',
                opacity: glow3Opacity,
                transform: [{ scale: glow3Scale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.glowMid,
              {
                backgroundColor: theme.colors.glowSecondary,
                opacity: glow2Opacity,
                transform: [{ scale: glow2Scale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.glowInner,
              {
                backgroundColor: theme.colors.glowPrimary,
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />
        </View>

        <Animated.View
          style={[
            styles.decorLineContainer,
            {
              opacity: decorLineOpacity,
            },
          ]}>
          <View
            style={[
              styles.decorDot,
              { backgroundColor: theme.colors.accentGold },
            ]}
          />
          <Animated.View
            style={[
              styles.decorLine,
              {
                width: decorWidthInterpolated,
                backgroundColor: 'rgba(212, 175, 55, 0.3)',
              },
            ]}
          />
          <View
            style={[
              styles.decorDiamond,
              { borderColor: theme.colors.accentGold },
            ]}
          />
          <Animated.View
            style={[
              styles.decorLine,
              {
                width: decorWidthInterpolated,
                backgroundColor: 'rgba(212, 175, 55, 0.3)',
              },
            ]}
          />
          <View
            style={[
              styles.decorDot,
              { backgroundColor: theme.colors.accentGold },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
            alignItems: 'center',
          }}>
          <View style={styles.shimmerWrapper}>
            <AppText
              variant="h2"
              color={theme.colors.white}
              align="center"
              style={styles.appName}>
              DHWANI
            </AppText>
            <Animated.View
              style={[
                styles.shimmerOverlay,
                {
                  transform: [{ translateX: shimmerTranslateX }],
                },
              ]}
            />
          </View>
          <AppText
            variant="h2"
            color={theme.colors.accentGold}
            align="center"
            style={styles.appNameSub}>
            ASTRO
          </AppText>
        </Animated.View>

        <Animated.View
          style={[
            styles.dividerContainer,
            {
              opacity: taglineOpacity,
            },
          ]}>
          <View
            style={[
              styles.dividerLeft,
              { backgroundColor: 'rgba(212, 175, 55, 0.5)' },
            ]}
          />
          <View style={[styles.dividerStar]}>
            <AppText
              variant="body2"
              color={theme.colors.accentGold}
              style={styles.dividerStarText}>
              {'\u2726'}
            </AppText>
          </View>
          <View
            style={[
              styles.dividerRight,
              { backgroundColor: 'rgba(212, 175, 55, 0.5)' },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslateY }],
          }}>
          <AppText
            variant="body1"
            color={theme.colors.accentGold}
            align="center"
            style={styles.tagline}>
            Guide. Heal. Grow.
          </AppText>
        </Animated.View>

        <Animated.View
          style={{
            opacity: subtitleOpacity,
            transform: [{ translateY: subtitleTranslateY }],
          }}>
          <AppText
            variant="caption"
            color="rgba(255, 255, 255, 0.45)"
            align="center"
            style={styles.subtitle}>
            Your cosmic companion
          </AppText>
        </Animated.View>
      </View>

      <Animated.View
        style={[styles.progressBarContainer, { opacity: subtitleOpacity }]}>
        <View
          style={[
            styles.progressBarTrack,
            { backgroundColor: 'rgba(212, 175, 55, 0.1)' },
          ]}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressWidth,
              },
            ]}>
            <Animated.View
              style={[
                styles.progressBarShimmer,
                {
                  left: 0,
                  transform: [{ translateX: progressShimmerTranslateX }],
                },
              ]}
            />
          </Animated.View>
        </View>
      </Animated.View>

      <View style={styles.bottomAccent}>
        <View
          style={[
            styles.accentLine,
            { backgroundColor: 'rgba(212, 175, 55, 0.15)' },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topAccent: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.08,
    left: SCREEN_WIDTH * 0.15,
    right: SCREEN_WIDTH * 0.15,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.15,
    left: SCREEN_WIDTH * 0.15,
    right: SCREEN_WIDTH * 0.15,
  },
  accentLine: {
    height: 0.5,
    width: '100%',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    width: Math.min(380, SCREEN_WIDTH * 0.9),
    height: Math.min(380, SCREEN_WIDTH * 0.9),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  glowOuter: {
    position: 'absolute',
    width: Math.min(370, SCREEN_WIDTH * 0.87),
    height: Math.min(370, SCREEN_WIDTH * 0.87),
    borderRadius: Math.min(185, SCREEN_WIDTH * 0.435),
  },
  glowMid: {
    position: 'absolute',
    width: Math.min(310, SCREEN_WIDTH * 0.73),
    height: Math.min(310, SCREEN_WIDTH * 0.73),
    borderRadius: Math.min(155, SCREEN_WIDTH * 0.365),
  },
  glowInner: {
    position: 'absolute',
    width: Math.min(250, SCREEN_WIDTH * 0.59),
    height: Math.min(250, SCREEN_WIDTH * 0.59),
    borderRadius: Math.min(125, SCREEN_WIDTH * 0.295),
  },
  logoContainer: {
    marginBottom: 32,
    zIndex: 2,
  },
  logoRingOuter: {
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoRingInner: {
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logoImage: {
    width: 76,
    height: 76,
  },
  decorLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
    zIndex: 2,
  },
  decorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  decorLine: {
    height: 0.5,
    marginHorizontal: 8,
  },
  decorDiamond: {
    width: 8,
    height: 8,
    borderWidth: 0.5,
    transform: [{ rotate: '45deg' }],
  },
  shimmerWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  appName: {
    letterSpacing: 12,
    fontWeight: 'bold',
    fontSize: 34,
    marginBottom: 4,
  },
  appNameSub: {
    letterSpacing: 8,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 0,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  dividerLeft: {
    width: 50,
    height: 0.5,
  },
  dividerRight: {
    width: 50,
    height: 0.5,
  },
  dividerStar: {
    marginHorizontal: 10,
  },
  dividerStarText: {
    fontSize: 10,
  },
  tagline: {
    letterSpacing: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 14,
  },
  subtitle: {
    letterSpacing: 3,
    fontWeight: '300',
    textTransform: 'uppercase',
    fontSize: 11,
    marginTop: 14,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.09,
    width: 100,
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(212, 175, 55, 0.5)',
  },
  progressBarShimmer: {
    position: 'absolute',
    top: 0,
    width: 30,
    height: '100%',
    backgroundColor: 'rgba(212, 175, 55, 0.8)',
  },
});



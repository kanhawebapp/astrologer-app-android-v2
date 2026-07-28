import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { AppText } from '../../../components/common/AppText';
import { AppButton } from '../../../components/common/AppButton';
import { useTheme } from '../../../hooks/useTheme';
import { StarField } from './StarField';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const FEATURES = [
  {
    icon: '\u263D',
    title: 'Personalized Readings',
    desc: 'Kundli, Tarot & Numerology',
    accentHue: 'gold',
  },
  {
    icon: '\u2727',
    title: 'Live Consultations',
    desc: 'Chat, Call & Video sessions',
    accentHue: 'purple',
  },
  {
    icon: '\u25C8',
    title: 'Expert Astrologers',
    desc: 'Verified & experienced masters',
    accentHue: 'blue',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <StarField />

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Image
            source={require('../../../assets/images/Logo3.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <AppText
            variant="h3"
            color={theme.colors.text}
            align="center"
            style={styles.title}>
            Unlock the Stars
          </AppText>

          <AppText
            variant="body1"
            color="white"
            align="center"
            style={styles.subtitle}>
            Discover cosmic wisdom with ancient astrology,{'\n'}tailored just
            for you
          </AppText>
        </View>

        <View style={styles.featuresList}>
          {FEATURES.map((feature, index) => (
            <FeatureItem
              key={index}
              icon={feature.icon}
              title={feature.title}
              desc={feature.desc}
              accentHue={feature.accentHue}
              theme={theme}
            />
          ))}
        </View>

        <View style={styles.buttonSection}>
          <View style={styles.buttonWrapper}>
            <AppButton
              title="Get Started"
              onPress={onGetStarted}
              fullWidth
              size="large"
              style={styles.getStartedBtn}
            />
          </View>
          {/* <AppText
            variant="caption"
            color={theme.colors.textTertiary}
            align="center"
            style={styles.termsText}>
            By continuing, you agree to our Terms & Privacy Policy
          </AppText> */}
        </View>
      </View>
    </View>
  );
};

const ACCENT_BG: Record<string, string> = {
  gold: 'rgba(212, 175, 55, 0.12)',
  purple: 'rgba(139, 92, 246, 0.12)',
  blue: 'rgba(96, 165, 250, 0.12)',
};

const ACCENT_BORDER: Record<string, string> = {
  gold: 'rgba(212, 175, 55, 0.25)',
  purple: 'rgba(139, 92, 246, 0.25)',
  blue: 'rgba(96, 165, 250, 0.25)',
};

const FeatureItem: React.FC<{
  icon: string;
  title: string;
  desc: string;
  accentHue: string;
  theme: any;
}> = ({ icon, title, desc, accentHue, theme }) => (
  <View
    style={[
      styles.featureItem,
      {
        backgroundColor: ACCENT_BG[accentHue] ?? theme.colors.surfaceSecondary,
        borderColor: ACCENT_BORDER[accentHue] ?? theme.colors.borderLight,
      },
    ]}>
    <View
      style={[
        styles.featureIcon,
        {
          backgroundColor:
            ACCENT_BG[accentHue] ?? theme.colors.accentPurpleLight,
        },
      ]}>
      <AppText style={styles.featureIconText}>{icon}</AppText>
    </View>
    <View style={styles.featureText}>
      <AppText variant="label" color="white">
        {title}
      </AppText>
      <AppText variant="caption" color="white">
        {desc}
      </AppText>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    letterSpacing: 1.2,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    lineHeight: 22,
    opacity: 0.8,
  },
  featuresList: {
    width: '100%',
    gap: 10,
    marginBottom: 36,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureIconText: {
    fontSize: 22,
    color: 'white',
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  buttonSection: {
    width: '100%',
    alignItems: 'center',
  },
  buttonWrapper: {
    width: '100%',
  },
  getStartedBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  termsText: {
    marginTop: 16,
    opacity: 0.6,
  },
});

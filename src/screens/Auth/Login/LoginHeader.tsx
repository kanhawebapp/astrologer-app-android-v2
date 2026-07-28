import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { AppText } from '../../../components/common/AppText';
import { useTheme } from '../../../hooks/useTheme';

const logoImage = require('../../../assets/images/Logo3.png');

interface LoginHeaderProps {
  step: 'phone' | 'otp';
  contactNo?: string;
  countryCode?: string;
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({
  step,
  contactNo,
  countryCode = '+91',
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <View
          style={[
            styles.glowOuter,
            { backgroundColor: theme.colors.glowPrimary },
          ]}
        />
        <View
          style={[
            styles.glowInner,
            { backgroundColor: theme.colors.glowSecondary },
          ]}
        />
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: theme.colors.accentPurpleLight,
              borderColor: theme.colors.accentGold,
              shadowColor: theme.colors.accentGold,
            },
          ]}>
          <Image
            source={logoImage}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.decorLine}>
        <View
          style={[
            styles.decorDot,
            { backgroundColor: theme.colors.accentGold },
          ]}
        />
        <View
          style={[
            styles.decorBar,
            { backgroundColor: 'rgba(212, 175, 55, 0.3)' },
          ]}
        />
        <View
          style={[
            styles.decorDiamond,
            { borderColor: theme.colors.accentGold },
          ]}
        />
        <View
          style={[
            styles.decorBar,
            { backgroundColor: 'rgba(212, 175, 55, 0.3)' },
          ]}
        />
        <View
          style={[
            styles.decorDot,
            { backgroundColor: theme.colors.accentGold },
          ]}
        />
      </View>

      <AppText
        variant="h2"
        color={theme.colors.text}
        align="center"
        style={styles.title}>
        {step === 'phone' ? 'Welcome Back' : 'Verify OTP'}
      </AppText>

      <AppText
        variant="body1"
        color={theme.colors.white}
        align="center"
        style={styles.subtitle}>
        {step === 'phone'
          ? 'Sign in to continue your cosmic journey'
          : 'Enter the verification code sent to'}
      </AppText>

      {step === 'otp' && contactNo && (
        <View
          style={[
            styles.phoneChip,
            {
              backgroundColor: theme.colors.accentPurpleLight,
              borderColor: theme.colors.primary,
            },
          ]}>
          <AppText variant="label" color={theme.colors.white}>
            {countryCode} {contactNo}
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 36,
    marginBottom: 36,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  glowOuter: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
  },
  glowInner: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.2,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: {
    width: 52,
    height: 52,
  },
  decorLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  decorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  decorBar: {
    width: 40,
    height: 0.5,
    marginHorizontal: 6,
  },
  decorDiamond: {
    width: 7,
    height: 7,
    borderWidth: 0.5,
    transform: [{ rotate: '45deg' }],
  },
  title: {
    letterSpacing: 0.5,
    fontWeight: '800',
    marginBottom: 8,
    fontSize: 26,
    color: 'white',
  },
  subtitle: {
    lineHeight: 22,
    opacity: 0.7,
    paddingHorizontal: 20,
    color: 'white',
  },
  phoneChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 16,
  },
});

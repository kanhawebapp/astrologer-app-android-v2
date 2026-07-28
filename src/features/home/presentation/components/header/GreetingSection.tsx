import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { spacing } from './theme/timeThemeColors';
import { PremiumBadge } from './PremiumBadge';

interface GreetingSectionProps {
  greeting: string;
  subtitle: string;
  profileName: string;
  date: string;
  showPremiumBadge?: boolean;
}

export const GreetingSection: React.FC<GreetingSectionProps> = memo(
  ({ greeting, subtitle, profileName, date, showPremiumBadge = true }) => {
    const { theme } = useTheme();
    const firstName = profileName.split(' ')[0] || profileName;

    return (
      <View style={styles.container}>
        <View style={styles.greetingRow}>
          <AppText
            variant="h3"
            style={[styles.greeting, { color: theme.colors.text }]}>
            {greeting}
          </AppText>
          <View style={styles.waveContainer}>
            <View
              style={[
                styles.waveDot,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          </View>
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.nameGradient}>{firstName}!</Text>
          {showPremiumBadge && <PremiumBadge />}
        </View>

        <View style={styles.subtitleContainer}>
          <AppText
            variant="body2"
            style={[
              styles.cosmicSubtitle,
              { color: theme.colors.textSecondary },
            ]}>
            {subtitle}
          </AppText>
        </View>

        <AppText
          variant="body2"
          style={[styles.date, { color: theme.colors.textTertiary }]}>
          {date}
        </AppText>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingRight: spacing.md,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  waveContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  greeting: {
    fontWeight: '600',
    fontSize: 18,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  nameGradient: {
    fontSize: 28,
    fontWeight: '800',
    backgroundColor: 'transparent',
  },
  subtitleContainer: {
    marginTop: spacing.sm,
  },
  cosmicSubtitle: {
    fontStyle: 'italic',
    fontSize: 14,
  },
  date: {
    marginTop: spacing.md,
    fontSize: 13,
  },
});

import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AppText } from '../../../../../components/common/AppText';
import { spacing, borderRadius } from './theme/timeThemeColors';

interface EnergyFooterProps {
  energyText?: string;
}

export const EnergyFooter: React.FC<EnergyFooterProps> = memo(
  ({ energyText = "Today's Energy: Positive ✨" }) => {
    return (
      <View style={styles.container}>
        <View style={styles.pill}>
          <Text style={styles.moonIcon}>🌙</Text>
          <AppText variant="caption" style={styles.text}>
            {energyText}
          </AppText>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
  },
  moonIcon: {
    fontSize: 14,
  },
  text: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});

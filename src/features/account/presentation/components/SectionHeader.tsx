import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <AppText
        variant="label"
        color={theme.colors.textSecondary}
        style={styles.title}>
        {title.toUpperCase()}
      </AppText>
      <View
        style={[styles.underline, { backgroundColor: theme.colors.primary }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  title: {
    letterSpacing: 1,
    marginBottom: 4,
  },
  underline: {
    width: 40,
    height: 2,
    borderRadius: 1,
  },
});

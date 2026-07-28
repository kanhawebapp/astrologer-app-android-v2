import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../../../components/common/AppText';
import { useTheme } from '../../../../../../hooks/useTheme';
import { AVAILABLE_LANGUAGES } from '../types';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onToggleLanguage: (language: string) => void;
  error?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguages,
  onToggleLanguage,
  error,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Icon name="language" size={18} color={theme.colors.primary} />
        <AppText variant="label" color={theme.colors.textSecondary}>
          Languages
        </AppText>
        <AppText variant="caption" color={theme.colors.textTertiary}>
          ({selectedLanguages.length}/5)
        </AppText>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}>
        {AVAILABLE_LANGUAGES.map(language => {
          const isSelected = selectedLanguages.includes(language);
          return (
            <TouchableOpacity
              key={language}
              onPress={() => onToggleLanguage(language)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? theme.colors.accentPurple
                    : theme.colors.surfaceSecondary,
                  borderColor: isSelected
                    ? theme.colors.accentPurple
                    : theme.colors.border,
                },
              ]}
              activeOpacity={0.7}>
              <Icon
                name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                size={16}
                color={
                  isSelected ? theme.colors.white : theme.colors.textTertiary
                }
              />
              <AppText
                variant="caption"
                color={isSelected ? theme.colors.white : theme.colors.text}
                style={styles.chipText}>
                {language}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {error && (
        <AppText
          variant="caption"
          color={theme.colors.error}
          style={styles.errorText}>
          {error.message}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
  },
  errorText: {
    marginTop: 8,
    marginLeft: 4,
  },
});

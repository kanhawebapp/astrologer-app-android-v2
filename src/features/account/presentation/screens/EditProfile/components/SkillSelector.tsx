import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../../../components/common/AppText';
import { useTheme } from '../../../../../../hooks/useTheme';
import { AVAILABLE_SKILLS } from '../types';

interface SkillSelectorProps {
  selectedSkills: string[];
  onToggleSkill: (skill: string) => void;
  error?: any;
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({
  selectedSkills,
  onToggleSkill,
  error,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Icon name="star-outline" size={18} color={theme.colors.primary} />
        <AppText variant="label" color={theme.colors.textSecondary}>
          Skills
        </AppText>
        <AppText variant="caption" color={theme.colors.textTertiary}>
          ({selectedSkills.length}/10)
        </AppText>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}>
        {AVAILABLE_SKILLS.map(skill => {
          const isSelected = selectedSkills.includes(skill);
          return (
            <TouchableOpacity
              key={skill}
              onPress={() => onToggleSkill(skill)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.surfaceSecondary,
                  borderColor: isSelected
                    ? theme.colors.primary
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
                {skill}
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

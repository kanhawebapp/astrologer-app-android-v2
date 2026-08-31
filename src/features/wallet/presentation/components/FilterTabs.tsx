import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../../../../hooks/useTheme';
import {AppText} from '../../../../components/common/AppText';
import {spacing, borderRadius} from '../../../../theme/spacing';

type FilterType = 'all' | 'credit' | 'debit';

interface FilterTabsProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  const {theme} = useTheme();

  const filters: {key: FilterType; label: string}[] = [
    {key: 'all', label: 'All'},
    {key: 'credit', label: 'Credits'},
    // {key: 'debit', label: 'Debits'},
  ];

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: theme.colors.surfaceSecondary},
      ]}>
      {filters.map(filter => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.tab,
            selectedFilter === filter.key && {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={() => onFilterChange(filter.key)}>
          <AppText
            variant="body2"
            color={
              selectedFilter === filter.key
                ? theme.colors.white
                : theme.colors.textSecondary
            }>
            {filter.label}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
});

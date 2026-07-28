import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { FilterType, SessionTypeFilter } from '../../domain/types';

interface SessionFilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  activeSessionType: SessionTypeFilter;
  onSessionTypeChange: (type: SessionTypeFilter) => void;
}

const STATUS_FILTERS: { key: FilterType; label: string; iconName?: string }[] =
  [
    { key: FilterType.ALL, label: 'All' },
    {
      key: FilterType.ACTIVE,
      label: 'Active',
      iconName: 'radio-button-checked',
    },
    { key: FilterType.PENDING, label: 'Pending', iconName: 'schedule' },
    { key: FilterType.COMPLETED, label: 'Completed', iconName: 'check-circle' },
    { key: FilterType.MISSED, label: 'Missed', iconName: 'cancel' },
  ];

const SESSION_TYPES: {
  key: SessionTypeFilter;
  label: string;
  iconName: string;
}[] = [
  { key: SessionTypeFilter.ALL, label: 'All', iconName: 'apps' },
  { key: SessionTypeFilter.CHAT, label: 'Chat', iconName: 'chat' },
  { key: SessionTypeFilter.CALL, label: 'Call', iconName: 'phone' },
];

export const SessionFilterTabs: React.FC<SessionFilterTabsProps> = ({
  activeFilter,
  onFilterChange,
  activeSessionType,
  onSessionTypeChange,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeScrollContent}>
        {SESSION_TYPES.map(type => {
          const isActive = activeSessionType === type.key;
          return (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.typeTab,
                {
                  backgroundColor: isActive
                    ? theme.colors.primary
                    : theme.colors.surfaceSecondary,
                  borderColor: isActive
                    ? theme.colors.primary
                    : theme.colors.border,
                },
              ]}
              onPress={() => onSessionTypeChange(type.key)}
              activeOpacity={0.7}>
              <Icon
                name={type.iconName}
                size={14}
                color={
                  isActive ? theme.colors.white : theme.colors.textSecondary
                }
              />
              <AppText
                variant="caption"
                color={
                  isActive ? theme.colors.white : theme.colors.textSecondary
                }
                style={styles.typeLabel}>
                {type.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}>
        {STATUS_FILTERS.map(filter => {
          const isActive = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive
                    ? theme.colors.primary + '15'
                    : 'transparent',
                  borderColor: isActive
                    ? theme.colors.primary
                    : theme.colors.border,
                },
              ]}
              onPress={() => onFilterChange(filter.key)}
              activeOpacity={0.7}>
              {filter.iconName && (
                <Icon
                  name={filter.iconName}
                  size={12}
                  color={
                    isActive ? theme.colors.primary : theme.colors.textSecondary
                  }
                />
              )}
              <AppText
                variant="caption"
                color={
                  isActive ? theme.colors.primary : theme.colors.textSecondary
                }
                style={styles.filterLabel}>
                {filter.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  typeScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  typeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  typeLabel: {
    fontWeight: '600',
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  filterLabel: {
    fontWeight: '500',
  },
});

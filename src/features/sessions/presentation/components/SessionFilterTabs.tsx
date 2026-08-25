import React from 'react';
import {StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AppText} from '../../../../components/common/AppText';
import {useTheme} from '../../../../hooks/useTheme';

interface SessionTypeTabsProps {
  activeType: 'CALL' | 'CHAT';
  onTypeChange: (type: 'CALL' | 'CHAT') => void;
}

interface SessionStatusTabsProps {
  activeStatus: 'COMPLETED' | 'CANCELLED';
  onStatusChange: (status: 'COMPLETED' | 'CANCELLED') => void;
}

export const SessionTypeTabs: React.FC<SessionTypeTabsProps> = ({
  activeType,
  onTypeChange,
}) => {
  const {theme} = useTheme();

  const types = [
    {key: 'CALL' as const, label: 'Call', iconName: 'phone'},
    {key: 'CHAT' as const, label: 'Chat', iconName: 'chat'},
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.typeScrollContent}>
      {types.map(type => {
        const isActive = activeType === type.key;
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
            onPress={() => onTypeChange(type.key)}
            activeOpacity={0.7}>
            <Icon
              name={type.iconName}
              size={14}
              color={isActive ? theme.colors.white : theme.colors.textSecondary}
            />
            <AppText
              variant="caption"
              color={isActive ? theme.colors.white : theme.colors.textSecondary}
              style={styles.typeLabel}>
              {type.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export const SessionStatusTabs: React.FC<SessionStatusTabsProps> = ({
  activeStatus,
  onStatusChange,
}) => {
  const {theme} = useTheme();

  const statuses = [
    {key: 'COMPLETED' as const, label: 'Completed', iconName: 'check-circle'},
    {key: 'CANCELLED' as const, label: 'Cancelled', iconName: 'block'},
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.statusScrollContent}>
      {statuses.map(status => {
        const isActive = activeStatus === status.key;
        return (
          <TouchableOpacity
            key={status.key}
            style={[
              styles.statusChip,
              {
                backgroundColor: isActive
                  ? theme.colors.primary + '15'
                  : 'transparent',
                borderColor: isActive
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
            onPress={() => onStatusChange(status.key)}
            activeOpacity={0.7}>
            {status.iconName && (
              <Icon
                name={status.iconName}
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
              style={styles.statusLabel}>
              {status.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  statusScrollContent: {
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  statusLabel: {
    fontWeight: '500',
  },
});

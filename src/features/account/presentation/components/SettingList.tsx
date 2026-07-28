import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { SettingItemData } from '../../domain/types';

interface SettingListProps {
  settings: SettingItemData[];
  onSettingPress: (id: string) => void;
  onToggle?: (id: string, value: boolean) => void;
}

const SettingIcon: React.FC<{ icon: string; color: string }> = ({
  icon,
  color,
}) => {
  const iconMap: Record<string, string> = {
    'user-edit': 'person-circle',
    language: 'language',
    bell: 'notifications',
    'file-contract': 'document-text',
    'shield-alt': 'shield-checkmark',
    headset: 'headset',
  };

  return (
    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
      <Icon name={iconMap[icon] || 'settings'} size={20} color={color} />
    </View>
  );
};

export const SettingList: React.FC<SettingListProps> = ({
  settings,
  onSettingPress,
  onToggle,
}) => {
  const { theme } = useTheme();

  const renderRightContent = (setting: SettingItemData) => {
    if (setting.type === 'toggle' && typeof setting.value === 'boolean') {
      return (
        <TouchableOpacity
          onPress={() => onToggle?.(setting.id, !setting.value)}
          style={[
            styles.toggleTrack,
            {
              backgroundColor: setting.value
                ? theme.colors.success
                : theme.colors.border,
            },
          ]}>
          <View
            style={[
              styles.toggleThumb,
              {
                backgroundColor: theme.colors.white,
                transform: [{ translateX: setting.value ? 20 : 0 }],
              },
            ]}
          />
        </TouchableOpacity>
      );
    }

    if (setting.type === 'navigation') {
      return (
        <View style={styles.navigationRight}>
          {setting.value && (
            <AppText variant="body2" color={theme.colors.textTertiary}>
              {setting.value}
            </AppText>
          )}
          <Icon
            name="chevron-forward"
            size={20}
            color={theme.colors.textTertiary}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <AppText variant="h5" color={theme.colors.text} style={styles.header}>
        Settings
      </AppText>

      <View
        style={[styles.divider, { backgroundColor: theme.colors.border }]}
      />

      {settings.map((setting, index) => (
        <TouchableOpacity
          key={setting.id}
          style={[
            styles.settingRow,
            { borderBottomColor: theme.colors.borderLight },
            index === settings.length - 1 && styles.lastRow,
          ]}
          onPress={() => onSettingPress(setting.id)}
          activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <SettingIcon
              icon={setting.icon}
              color={
                setting.id === 'notifications'
                  ? theme.colors.warning
                  : theme.colors.primary
              }
            />
            <AppText variant="body1" color={theme.colors.text}>
              {setting.title}
            </AppText>
          </View>
          {renderRightContent(setting)}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  navigationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

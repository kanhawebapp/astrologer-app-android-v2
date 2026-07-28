import React from 'react';
import { View, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';

interface SettingItemProps {
  title: string;
  value?: string | boolean;
  type: 'navigation' | 'toggle' | 'action';
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  title,
  value,
  type,
  onPress,
  onToggle,
}) => {
  const { theme } = useTheme();

  const renderRightContent = () => {
    if (type === 'toggle' && typeof value === 'boolean') {
      return (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.primary,
          }}
          thumbColor={theme.colors.white}
        />
      );
    }
    if (type === 'navigation') {
      return (
        <View style={styles.navigationRight}>
          {value && (
            <AppText variant="body2" color={theme.colors.textTertiary}>
              {value}
            </AppText>
          )}
          <AppText variant="body1" color={theme.colors.textTertiary}>
            ›
          </AppText>
        </View>
      );
    }
    return null;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderBottomColor: theme.colors.borderLight },
      ]}
      onPress={type !== 'toggle' ? onPress : undefined}
      disabled={type === 'toggle'}
      activeOpacity={0.7}>
      <AppText variant="body1" color={theme.colors.text}>
        {title}
      </AppText>
      {renderRightContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  navigationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

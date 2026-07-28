import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { AppButton } from '../../../../components/common/AppButton';
import { useTheme } from '../../../../hooks/useTheme';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const { theme, mode } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor:
              mode === 'dark'
                ? theme.colors.primaryLight + '25'
                : theme.colors.primaryLight,
          },
        ]}>
        <Icon name={icon} size={48} color={theme.colors.primary} />
      </View>
      <AppText variant="h4" color={theme.colors.text} style={styles.title}>
        {title}
      </AppText>
      {description && (
        <AppText
          variant="body2"
          color={theme.colors.textSecondary}
          style={styles.description}>
          {description}
        </AppText>
      )}
      {actionLabel && onAction && (
        <View style={styles.actionContainer}>
          <AppButton title={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
  },
  description: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 20,
  },
});

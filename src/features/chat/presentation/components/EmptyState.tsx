import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';

interface EmptyStateProps {
  message?: string;
  chatStatus?: 'IDLE' | 'REQUEST' | 'ACTIVE' | 'ENDED';
  error?: string | null;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  chatStatus = 'IDLE',
  error,
}) => {
  const { theme } = useTheme();

  const getDefaultMessage = () => {
    if (error) return error;
    if (chatStatus === 'ENDED') return 'Chat has ended';
    return 'No active chat';
  };

  const displayMessage = message || getDefaultMessage();
  console.log('[CHAT_DEBUG] EmptyState render', {
    chatStatus,
    error,
    displayMessage,
  });

  return (
    <View style={styles.container}>
      <AppText variant="body1" color={theme.colors.textSecondary}>
        {displayMessage}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

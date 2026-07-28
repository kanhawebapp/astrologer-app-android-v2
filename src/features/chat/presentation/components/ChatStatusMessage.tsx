import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';

interface ChatStatusMessageProps {
  message?: string;
  type?: 'connecting' | 'error' | 'success' | 'info';
}

export const ChatStatusMessage: React.FC<ChatStatusMessageProps> = ({
  message = 'Connecting to chat...',
  type = 'connecting',
}) => {
  const { theme } = useTheme();

  const getMessageColor = () => {
    switch (type) {
      case 'error':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <AppText variant="body1" color={getMessageColor()}>
        {message}
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

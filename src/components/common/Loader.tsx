import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { AppText } from './AppText';

interface LoaderProps {
  visible: boolean;
  message?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  visible,
  message,
  fullScreen = false,
}) => {
  const { theme } = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: theme.colors.overlay },
      ]}
    >
      <View
        style={[
          styles.loaderBox,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
          },
        ]}
      >
        <View
          style={[
            styles.spinner,
            { borderColor: theme.colors.borderLight },
            styles.spinnerActive,
          ]}
        />
        {message && (
          <AppText
            variant="body2"
            color={theme.colors.textSecondary}
            style={styles.message}
          >
            {message}
          </AppText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  fullScreen: {
    zIndex: 9999,
  },
  loaderBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
  },
  spinnerActive: {
    borderTopColor: '#6C63FF',
  },
  message: {
    marginTop: 12,
  },
});

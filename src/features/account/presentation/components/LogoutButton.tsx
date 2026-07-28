import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';

interface LogoutButtonProps {
  onLogout: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  const { theme } = useTheme();

  const handlePress = () => {
    // console.log('Logout button pressed');
    // Alert.alert(
    //   'Logout',
    //   'Are you sure you want to logout?',
    //   [
    //     { text: 'Cancel', style: 'cancel' },
    //     { text: 'Logout', style: 'destructive', onPress: onLogout },
    //   ],
    //   { cancelable: true },
    // );
    onLogout();
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: theme.colors.error }]}
      onPress={handlePress}
      activeOpacity={0.7}>
      <AppText variant="button" color={theme.colors.error}>
        Logout
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
});

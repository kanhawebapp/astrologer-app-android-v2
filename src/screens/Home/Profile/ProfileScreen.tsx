import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { AppText } from '../../../components/common/AppText';
import { AppButton } from '../../../components/common/AppButton';
import { Header } from '../../../components/layout/Header';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';

export const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScreenContainer scrollable withPadding={false}>
      <Header title="Profile" />
      <View style={styles.content}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.colors.primaryLight },
          ]}
        >
          <AppText variant="h1" color={theme.colors.white}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </AppText>
        </View>

        <AppText variant="h4" style={styles.name}>
          {user?.name || 'User'}
        </AppText>

        <AppText
          variant="body2"
          color={theme.colors.textSecondary}
          style={styles.email}
        >
          {user?.email || 'user@example.com'}
        </AppText>

        <View style={styles.infoSection}>
          <InfoRow
            label="Member Since"
            value={
              user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : 'N/A'
            }
            theme={theme}
          />
          <InfoRow
            label="Phone"
            value={user?.phone || 'Not set'}
            theme={theme}
          />
        </View>

        <View style={styles.actions}>
          <AppButton
            title="Edit Profile"
            onPress={() => {}}
            variant="outline"
            fullWidth
            style={styles.actionButton}
          />
          <AppButton
            title="Logout"
            onPress={handleLogout}
            variant="primary"
            fullWidth
            style={styles.actionButton}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
  theme: any;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, theme }) => (
  <View
    style={[
      infoRowStyles.container,
      { borderBottomColor: theme.colors.border },
    ]}
  >
    <AppText variant="body2" color={theme.colors.textSecondary}>
      {label}
    </AppText>
    <AppText variant="body1">{value}</AppText>
  </View>
);

const infoRowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
});

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    marginBottom: 4,
  },
  email: {
    marginBottom: 24,
  },
  infoSection: {
    width: '100%',
    marginBottom: 24,
  },
  actions: {
    width: '100%',
    marginTop: 'auto',
  },
  actionButton: {
    marginBottom: 12,
  },
});

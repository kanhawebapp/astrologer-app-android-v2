import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';

interface PermissionModalProps {
  visible: boolean;
  onRequestPermission: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
  isLoading?: boolean;
  isDenied?: boolean;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  onRequestPermission,
  onOpenSettings,
  onClose,
  isLoading = false,
  isDenied = false,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.primaryLight },
            ]}>
            <Icon
              name={isDenied ? 'settings-outline' : 'videocam-outline'}
              size={48}
              color={theme.colors.primary}
            />
          </View>

          <AppText variant="h4" color={theme.colors.text} style={styles.title}>
            {isDenied ? 'Permissions Required' : 'Camera & Mic Access'}
          </AppText>

          <AppText
            variant="body2"
            color={theme.colors.textSecondary}
            style={styles.description}>
            {isDenied
              ? 'Camera and microphone access are required to go live. Please enable them in Settings.'
              : 'We need camera and microphone access to start your live session.'}
          </AppText>

          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <AppText
                variant="caption"
                color={theme.colors.textSecondary}
                style={styles.loadingText}>
                Requesting permissions...
              </AppText>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              {isDenied ? (
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={onOpenSettings}
                  activeOpacity={0.8}>
                  <Icon
                    name="settings-outline"
                    size={20}
                    color={theme.colors.white}
                  />
                  <AppText variant="button" color={theme.colors.white}>
                    Open Settings
                  </AppText>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={onRequestPermission}
                    activeOpacity={0.8}>
                    <Icon
                      name="checkmark-circle-outline"
                      size={20}
                      color={theme.colors.white}
                    />
                    <AppText variant="button" color={theme.colors.white}>
                      Allow
                    </AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      { backgroundColor: theme.colors.surfaceSecondary },
                    ]}
                    onPress={onClose}
                    activeOpacity={0.8}>
                    <AppText
                      variant="button"
                      color={theme.colors.textSecondary}>
                      Not Now
                    </AppText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
    width: '100%',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
  },
  loaderContainer: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    marginTop: 8,
  },
});

export default PermissionModal;

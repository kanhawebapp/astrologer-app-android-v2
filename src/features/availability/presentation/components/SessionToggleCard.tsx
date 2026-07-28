import React from 'react';
import { View, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { Availability } from '../../domain/types';

interface SessionToggleCardProps {
  availability: Availability;
  onToggleChat: (enabled: boolean) => void;
  onToggleCall: (enabled: boolean) => void;
  isLoading?: boolean;
}

export const SessionToggleCard: React.FC<SessionToggleCardProps> = ({
  availability,
  onToggleChat,
  onToggleCall,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isOnline = availability.isOnline;

  const handleChatToggle = () => {
    if (isOnline) {
      onToggleChat(!availability.chatEnabled);
    }
  };

  const handleCallToggle = () => {
    if (isOnline) {
      onToggleCall(!availability.callEnabled);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <AppText variant="h5" color={theme.colors.text}>
          Session Types
        </AppText>
        <AppText variant="caption" color={theme.colors.textTertiary}>
          {!isOnline && 'Go online to enable'}
        </AppText>
      </View>

      <View
        style={[styles.divider, { backgroundColor: theme.colors.border }]}
      />

      <TouchableOpacity
        style={[styles.toggleRow, !isOnline && styles.disabledRow]}
        onPress={handleChatToggle}
        activeOpacity={isOnline ? 0.7 : 1}
        disabled={!isOnline || isLoading}>
        <View style={styles.toggleLabelContainer}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isOnline
                  ? theme.colors.accentPurple + '20'
                  : theme.colors.surfaceSecondary,
              },
            ]}>
            <Icon
              name="chatbubble-ellipses"
              size={22}
              color={
                isOnline && availability.chatEnabled
                  ? theme.colors.accentPurple
                  : theme.colors.textTertiary
              }
            />
          </View>
          <View style={styles.labelContainer}>
            <AppText variant="body1" color={theme.colors.text}>
              Chat Sessions
            </AppText>
            <AppText variant="caption" color={theme.colors.textTertiary}>
              Accept text consultations
            </AppText>
          </View>
        </View>
        <Switch
          value={availability.chatEnabled}
          onValueChange={handleChatToggle}
          disabled={!isOnline || isLoading}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.accentPurple + '80',
          }}
          thumbColor={
            availability.chatEnabled
              ? theme.colors.accentPurple
              : theme.colors.textTertiary
          }
          ios_backgroundColor={theme.colors.border}
        />
      </TouchableOpacity>

      <View
        style={[styles.rowDivider, { backgroundColor: theme.colors.border }]}
      />

      <TouchableOpacity
        style={[styles.toggleRow, !isOnline && styles.disabledRow]}
        onPress={handleCallToggle}
        activeOpacity={isOnline ? 0.7 : 1}
        disabled={!isOnline || isLoading}>
        <View style={styles.toggleLabelContainer}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isOnline
                  ? theme.colors.info + '20'
                  : theme.colors.surfaceSecondary,
              },
            ]}>
            <Icon
              name="call"
              size={22}
              color={
                isOnline && availability.callEnabled
                  ? theme.colors.info
                  : theme.colors.textTertiary
              }
            />
          </View>
          <View style={styles.labelContainer}>
            <AppText variant="body1" color={theme.colors.text}>
              Call Sessions
            </AppText>
            <AppText variant="caption" color={theme.colors.textTertiary}>
              Accept voice/video calls
            </AppText>
          </View>
        </View>
        <Switch
          value={availability.callEnabled}
          onValueChange={handleCallToggle}
          disabled={!isOnline || isLoading}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.info + '80',
          }}
          thumbColor={
            availability.callEnabled
              ? theme.colors.info
              : theme.colors.textTertiary
          }
          ios_backgroundColor={theme.colors.border}
        />
      </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  disabledRow: {
    opacity: 0.5,
  },
  toggleLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  labelContainer: {
    flex: 1,
  },
  rowDivider: {
    height: 1,
    marginLeft: 56,
  },
});

import React from 'react';
import { View, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { Availability } from '../../domain/types';

interface ModeCardProps {
  availability: Availability;
  onToggleBusyMode: (enabled: boolean) => void;
  onToggleAutoAccept: (enabled: boolean) => void;
  isLoading?: boolean;
}

export const ModeCard: React.FC<ModeCardProps> = ({
  availability,
  onToggleBusyMode,
  onToggleAutoAccept,
  isLoading = false,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <AppText variant="h5" color={theme.colors.text}>
          Session Modes
        </AppText>
      </View>

      <View
        style={[styles.divider, { backgroundColor: theme.colors.border }]}
      />

      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => onToggleBusyMode(!availability.busyMode)}
        activeOpacity={0.7}
        disabled={isLoading}>
        <View style={styles.toggleLabelContainer}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: theme.colors.warning + '20',
              },
            ]}>
            <Icon
              name="alert-circle"
              size={22}
              color={
                availability.busyMode
                  ? theme.colors.warning
                  : theme.colors.textTertiary
              }
            />
          </View>
          <View style={styles.labelContainer}>
            <AppText variant="body1" color={theme.colors.text}>
              Busy Mode
            </AppText>
            <AppText variant="caption" color={theme.colors.textTertiary}>
              Temporarily block new sessions
            </AppText>
          </View>
        </View>
        <Switch
          value={availability.busyMode}
          onValueChange={onToggleBusyMode}
          disabled={isLoading}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.warning + '80',
          }}
          thumbColor={
            availability.busyMode
              ? theme.colors.warning
              : theme.colors.textTertiary
          }
          ios_backgroundColor={theme.colors.border}
        />
      </TouchableOpacity>

      <View
        style={[styles.rowDivider, { backgroundColor: theme.colors.border }]}
      />

      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => onToggleAutoAccept(!availability.autoAccept)}
        activeOpacity={0.7}
        disabled={isLoading}>
        <View style={styles.toggleLabelContainer}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: theme.colors.primary + '20',
              },
            ]}>
            <Icon
              name="flash"
              size={22}
              color={
                availability.autoAccept
                  ? theme.colors.primary
                  : theme.colors.textTertiary
              }
            />
          </View>
          <View style={styles.labelContainer}>
            <AppText variant="body1" color={theme.colors.text}>
              Auto Accept
            </AppText>
            <AppText variant="caption" color={theme.colors.textTertiary}>
              Automatically accept incoming chats
            </AppText>
          </View>
        </View>
        <Switch
          value={availability.autoAccept}
          onValueChange={onToggleAutoAccept}
          disabled={isLoading}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.primary + '80',
          }}
          thumbColor={
            availability.autoAccept
              ? theme.colors.primary
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

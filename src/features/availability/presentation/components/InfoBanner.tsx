import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { Availability } from '../../domain/types';

interface InfoBannerProps {
  availability: Availability;
  isMockData: boolean;
}

export const InfoBanner: React.FC<InfoBannerProps> = ({
  availability,
  isMockData,
}) => {
  const { theme } = useTheme();

  if (isMockData) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.warningLight },
        ]}>
        <Icon name="warning" size={20} color={theme.colors.warning} />
        <View style={styles.content}>
          <AppText variant="body2" color={theme.colors.warning}>
            Demo Mode Active
          </AppText>
          <AppText variant="caption" color={theme.colors.warning}>
            Using sample data. Changes won't persist.
          </AppText>
        </View>
      </View>
    );
  }

  if (availability.peakHourSuggestion) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.infoLight }]}>
        <Icon name="flash" size={20} color={theme.colors.info} />
        <View style={styles.content}>
          <AppText variant="body2" color={theme.colors.info}>
            Peak Hours Tip
          </AppText>
          <AppText variant="caption" color={theme.colors.info}>
            {availability.peakHourSuggestion}
          </AppText>
        </View>
      </View>
    );
  }

  if (availability.lowResponseWarning) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.errorLight },
        ]}>
        <Icon name="alert-circle" size={20} color={theme.colors.error} />
        <View style={styles.content}>
          <AppText variant="body2" color={theme.colors.error}>
            Response Warning
          </AppText>
          <AppText variant="caption" color={theme.colors.error}>
            {availability.lowResponseWarning}
          </AppText>
        </View>
      </View>
    );
  }

  if (availability.autoOfflineMinutes > 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.surfaceSecondary },
        ]}>
        <Icon name="timer" size={20} color={theme.colors.textTertiary} />
        <View style={styles.content}>
          <AppText variant="body2" color={theme.colors.text}>
            Auto Offline
          </AppText>
          <AppText variant="caption" color={theme.colors.textTertiary}>
            You'll go offline after {availability.autoOfflineMinutes} min of
            inactivity
          </AppText>
        </View>
      </View>
    );
  }

  if (availability.doNotDisturbStart && availability.doNotDisturbEnd) {
    const dndTime = `${availability.doNotDisturbStart} - ${availability.doNotDisturbEnd}`;
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.surfaceSecondary },
        ]}>
        <Icon name="moon" size={20} color={theme.colors.textTertiary} />
        <View style={styles.content}>
          <AppText variant="body2" color={theme.colors.text}>
            Do Not Disturb
          </AppText>
          <AppText variant="caption" color={theme.colors.textTertiary}>
            Silent from {dndTime}
          </AppText>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
  },
  content: {
    marginLeft: 12,
    flex: 1,
  },
});

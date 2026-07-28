import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { Availability } from '../../domain/types';

interface SessionLimitCardProps {
  availability: Availability;
  onUpdateMaxSessions: (maxSessions: number) => void;
  isLoading?: boolean;
}

export const SessionLimitCard: React.FC<SessionLimitCardProps> = ({
  availability,
  onUpdateMaxSessions,
  isLoading = false,
}) => {
  const { theme } = useTheme();

  const handleDecrement = () => {
    if (availability.maxSessions > 1) {
      onUpdateMaxSessions(availability.maxSessions - 1);
    }
  };

  const handleIncrement = () => {
    if (availability.maxSessions < 10) {
      onUpdateMaxSessions(availability.maxSessions + 1);
    }
  };

  const usagePercentage =
    availability.currentSessions / availability.maxSessions;
  const isAtLimit = availability.currentSessions >= availability.maxSessions;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <AppText variant="h5" color={theme.colors.text}>
          Session Limit
        </AppText>
        <View
          style={[
            styles.usageBadge,
            {
              backgroundColor: isAtLimit
                ? theme.colors.warningLight
                : theme.colors.surfaceSecondary,
            },
          ]}>
          <AppText
            variant="caption"
            color={
              isAtLimit ? theme.colors.warning : theme.colors.textTertiary
            }>
            {availability.currentSessions}/{availability.maxSessions} active
          </AppText>
        </View>
      </View>

      <AppText
        variant="caption"
        color={theme.colors.textSecondary}
        style={styles.description}>
        Set your maximum concurrent sessions
      </AppText>

      <View
        style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: isAtLimit
                ? theme.colors.warning
                : theme.colors.primary,
              width: `${Math.min(usagePercentage * 100, 100)}%`,
            },
          ]}
        />
      </View>

      <View style={styles.stepperContainer}>
        <TouchableOpacity
          style={[
            styles.stepperButton,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              opacity: availability.maxSessions <= 1 ? 0.5 : 1,
            },
          ]}
          onPress={handleDecrement}
          disabled={availability.maxSessions <= 1 || isLoading}
          activeOpacity={0.7}>
          <Icon name="remove" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <AppText variant="h3" color={theme.colors.text}>
            {availability.maxSessions}
          </AppText>
          <AppText variant="caption" color={theme.colors.textTertiary}>
            max sessions
          </AppText>
        </View>

        <TouchableOpacity
          style={[
            styles.stepperButton,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              opacity: availability.maxSessions >= 10 ? 0.5 : 1,
            },
          ]}
          onPress={handleIncrement}
          disabled={availability.maxSessions >= 10 || isLoading}
          activeOpacity={0.7}>
          <Icon name="add" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {isAtLimit && (
        <View
          style={[
            styles.warningBanner,
            { backgroundColor: theme.colors.warningLight },
          ]}>
          <Icon name="warning" size={16} color={theme.colors.warning} />
          <AppText
            variant="caption"
            color={theme.colors.warning}
            style={styles.warningText}>
            You've reached your session limit
          </AppText>
        </View>
      )}
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
    marginBottom: 4,
  },
  usageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  description: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    alignItems: 'center',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    marginLeft: 6,
  },
});

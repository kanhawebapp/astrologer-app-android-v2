import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { LiveSession, LiveSessionStatus } from '../../domain/liveTypes';
import { parseLiveTimestamp } from '../../data/liveSessionRepository';

interface LiveSessionItemProps {
  session: LiveSession;
  onEndLive?: (session: LiveSession) => void;
  canStartLive?: boolean;
  isStarting?: boolean;
  onStartLive?: (session: LiveSession) => void;
}

const formatDateTime = (date: Date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const dateLabel = isToday
    ? 'Today'
    : isTomorrow
    ? 'Tomorrow'
    : date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  const timeLabel = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${dateLabel} at ${timeLabel}`;
};

export const LiveSessionItem: React.FC<LiveSessionItemProps> = ({
  session,
  onEndLive,
  canStartLive = false,
  isStarting = false,
  onStartLive,
}) => {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (session.status) {
      case LiveSessionStatus.SCHEDULED:
        return theme.colors.primary;
      case LiveSessionStatus.LIVE:
        return theme.colors.error;
      case LiveSessionStatus.ENDED:
        return theme.colors.textTertiary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const scheduledDate = parseLiveTimestamp(session.scheduledAt);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surfaceSecondary },
      ]}>
      <View style={styles.header}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() + '20' },
          ]}>
          <AppText variant="caption" color={getStatusColor()}>
            {session.status}
          </AppText>
        </View>
      </View>

      <AppText variant="h4" color={theme.colors.text} style={styles.title}>
        {session.title}
      </AppText>

      <View style={styles.metaRow}>
        <Icon name="time-outline" size={14} color={theme.colors.textTertiary} />
        <AppText variant="caption" color={theme.colors.textTertiary}>
          {scheduledDate ? formatDateTime(scheduledDate) : 'Time not set'}
        </AppText>
      </View>

      {onStartLive && canStartLive && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isStarting
                  ? theme.colors.textTertiary
                  : theme.colors.error,
              },
            ]}
            onPress={() => onStartLive(session)}
            disabled={isStarting}
            activeOpacity={0.8}>
            <Icon name="radio-button-on" size={16} color={theme.colors.white} />
            <AppText variant="caption" color={theme.colors.white}>
              {isStarting ? 'Starting...' : 'Start Live'}
            </AppText>
          </TouchableOpacity>
        </View>
      )}

      {onEndLive && session.status === LiveSessionStatus.LIVE && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
            onPress={() => onEndLive(session)}
            activeOpacity={0.8}>
            <Icon name="close" size={16} color={theme.colors.white} />
            <AppText variant="caption" color={theme.colors.white}>
              End Live
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  title: {
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
});

export default LiveSessionItem;

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { LiveSession, LiveSessionStatus } from '../../domain/liveTypes';

interface LiveSessionItemProps {
  session: LiveSession;
  onCancel?: (sessionId: string) => void;
  onStartNow?: (sessionId: string) => void;
  showActions?: boolean;
}

export const LiveSessionItem: React.FC<LiveSessionItemProps> = ({
  session,
  onCancel,
  onStartNow,
  showActions = true,
}) => {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (session.status) {
      case LiveSessionStatus.SCHEDULED:
        return theme.colors.primary;
      case LiveSessionStatus.LIVE:
        return theme.colors.error;
      case LiveSessionStatus.COMPLETED:
        return theme.colors.success;
      case LiveSessionStatus.CANCELLED:
        return theme.colors.textTertiary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (session.status) {
      case LiveSessionStatus.SCHEDULED:
        return 'Scheduled';
      case LiveSessionStatus.LIVE:
        return 'Live';
      case LiveSessionStatus.COMPLETED:
        return 'Completed';
      case LiveSessionStatus.CANCELLED:
        return 'Cancelled';
      default:
        return session.status;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const dateLabel = isToday
      ? 'Today'
      : isTomorrow
      ? 'Tomorrow'
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const timeLabel = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return `${dateLabel} at ${timeLabel}`;
  };

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
            {getStatusLabel()}
          </AppText>
        </View>
        {session.status === LiveSessionStatus.COMPLETED && (
          <View style={styles.earningsContainer}>
            <Icon name="cash-outline" size={14} color={theme.colors.success} />
            <AppText variant="body2" color={theme.colors.success}>
              ₹{session.stats.earnings}
            </AppText>
          </View>
        )}
      </View>

      <AppText variant="h4" color={theme.colors.text} style={styles.title}>
        {session.title}
      </AppText>

      {session.description && (
        <AppText
          variant="body2"
          color={theme.colors.textSecondary}
          numberOfLines={2}
          style={styles.description}>
          {session.description}
        </AppText>
      )}

      <View style={styles.metaRow}>
        <Icon name="time-outline" size={14} color={theme.colors.textTertiary} />
        <AppText variant="caption" color={theme.colors.textTertiary}>
          {formatDateTime(session.scheduledAt)}
        </AppText>
        {session.status === LiveSessionStatus.COMPLETED && (
          <>
            <View
              style={[
                styles.divider,
                { backgroundColor: theme.colors.textTertiary },
              ]}
            />
            <Icon
              name="eye-outline"
              size={14}
              color={theme.colors.textTertiary}
            />
            <AppText variant="caption" color={theme.colors.textTertiary}>
              {session.stats.viewers} viewers
            </AppText>
          </>
        )}
      </View>

      {showActions && session.status === LiveSessionStatus.SCHEDULED && (
        <View style={styles.actionsRow}>
          {onStartNow && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.error },
              ]}
              onPress={() => onStartNow(session.id)}
              activeOpacity={0.8}>
              <Icon name="play" size={16} color={theme.colors.white} />
              <AppText variant="caption" color={theme.colors.white}>
                Start Now
              </AppText>
            </TouchableOpacity>
          )}
          {onCancel && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.cancelButton,
                { borderColor: theme.colors.textTertiary },
              ]}
              onPress={() => onCancel(session.id)}
              activeOpacity={0.8}>
              <Icon name="close" size={16} color={theme.colors.textTertiary} />
              <AppText variant="caption" color={theme.colors.textTertiary}>
                Cancel
              </AppText>
            </TouchableOpacity>
          )}
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
  earningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  divider: {
    width: 1,
    height: 12,
    marginHorizontal: 8,
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
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
});

export default LiveSessionItem;

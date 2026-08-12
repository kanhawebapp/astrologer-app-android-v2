import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { Session, SessionStatus, SessionType } from '../../domain/types';

interface SessionCardProps {
  session: Session;
  onPress: (session: Session) => void;
}

const STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; iconName: string; color: string }
> = {
  active: {
    label: 'Active',
    iconName: 'radio-button-checked',
    color: '#22C55E',
  },
  pending: { label: 'Pending', iconName: 'schedule', color: '#F59E0B' },
  completed: { label: 'Completed', iconName: 'check-circle', color: '#6B7280' },
  missed: { label: 'Missed', iconName: 'cancel', color: '#EF4444' },
};

const TYPE_CONFIG: Record<SessionType, { label: string; iconName: string }> = {
  chat: { label: 'Chat', iconName: 'chat' },
  call: { label: 'Call', iconName: 'phone' },
  video: { label: 'Video', iconName: 'videocam' },
};

const formatTime = (isoTime: string): string => {
  const date = new Date(isoTime);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDuration = (seconds: number): string => {
  if (seconds === 0) return '--';
  const minutes = Math.floor(seconds / 60);
  if (minutes === 0) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatDate = (isoTime: string): string => {
  const date = new Date(isoTime);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

export const SessionCard: React.FC<SessionCardProps> = React.memo(
  ({ session, onPress }) => {
    const { theme } = useTheme();

    const statusConfig = STATUS_CONFIG[session.status];
    const typeConfig = TYPE_CONFIG[session.type];

    const statusColor = statusConfig.color;
    const typeColor =
      session.type === SessionType.CHAT
        ? theme.colors.info
        : theme.colors.accentPurple;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => onPress(session)}
        activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.colors.primary + 20 },
              ]}>
              <AppText variant="h5" color={theme.colors.primary}>
                {session.userName?.charAt(0).toUpperCase() || '?'}
              </AppText>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <AppText
                  variant="body1"
                  color={theme.colors.text}
                  numberOfLines={1}
                  style={styles.userName}>
                  {session.userName}
                </AppText>
                {session.isLive && (
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <AppText variant="caption" style={styles.liveText}>
                      LIVE
                    </AppText>
                  </View>
                )}
              </View>
              <View style={styles.metaRow}>
                <Icon name={typeConfig.iconName} size={14} color={typeColor} />
                <AppText
                  variant="caption"
                  color={typeColor}
                  style={styles.typeLabel}>
                  {typeConfig.label}
                </AppText>
                <View style={styles.dotSeparator} />
                <AppText variant="caption" color={theme.colors.textTertiary}>
                  {formatDate(session.startTime)} • {formatTime(session.startTime)}
                </AppText>
              </View>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + '18' },
            ]}>
            <Icon name={statusConfig.iconName} size={12} color={statusColor} />
            <AppText
              variant="caption"
              color={statusColor}
              style={styles.statusLabel}>
              {statusConfig.label}
            </AppText>
          </View>
        </View>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.border }]}
        />

        <View style={styles.cardFooter}>
          <View style={styles.metaItem}>
            <Icon name="timelapse" size={16} color={theme.colors.textTertiary} />
            <AppText variant="caption" color={theme.colors.textSecondary}>
              {formatDuration(session.duration)}
            </AppText>
          </View>
          <View style={styles.metaItem}>
            {session.rating && session.rating > 0 ? (
              <>
                <Icon name="star" size={16} color={theme.colors.warning} />
                <AppText variant="caption" color={theme.colors.textSecondary}>
                  {session.rating.toFixed(1)}
                </AppText>
              </>
            ) : (
              <AppText variant="caption" color={theme.colors.textTertiary}>
                Not rated
              </AppText>
            )}
          </View>
          <View style={styles.amountContainer}>
            {session.earnings > 0 ? (
              <>
                <AppText variant="label" color={theme.colors.success}>
                  ₹{session.earnings}
                </AppText>
                <AppText variant="caption" color={theme.colors.textTertiary} style={styles.earningsLabel}>
                  Earned
                </AppText>
              </>
            ) : (
              <AppText variant="caption" color={theme.colors.textTertiary}>
                No earnings
              </AppText>
            )}
          </View>
          {/* <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.primary + 20
                // session.status === SessionStatus.ACTIVE
                //   ? theme.colors.primary
                //   : theme.colors.surfaceSecondary,
              },
            ]}
            onPress={() => onPress(session)}
            activeOpacity={0.7}>
            <Icon
              name={session.status === SessionStatus.ACTIVE ? 'phone-in-talk' : 'visibility'}
              size={16}
              color={
                session.status === SessionStatus.ACTIVE
                  ? theme.colors.white
                  : theme.colors.primary
              }
            />
          </TouchableOpacity> */}
        </View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontWeight: '600',
    flex: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 4,
  },
  liveText: {
    color: '#22C55E',
    fontWeight: '600',
    fontSize: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  typeLabel: {
    marginLeft: 4,
    marginRight: 8,
    fontWeight: '500',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusLabel: {
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 11,
  },
  divider: {
    height: 1,
    marginVertical: 14,
    opacity: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 4,
  },
  amountContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 10,
  },
  earningsLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AppText} from '../../../../components/common/AppText';
import {useTheme} from '../../../../hooks/useTheme';
import {Session, SessionStatus, SessionType} from '../../domain/types';

interface SessionCardProps {
  session: Session;
  onPress: (session: Session) => void;
  onViewMessages?: (session: Session) => void;
}

const STATUS_CONFIG: Record<
  SessionStatus,
  {label: string; iconName: string; color: string}
> = {
  active: {
    label: 'Active',
    iconName: 'radio-button-checked',
    color: '#22C55E',
  },
  pending: {label: 'Pending', iconName: 'schedule', color: '#F59E0B'},
  completed: {label: 'Completed', iconName: 'check-circle', color: '#6B7280'},
  cancelled: {label: 'Cancelled', iconName: 'block', color: '#EF4444'},
};

const TYPE_CONFIG: Record<SessionType, {label: string; iconName: string}> = {
  chat: {label: 'Chat', iconName: 'chat'},
  call: {label: 'Call', iconName: 'phone'},
};

const formatDateTime = (isoTime: string): string => {
  if (!isoTime) {
    return '-';
  }
  const date = new Date(isoTime);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDuration = (
  minutes: number | undefined,
  seconds: number | undefined,
): string => {
  const totalMinutes = minutes || 0;
  if (totalMinutes === 0 && (!seconds || seconds === 0)) {
    return '0 min';
  }
  if (seconds && seconds > 0 && totalMinutes === 0) {
    return `${Math.ceil(seconds / 60)} min`;
  }
  return `${totalMinutes} min`;
};

export const SessionCard: React.FC<SessionCardProps> = React.memo(
  ({session, onPress, onViewMessages}) => {
    const {theme} = useTheme();

    const statusConfig = STATUS_CONFIG[session.status];
    const typeConfig = TYPE_CONFIG[session.type];

    const statusColor = statusConfig.color;
    const typeColor =
      session.type === SessionType.CHAT
        ? theme.colors.info
        : theme.colors.accentPurple;

    const earnedAmount = session.coinsEarned ?? session.earnings ?? 0;
    const displayRate = session.ratePerMin ?? 0;

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
                {backgroundColor: theme.colors.primary + '20'},
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
                  {formatDateTime(session.startTime)}
                </AppText>
              </View>
            </View>
          </View>
          <View
            style={[styles.statusBadge, {backgroundColor: statusColor + '18'}]}>
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
          style={[styles.divider, {backgroundColor: theme.colors.border}]}
        />

        <View style={styles.cardFooter}>
          <View style={styles.metaItem}>
            <Icon name="schedule" size={14} color={theme.colors.textTertiary} />
            <AppText variant="caption" color={theme.colors.textSecondary}>
              {formatDuration(session.durationMinutes, session.durationSec)} min
            </AppText>
          </View>
          <View style={styles.metaItem}>
            <Icon
              name="account-balance-wallet"
              size={14}
              color={theme.colors.textTertiary}
            />
            <AppText variant="caption" color={theme.colors.textSecondary}>
              ₹{displayRate}/min
            </AppText>
          </View>
          <View style={styles.amountContainer}>
            {earnedAmount > 0 ? (
              <>
                <AppText variant="label" color={theme.colors.success}>
                  {session.type === SessionType.CALL ? '₹' : ''}
                  {earnedAmount}
                </AppText>
                <AppText
                  variant="caption"
                  color={theme.colors.textTertiary}
                  style={styles.earningsLabel}>
                  Coins Earned
                </AppText>
              </>
            ) : (
              <AppText variant="caption" color={theme.colors.textTertiary}>
                0 coins
              </AppText>
            )}
          </View>
        </View>

        {session.source ? (
          <View style={styles.sourceRow}>
            <AppText variant="caption" color={theme.colors.textTertiary}>
              Source: {session.source}
            </AppText>
          </View>
        ) : null}

        {onViewMessages ? (
          <TouchableOpacity
            style={[
              styles.viewMessagesButton,
              {
                borderColor: theme.colors.primary + '40',
                backgroundColor: theme.colors.primary + '10',
              },
            ]}
            onPress={e => {
              e.stopPropagation();
              onViewMessages(session);
            }}
            activeOpacity={0.7}>
            <Icon name="chat" size={14} color={theme.colors.primary} />
            <AppText
              variant="caption"
              color={theme.colors.primary}
              style={styles.viewMessagesText}>
              View Message
            </AppText>
          </TouchableOpacity>
        ) : null}
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
    shadowOffset: {width: 0, height: 2},
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
    flexWrap: 'wrap',
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
  sourceRow: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  viewMessagesButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  viewMessagesText: {
    fontWeight: '600',
  },
});

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
  cancelled: { label: 'Cancelled', iconName: 'block', color: '#EF4444' },
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


const formatDuration = (durationMinutes?: number | null): string => {
  const totalSeconds = Math.floor(Number(durationMinutes || 0));

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes} min ${seconds.toString().padStart(2, '0')} sec`;
};

const formatSessionId = (id?: string): string => {
  if (!id) {
    return '-';
  }
  return id.slice(0, 8);
};

const formatRatingStars = (rating?: number | null): string => {
  const filled = Math.max(0, Math.min(5, Math.floor(Number(rating) || 0)));
  return `${'★'.repeat(filled)}${'☆'.repeat(5 - filled)}`;
};

export const SessionCard: React.FC<SessionCardProps> = React.memo(
  ({ session, onPress }) => {
    const { theme } = useTheme();

    const statusConfig = STATUS_CONFIG[session.status];
    const statusColor = statusConfig.color;
    const isChat = session.type === SessionType.CHAT;
    const showRating = isChat || session.rating != null;
    console.log('SessionCard rendered for session:', session);
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
                { backgroundColor: theme.colors.primary + '20' },
              ]}>
              <AppText variant="h5" color={theme.colors.primary}>
                {session.userName?.charAt(0).toUpperCase() || '?'}
              </AppText>
            </View>
            <View style={styles.userInfo}>
              <AppText
                variant="body1"
                color={theme.colors.text}
                numberOfLines={1}
                style={styles.userName}>
                {session.userName}
              </AppText>
            </View>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
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

        <View style={styles.fields}>
          <FieldRow
            label="Session ID"
            value={formatSessionId(session.id)}
            theme={theme}
          />
          <FieldRow
            label="User ID"
            value={formatSessionId(session.userId)}
            theme={theme}
          />
          <FieldRow
            label="Duration"
            value={formatDuration(session.durationMinutes)}
            theme={theme}
          />
          {isChat ? (
            <FieldRow
              label="Created At"
              value={formatDateTime(session.startTime)}
              theme={theme}
            />
          ) : null}
          <FieldRow
            label="Rate / Min"
            value={
              session.ratePerMin != null ? `₹${session.ratePerMin}/min` : '-'
            }
            theme={theme}
          />
          <FieldRow
            label="Earned"
            value={
              `₹${session.commission != null ? String(session.commission) : '-'}`
            }
            theme={theme}
            valueColor="#22C55E"

          />
          {showRating ? (
            <FieldRow
              label="Rating"
              value={formatRatingStars(session.rating)}
              theme={theme}
              valueColor={theme.colors.accentGold}
            />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  },
);

const FieldRow: React.FC<{
  label: string;
  value: string;
  theme: any;
  valueColor?: string;
}> = ({ label, value, theme, valueColor }) => (
  <View style={styles.fieldRow}>
    <AppText variant="caption" color={theme.colors.textTertiary}>
      {label}
    </AppText>
    <AppText
      variant="caption"
      color={valueColor || theme.colors.textSecondary}
      style={styles.fieldValue}>
      {value}
    </AppText>
  </View>
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
    marginRight: 8,
  },
  userName: {
    fontWeight: '600',
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
  fields: {
    gap: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldValue: {
    fontWeight: '500',
    marginLeft: 12,
    flexShrink: 1,
    textAlign: 'right',
  },
});

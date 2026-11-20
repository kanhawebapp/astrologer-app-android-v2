import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AppText} from '../../../../components/common/AppText';
import {useTheme} from '../../../../hooks/useTheme';
import {formatDate, formatTime} from '../../../../utils/helpers';
import {LiveHistoryItem} from '../../../../services/api/liveHistory/liveHistory.types';

interface LiveHistoryItemCardProps {
  item: LiveHistoryItem;
}

const formatDurationSeconds = (
  durationSeconds?: number | null,
): string | null => {
  if (durationSeconds == null || Number.isNaN(Number(durationSeconds))) {
    return null;
  }

  const total = Math.max(0, Math.floor(Number(durationSeconds)));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0',
  )}`;
};

const formatRequestedAt = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${formatDate(date)} · ${formatTime(date)}`;
};

const formatDisplayValue = (value: unknown): string | null => {
  if (value == null) {
    return null;
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      return null;
    }
    return String(value);
  }
  const text = String(value).trim();
  if (
    !text ||
    text === '-' ||
    text.toLowerCase() === 'null' ||
    text.toLowerCase() === 'undefined'
  ) {
    return null;
  }
  return text;
};

const getStatusStyle = (status?: string | null) => {
  const normalized = (status || '').toUpperCase();
  switch (normalized) {
    case 'ENDED':
      return {label: 'Ended', color: '#16A34A'};
    case 'REJECTED':
      return {label: 'Rejected', color: '#DC2626'};
    case 'CANCELLED':
      return {label: 'Cancelled', color: '#6B7280'};
    case 'PENDING':
      return {label: 'Pending', color: '#D97706'};
    case 'ACCEPTED':
      return {label: 'Accepted', color: '#2563EB'};
    default:
      return {
        label: normalized
          ? normalized.charAt(0) + normalized.slice(1).toLowerCase()
          : 'Unknown',
        color: '#8E8AA5',
      };
  }
};

const getInteractionMeta = (interactionType?: string | null) => {
  const normalized = (interactionType || '').toUpperCase();
  if (normalized === 'VIDEO') {
    return {label: 'Video Call', icon: 'videocam'};
  }
  if (normalized === 'AUDIO') {
    return {label: 'Audio Call', icon: 'call'};
  }
  return {
    label: normalized
      ? normalized.charAt(0) + normalized.slice(1).toLowerCase()
      : 'Live Call',
    icon: 'live-tv',
  };
};

export const LiveHistoryItemCard: React.FC<LiveHistoryItemCardProps> =
  React.memo(({item}) => {
    const {theme} = useTheme();
    const statusStyle = useMemo(
      () => getStatusStyle(item.status),
      [item.status],
    );
    const interactionMeta = useMemo(
      () => getInteractionMeta(item.interactionType),
      [item.interactionType],
    );

    const userName = formatDisplayValue(item.userName) || 'Unknown User';
    const sessionIdRaw = formatDisplayValue(item.sessionId);
    const sessionId = sessionIdRaw ? sessionIdRaw.slice(0, 8) : null;
    const requestedAt = formatRequestedAt(item.requestedAt);
    const duration = formatDurationSeconds(item.durationSeconds);
    const ratePerMin = formatDisplayValue(item.ratePerMin);
    const chargedCoins = formatDisplayValue(item.chargedCoins);
    const astrologerEarned = formatDisplayValue(item.astrologerEarned);

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}>
        <View style={styles.cardHeader}>
          <View style={styles.userRow}>
            <View
              style={[
                styles.avatar,
                {backgroundColor: theme.colors.primary + '18'},
              ]}>
              <Icon
                name={interactionMeta.icon}
                size={22}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.userInfo}>
              <AppText
                variant="body1"
                color={theme.colors.text}
                numberOfLines={1}
                style={styles.userName}>
                {userName}
              </AppText>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                {interactionMeta.label}
              </AppText>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              {backgroundColor: statusStyle.color + '18'},
            ]}>
            <AppText
              variant="caption"
              color={statusStyle.color}
              style={styles.statusLabel}>
              {statusStyle.label}
            </AppText>
          </View>
        </View>

        <View
          style={[styles.divider, {backgroundColor: theme.colors.border}]}
        />

        <View style={styles.fields}>
          {sessionId ? (
            <FieldRow label="Session ID" value={sessionId} theme={theme} />
          ) : null}
          {requestedAt ? (
            <FieldRow label="Requested" value={requestedAt} theme={theme} />
          ) : null}
          {duration ? (
            <FieldRow label="Duration" value={duration} theme={theme} />
          ) : null}
          {ratePerMin ? (
            <FieldRow
              label="Rate / Min"
              value={`₹${ratePerMin}`}
              theme={theme}
            />
          ) : null}
          {chargedCoins ? (
            <FieldRow
              label="Charged"
              value={`₹${chargedCoins}`}
              theme={theme}
            />
          ) : null}
          {astrologerEarned ? (
            <FieldRow
              label="Earnings"
              value={`₹${astrologerEarned}`}
              theme={theme}
              valueColor={theme.colors.success}
            />
          ) : null}
        </View>
      </View>
    );
  });

const FieldRow: React.FC<{
  label: string;
  value: string;
  theme: any;
  valueColor?: string;
}> = ({label, value, theme, valueColor}) => (
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
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusLabel: {
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

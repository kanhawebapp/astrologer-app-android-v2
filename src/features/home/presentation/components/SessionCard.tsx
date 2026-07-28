import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { Session } from '../../domain/types';

interface SessionCardProps {
  session: Session;
  onPress?: () => void;
}

const getSessionIcon = (type: Session['type']): string => {
  switch (type) {
    case 'chat':
      return 'chat';
    case 'call':
      return 'call';
    case 'video':
      return 'videocam';
  }
};

const getStatusColor = (status: Session['status'], theme: any): string => {
  switch (status) {
    case 'active':
      return theme.colors.success;
    case 'pending':
      return theme.colors.warning;
    case 'completed':
      return theme.colors.primary;
  }
};

const getSessionGradient = (type: Session['type']): string[] => {
  switch (type) {
    case 'chat':
      return ['#6366F1', '#4F46E5'];
    case 'call':
      return ['#10B981', '#059669'];
    case 'video':
      return ['#F59E0B', '#D97706'];
  }
};

const formatDuration = (minutes: number): string => {
  if (minutes === 0) return '--';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onPress,
}) => {
  const { theme } = useTheme();
  const statusColor = getStatusColor(session.status, theme);
  const gradientColors = getSessionGradient(session.type);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: session.userImage }} style={styles.avatar} />
        <LinearGradient colors={gradientColors} style={styles.avatarBadge}>
          <Icon name={getSessionIcon(session.type)} size={10} color="#FFFFFF" />
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameRow}>
            <AppText
              variant="body1"
              color={theme.colors.text}
              style={styles.userName}>
              {session.userName}
            </AppText>
            {session.status === 'active' && <View style={styles.liveDot} />}
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}12` },
            ]}>
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <AppText
              variant="caption"
              color={statusColor}
              style={styles.statusText}>
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </AppText>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.typeRow}>
            <Icon
              name={getSessionIcon(session.type)}
              size={14}
              color={theme.colors.textSecondary}
            />
            <AppText variant="caption" color={theme.colors.textSecondary}>
              {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
            </AppText>
          </View>
          {session.status !== 'pending' && (
            <View style={styles.typeRow}>
              <Icon
                name="schedule"
                size={14}
                color={theme.colors.textSecondary}
              />
              <AppText variant="caption" color={theme.colors.textSecondary}>
                {formatDuration(session.duration)}
              </AppText>
            </View>
          )}
        </View>
      </View>

      {(session.status === 'completed' || session.status === 'active') && (
        <View style={styles.amountContainer}>
          <AppText
            variant="h5"
            color={theme.colors.success}
            style={styles.amountText}>
            ₹{session.amount}
          </AppText>
          <View style={styles.arrowIcon}>
            <Icon
              name="chevron-right"
              size={18}
              color={theme.colors.textTertiary}
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    marginLeft: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontWeight: '600',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 11,
  },
  details: {
    flexDirection: 'row',
    gap: 18,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amountText: {
    fontWeight: '700',
  },
  arrowIcon: {
    marginTop: 4,
  },
});

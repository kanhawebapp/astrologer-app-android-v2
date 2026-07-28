import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { Activity } from '../../domain/types';

interface ActivityFeedProps {
  activities: Activity[];
  onActivityPress?: (activity: Activity) => void;
}

const getActivityIcon = (type: Activity['type']): string => {
  switch (type) {
    case 'session_booked':
      return 'event-available';
    case 'payment_received':
      return 'payments';
    case 'chat_started':
      return 'chat';
    case 'call_ended':
      return 'call-end';
    case 'rating_received':
      return 'star';
    default:
      return 'notifications';
  }
};

const getActivityColor = (type: Activity['type'], theme: any): string => {
  switch (type) {
    case 'session_booked':
      return theme.colors.primary;
    case 'payment_received':
      return theme.colors.success;
    case 'chat_started':
      return theme.colors.info;
    case 'call_ended':
      return theme.colors.warning;
    case 'rating_received':
      return theme.colors.accentGold;
    default:
      return theme.colors.primary;
  }
};

const getActivityGradient = (type: Activity['type']): string[] => {
  switch (type) {
    case 'session_booked':
      return ['#6366F1', '#4F46E5'];
    case 'payment_received':
      return ['#10B981', '#059669'];
    case 'chat_started':
      return ['#3B82F6', '#2563EB'];
    case 'call_ended':
      return ['#F59E0B', '#D97706'];
    case 'rating_received':
      return ['#D4AF37', '#B8962E'];
    default:
      return ['#6C63FF', '#5A52E0'];
  }
};

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

interface ActivityItemProps {
  activity: Activity;
  theme: any;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, theme }) => {
  const iconColor = getActivityColor(activity.type, theme);
  const gradientColors = getActivityGradient(activity.type);

  return (
    <View
      style={[
        styles.activityItem,
        { borderBottomColor: theme.colors.borderLight },
      ]}>
      <View style={styles.iconWrapperContainer}>
        <LinearGradient colors={gradientColors} style={styles.iconWrapper}>
          <Icon
            name={getActivityIcon(activity.type)}
            size={18}
            color={theme.colors.white}
          />
        </LinearGradient>
      </View>
      <View style={styles.activityContent}>
        <AppText
          variant="body1"
          color={theme.colors.text}
          numberOfLines={1}
          style={styles.activityTitle}>
          {activity.title}
        </AppText>
        <AppText
          variant="caption"
          color={theme.colors.textSecondary}
          numberOfLines={1}>
          {activity.description}
        </AppText>
      </View>
      <View style={styles.activityMeta}>
        {activity.amount && (
          <View
            style={[
              styles.amountBadge,
              { backgroundColor: `${theme.colors.success}12` },
            ]}>
            <AppText
              variant="body2"
              color={theme.colors.success}
              style={styles.amountText}>
              +₹{activity.amount}
            </AppText>
          </View>
        )}
        <View style={styles.timeContainer}>
          <Icon name="schedule" size={12} color={theme.colors.textTertiary} />
          <AppText
            variant="caption"
            color={theme.colors.textTertiary}
            style={styles.timeText}>
            {formatTime(activity.timestamp)}
          </AppText>
        </View>
      </View>
    </View>
  );
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onActivityPress,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <LinearGradient
            colors={['#FF6584', '#EE5A73']}
            style={styles.titleIcon}>
            <Icon name="notifications" size={18} color={theme.colors.white} />
          </LinearGradient>
          <AppText variant="h5" color={theme.colors.text}>
            Recent Activity
          </AppText>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <View style={styles.seeAllButton}>
            <AppText variant="body2" color={theme.colors.primary}>
              See All
            </AppText>
            <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.activityList}>
        {activities.length > 0 ? (
          <FlatList
            data={activities}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ActivityItem activity={item} theme={theme} />
            )}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Icon name="inbox" size={32} color={theme.colors.textTertiary} />
            </View>
            <AppText variant="body2" color={theme.colors.textSecondary}>
              No recent activity
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityList: {
    borderRadius: 18,
    paddingHorizontal: 6,
    paddingVertical: 6,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconWrapperContainer: {
    position: 'relative',
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
    marginRight: 8,
  },
  activityTitle: {
    fontWeight: '600',
    marginBottom: 3,
  },
  activityMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  amountText: {
    fontWeight: '700',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
  },
  emptyState: {
    padding: 28,
    alignItems: 'center',
  },
  emptyIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
});

import React, { memo, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { Activity } from '../../domain/types';

interface ActivityTimelineProps {
  activities: Activity[];
  onActivityPress?: (activity: Activity) => void;
}

interface ActivityItemProps {
  activity: Activity;
  isLast: boolean;
}

const ActivityItem: React.FC<ActivityItemProps> = memo(
  ({ activity, isLast }) => {
    const { theme } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const getIconConfig = () => {
      switch (activity.type) {
        case 'session_booked':
          return { name: 'event-available', color: theme.colors.info };
        case 'payment_received':
          return {
            name: 'account-balance-wallet',
            color: theme.colors.success,
          };
        case 'chat_started':
          return { name: 'chat', color: theme.colors.primary };
        case 'call_ended':
          return { name: 'call-end', color: theme.colors.secondary };
        case 'rating_received':
          return { name: 'star', color: theme.colors.accentGold };
        default:
          return { name: 'info', color: theme.colors.textTertiary };
      }
    };

    const getTimeAgo = (timestamp: string) => {
      const now = new Date();
      const time = new Date(timestamp);
      const diffMs = now.getTime() - time.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return time.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    };

    const handlePressIn = () => {
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    };

    const iconConfig = getIconConfig();

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.activityItem}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}>
          <View style={styles.timeline}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.surfaceSecondary },
              ]}>
              <Icon name={iconConfig.name} size={18} color={iconConfig.color} />
            </View>
            {!isLast && (
              <View
                style={[
                  styles.line,
                  { backgroundColor: theme.colors.borderLight },
                ]}
              />
            )}
          </View>
          <View style={styles.activityContent}>
            <View style={styles.activityHeader}>
              <AppText
                variant="body1"
                style={[styles.title, { color: theme.colors.text }]}>
                {activity.title}
              </AppText>
              {activity.amount && (
                <AppText
                  variant="body1"
                  style={{ color: theme.colors.success, fontWeight: '700' }}>
                  +₹{activity.amount}
                </AppText>
              )}
            </View>
            <AppText
              variant="body2"
              style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
              {activity.description}
            </AppText>
            <AppText
              variant="caption"
              style={{ color: theme.colors.textTertiary, marginTop: 6 }}>
              {getTimeAgo(activity.timestamp)}
            </AppText>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

export const ActivityTimeline: React.FC<ActivityTimelineProps> = memo(
  ({ activities, onActivityPress }) => {
    const { theme } = useTheme();

    const sortedActivities = useMemo(() => {
      return [...activities].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    }, [activities]);

    const renderItem = ({ item, index }: { item: Activity; index: number }) => (
      <ActivityItem
        activity={item}
        isLast={index === sortedActivities.length - 1}
      />
    );

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon name="history" size={22} color={theme.colors.primary} />
          <AppText
            variant="h4"
            style={[styles.headerTitle, { color: theme.colors.text }]}>
            Recent Activity
          </AppText>
        </View>
        <FlatList
          data={sortedActivities}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    marginLeft: 10,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  timeline: {
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
    flex: 1,
  },
});

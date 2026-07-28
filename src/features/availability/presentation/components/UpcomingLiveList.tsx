import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { LiveSession } from '../../domain/liveTypes';
import { LiveSessionItem } from './LiveSessionItem';

interface UpcomingLiveListProps {
  sessions: LiveSession[];
  onCancel?: (sessionId: string) => void;
  onStartNow?: (sessionId: string) => void;
}

export const UpcomingLiveList: React.FC<UpcomingLiveListProps> = ({
  sessions,
  onCancel,
  onStartNow,
}) => {
  const { theme } = useTheme();

  if (sessions.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: theme.colors.surface },
        ]}>
        <View
          style={[
            styles.emptyIcon,
            { backgroundColor: theme.colors.surfaceSecondary },
          ]}>
          <Icon
            name="calendar-outline"
            size={24}
            color={theme.colors.textTertiary}
          />
        </View>
        <AppText
          variant="body2"
          color={theme.colors.textSecondary}
          style={styles.emptyText}>
          No upcoming live sessions
        </AppText>
        <AppText variant="caption" color={theme.colors.textTertiary}>
          Schedule a session to get started
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <Icon name="calendar" size={20} color={theme.colors.primary} />
        <AppText variant="h4" color={theme.colors.text}>
          Upcoming Live Sessions
        </AppText>
        <View
          style={[
            styles.badge,
            { backgroundColor: theme.colors.primaryLight },
          ]}>
          <AppText variant="caption" color={theme.colors.white}>
            {sessions.length}
          </AppText>
        </View>
      </View>
      <FlatList
        data={sessions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <LiveSessionItem
            session={item}
            onCancel={onCancel}
            onStartNow={onStartNow}
          />
        )}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  emptyContainer: {
    padding: 24,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: {
    marginBottom: 4,
  },
});

export default UpcomingLiveList;

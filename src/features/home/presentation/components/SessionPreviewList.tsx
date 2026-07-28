import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { Session } from '../../domain/types';
import { SessionCard } from './SessionCard';

interface SessionPreviewListProps {
  sessions: Session[];
  onSessionPress?: (session: Session) => void;
  onViewAllPress?: () => void;
}

export const SessionPreviewList: React.FC<SessionPreviewListProps> = ({
  sessions,
  onSessionPress,
  onViewAllPress,
}) => {
  const { theme } = useTheme();
  const recentSessions = sessions.slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View
            style={[
              styles.titleIcon,
              { backgroundColor: `${theme.colors.primary}15` },
            ]}>
            <Icon name="history" size={18} color={theme.colors.primary} />
          </View>
          <AppText variant="h5" color={theme.colors.text}>
            Recent Sessions
          </AppText>
        </View>
        {sessions.length > 3 && (
          <TouchableOpacity onPress={onViewAllPress} activeOpacity={0.7}>
            <View style={styles.viewAllButton}>
              <AppText variant="body2" color={theme.colors.primary}>
                View All
              </AppText>
              <Icon
                name="arrow-forward"
                size={16}
                color={theme.colors.primary}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
      {recentSessions.length > 0 ? (
        <View
          style={[
            styles.sessionsContainer,
            { backgroundColor: theme.colors.surface },
          ]}>
          <FlatList
            data={recentSessions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <SessionCard
                session={item}
                onPress={() => onSessionPress?.(item)}
              />
            )}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      ) : (
        <View
          style={[
            styles.emptyContainer,
            { backgroundColor: theme.colors.surface },
          ]}>
          <View style={styles.emptyIconWrapper}>
            <Icon
              name="event-note"
              size={32}
              color={theme.colors.textTertiary}
            />
          </View>
          <AppText variant="body2" color={theme.colors.textSecondary}>
            No recent sessions
          </AppText>
          <AppText variant="caption" color={theme.colors.textTertiary}>
            Start a session to see it here
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  separator: {
    height: 4,
  },
  sessionsContainer: {
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyContainer: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
});

import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { LiveSession } from '../../domain/liveTypes';
import { LiveSessionItem } from './LiveSessionItem';

interface UpcomingLiveListProps {
  sessions: LiveSession[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  activeLiveId?: string;
  onRetry: () => void;
  onSchedulePress: () => void;
  onEndLive: (session: LiveSession) => void;
}

export const UpcomingLiveList: React.FC<UpcomingLiveListProps> = ({
  sessions,
  isLoading,
  hasLoaded,
  error,
  activeLiveId,
  onRetry,
  onSchedulePress,
  onEndLive,
}) => {
  const { theme } = useTheme();

  if (error && sessions.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: theme.colors.surface },
        ]}>
        <View
          style={[
            styles.emptyIcon,
            { backgroundColor: theme.colors.errorLight },
          ]}>
          <Icon
            name="cloud-offline-outline"
            size={24}
            color={theme.colors.error}
          />
        </View>
        <AppText
          variant="body2"
          color={theme.colors.textSecondary}
          style={styles.emptyText}>
          Could not load upcoming lives
        </AppText>
        <AppText
          variant="caption"
          color={theme.colors.textTertiary}
          style={styles.centerText}>
          {error}
        </AppText>
        <TouchableOpacity
          style={[styles.emptyAction, { borderColor: theme.colors.primary }]}
          onPress={onRetry}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <AppText variant="button" color={theme.colors.primary}>
              Retry
            </AppText>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  if (!hasLoaded && sessions.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: theme.colors.surface },
        ]}>
        <ActivityIndicator color={theme.colors.primary} />
        <AppText
          variant="caption"
          color={theme.colors.textTertiary}
          style={styles.loadingText}>
          Loading upcoming lives...
        </AppText>
      </View>
    );
  }

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
        <TouchableOpacity
          style={[styles.emptyAction, { borderColor: theme.colors.primary }]}
          onPress={onSchedulePress}>
          <AppText variant="button" color={theme.colors.primary}>
            Schedule a Live
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <Icon name="calendar" size={20} color={theme.colors.primary} />
        <AppText variant="h4" color={theme.colors.text}>
          Upcoming
        </AppText>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={styles.badgeSpacer}
          />
        ) : (
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.colors.primaryLight },
            ]}>
            <AppText variant="caption" color={theme.colors.white}>
              {sessions.length}
            </AppText>
          </View>
        )}
      </View>
      {error && (
        <TouchableOpacity
          style={[
            styles.inlineError,
            { backgroundColor: theme.colors.errorLight },
          ]}
          onPress={onRetry}>
          <AppText variant="caption" color={theme.colors.error}>
            {`Refresh failed: ${error}. Tap to retry.`}
          </AppText>
        </TouchableOpacity>
      )}
      <FlatList
        data={sessions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <LiveSessionItem
            session={item}
            onEndLive={item.id === activeLiveId ? undefined : onEndLive}
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
  badgeSpacer: {
    marginLeft: 'auto',
  },
  inlineError: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
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
  centerText: {
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 8,
  },
  emptyAction: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
    alignItems: 'center',
  },
});

export default UpcomingLiveList;

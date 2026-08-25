import React, {useCallback, useMemo} from 'react';
import {
  FlatList,
  StyleSheet,
  ListRenderItem,
  View,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import {ScreenContainer} from '../../../../components/layout/ScreenContainer';
import {AppText} from '../../../../components/common/AppText';
import {useTheme} from '../../../../hooks/useTheme';
import {useSessions} from '../hooks/useSessions';
import {Session} from '../../domain/types';
import {SessionCard, SessionFilterTabs, EmptyState} from '../components';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const ItemSeparator = () => <View style={styles.separator} />;

const ListHeader: React.FC<{
  activeFilter: string;
  onFilterChange: (filter: any) => void;
  activeSessionType: string;
  onSessionTypeChange: (type: any) => void;
  stats: any;
  theme: any;
}> = ({
  activeFilter,
  onFilterChange,
  activeSessionType,
  onSessionTypeChange,
  stats,
  theme,
}) => (
  <View>
    <View style={styles.headerTitle}>
      <AppText variant="h4" style={styles.title}>
        Sessions
      </AppText>
      <View
        style={[
          styles.statsContainer,
          {backgroundColor: theme.colors.primary + 20},
        ]}>
        <AppText variant="caption" style={styles.statsText}>
          {stats.totalSessions} sessions
        </AppText>
      </View>
    </View>
    <SessionFilterTabs
      activeFilter={activeFilter as any}
      onFilterChange={onFilterChange}
      activeSessionType={activeSessionType as any}
      onSessionTypeChange={onSessionTypeChange}
    />
  </View>
);

export const SessionsScreen: React.FC = () => {
  const {theme, mode} = useTheme();
  const {
    activeFilter,
    setActiveFilter,
    activeSessionType,
    setActiveSessionType,
    refreshing,
    isLoading,
    isLoadingMore,
    error,
    refresh,
    loadMore,
    setSelectedSession,
    stats,
    filteredSessions,
  } = useSessions();
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(mode === 'dark' ? 'light-content' : 'dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor(theme.colors.background);
      }
    }, [mode, theme.colors.background]),
  );

  const handleSessionPress = useCallback(
    async (session: Session) => {
      setSelectedSession(session);
      navigation.navigate('SessionDetailScreen', {
        session,
      });
    },
    [setSelectedSession, navigation],
  );

  const renderItem: ListRenderItem<Session> = useCallback(
    ({item}) => <SessionCard session={item} onPress={handleSessionPress} />,
    [handleSessionPress],
  );

  const keyExtractor = useCallback((item: Session) => item.id, []);

  const onRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) {
      return null;
    }
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [isLoadingMore, theme.colors.primary]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return null;
    }
    return (
      <EmptyState
        title={error ? 'Something went wrong' : 'No Sessions Found'}
        message={
          error
            ? error
            : "You don't have any sessions yet. Waiting for users to book sessions."
        }
      />
    );
  }, [isLoading, error]);

  const listHeader = useMemo(
    () => (
      <ListHeader
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        activeSessionType={activeSessionType}
        onSessionTypeChange={setActiveSessionType}
        stats={stats}
        theme={theme}
      />
    ),
    [
      activeFilter,
      setActiveFilter,
      activeSessionType,
      setActiveSessionType,
      stats,
      theme,
    ],
  );

  const isInitialLoading = isLoading && filteredSessions.length === 0;

  return (
    <ScreenContainer scrollable={false} withPadding={false}>
      {isInitialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={filteredSessions}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={listHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={ItemSeparator}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={21}
          removeClippedSubviews={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  separator: {
    height: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: '700',
  },
  statsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statsText: {
    color: '#6C63FF',
    fontWeight: '600',
  },
});

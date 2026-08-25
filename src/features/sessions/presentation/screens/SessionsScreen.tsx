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
import {
  SessionCard,
  SessionTypeTabs,
  SessionStatusTabs,
  EmptyState,
} from '../components';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const ItemSeparator = () => <View style={styles.separator} />;

const ListHeader: React.FC<{
  activeType: 'CALL' | 'CHAT';
  onTypeChange: (type: 'CALL' | 'CHAT') => void;
  activeStatus: 'COMPLETED' | 'CANCELLED';
  onStatusChange: (status: 'COMPLETED' | 'CANCELLED') => void;
}> = ({activeType, onTypeChange, activeStatus, onStatusChange}) => (
  <View>
    <View style={styles.headerTitle}>
      <AppText variant="h4" style={styles.title}>
        Session History
      </AppText>
    </View>
    <SessionTypeTabs activeType={activeType} onTypeChange={onTypeChange} />
    <SessionStatusTabs
      activeStatus={activeStatus}
      onStatusChange={onStatusChange}
    />
    <View style={styles.divider} />
  </View>
);

export const SessionsScreen: React.FC = () => {
  const {theme, mode} = useTheme();
  const {
    sessions,
    activeType,
    setActiveType,
    activeStatus,
    setActiveStatus,
    refreshing,
    loading,
    loadingMore,
    error,
    refresh,
    loadMore,
    setSelectedSession,
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
    (session: Session) => {
      setSelectedSession(session);
      navigation.navigate('SessionDetailScreen', {
        sessionId: session.id,
        roomId: session.roomId,
        session,
      });
    },
    [setSelectedSession, navigation],
  );

  const handleViewMessages = useCallback(
    (session: Session) => {
      navigation.navigate('SessionMessagesScreen', {
        sessionId: session.id,
        userName: session.userName,
      });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<Session> = useCallback(
    ({item}) => (
      <SessionCard
        session={item}
        onPress={handleSessionPress}
        onViewMessages={handleViewMessages}
      />
    ),
    [handleSessionPress, handleViewMessages],
  );

  const keyExtractor = useCallback((item: Session) => item.id, []);

  const onRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) {
      return null;
    }
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [loadingMore, theme.colors.primary]);

  const renderEmpty = useCallback(() => {
    if (loading) {
      return null;
    }
    const title = error
      ? 'Something went wrong'
      : `No ${activeStatus.toLowerCase()} ${activeType.toLowerCase()} sessions found`;
    const message = error
      ? error
      : `You don't have any ${activeStatus.toLowerCase()} ${activeType.toLowerCase()} sessions yet.`;
    return <EmptyState title={title} message={message} />;
  }, [loading, error, activeStatus, activeType]);

  const listHeader = useMemo(
    () => (
      <ListHeader
        activeType={activeType}
        onTypeChange={setActiveType}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
      />
    ),
    [activeType, activeStatus, setActiveType, setActiveStatus],
  );

  const isInitialLoading = loading && sessions.length === 0;

  return (
    <ScreenContainer scrollable={false} withPadding={false}>
      {isInitialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={sessions}
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
  divider: {
    height: 1,
    backgroundColor: '#E8E0CF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
});

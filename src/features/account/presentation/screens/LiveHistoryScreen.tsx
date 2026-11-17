import React, { useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../../../../components/layout/ScreenContainer';
import { Header } from '../../../../components/layout/Header';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { useLiveHistory } from '../hooks/useLiveHistory';
import { LiveHistoryItemCard } from '../components/LiveHistoryItemCard';
import { LiveHistoryItem } from '../../../../services/api/liveHistory/liveHistory.types';

interface SummaryCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  theme: any;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  label,
  value,
  color,
  theme,
}) => (
  <View
    style={[
      styles.summaryCard,
      {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      },
    ]}>
    <View style={[styles.summaryIcon, { backgroundColor: color + '18' }]}>
      <Icon name={icon} size={18} color={color} />
    </View>
    <AppText variant="h5" color={theme.colors.text} style={styles.summaryValue}>
      {value}
    </AppText>
    <AppText
      variant="caption"
      color={theme.colors.textSecondary}
      style={styles.summaryLabel}
      numberOfLines={2}>
      {label}
    </AppText>
  </View>
);

export const LiveHistoryScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const {
    items,
    summary,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    retry,
  } = useLiveHistory();

  const keyExtractor = useCallback(
    (item: LiveHistoryItem, index: number) =>
      item.sessionId || `${item.liveStreamId}-${item.userId}-${index}`,
    [],
  );

  const renderItem: ListRenderItem<LiveHistoryItem> = useCallback(
    ({ item }) => <LiveHistoryItemCard item={item} />,
    [],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.summarySection}>
        <AppText
          variant="h4"
          color={theme.colors.text}
          style={styles.sectionTitle}>
          Live History
        </AppText>
        {/* <View style={styles.summaryGrid}>
          <SummaryCard
            icon="call"
            label="Total Audio Calls"
            value={summary.totalAudioCalls}
            color={theme.colors.primary}
            theme={theme}
          />
          <SummaryCard
            icon="videocam"
            label="Total Video Calls"
            value={summary.totalVideoCalls}
            color={theme.colors.info}
            theme={theme}
          />
          <SummaryCard
            icon="monetization-on"
            label="Total Coins Collected"
            value={summary.totalCoinsCollected}
            color={theme.colors.warning}
            theme={theme}
          />
          <SummaryCard
            icon="account-balance-wallet"
            label="Total Astrologer Earnings"
            value={summary.totalAstrologerEarnings}
            color={theme.colors.success}
            theme={theme}
          />
        </View> */}
      </View>
    ),
    [summary, theme],
  );

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

    if (error) {
      return (
        <View style={styles.stateContainer}>
          <View
            style={[
              styles.stateIcon,
              { backgroundColor: theme.colors.errorLight },
            ]}>
            <Icon name="error-outline" size={40} color={theme.colors.error} />
          </View>
          <AppText
            variant="h5"
            color={theme.colors.text}
            style={styles.stateTitle}>
            Something went wrong
          </AppText>
          <AppText
            variant="body2"
            color={theme.colors.textSecondary}
            style={styles.stateMessage}>
            {error}
          </AppText>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={retry}
            activeOpacity={0.8}>
            <AppText variant="body2" color="#fff">
              Retry
            </AppText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.stateContainer}>
        <View
          style={[
            styles.stateIcon,
            { backgroundColor: theme.colors.surfaceSecondary },
          ]}>
          <Icon name="live-tv" size={40} color={theme.colors.textTertiary} />
        </View>
        <AppText
          variant="h5"
          color={theme.colors.text}
          style={styles.stateTitle}>
          No live interaction history found.
        </AppText>
      </View>
    );
  }, [loading, error, retry, theme]);

  const isInitialLoading = loading && items.length === 0 && !error;

  return (
    <ScreenContainer scrollable={false} withPadding={false}>
      <Header
        title="Live History"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {isInitialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={error && items.length === 0 ? [] : items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={error && items.length === 0 ? null : listHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={11}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
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
    paddingBottom: 24,
    flexGrow: 1,
  },
  summarySection: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  summaryCard: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  summaryValue: {
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    lineHeight: 16,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  stateIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stateTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  stateMessage: {
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
});

export default LiveHistoryScreen;

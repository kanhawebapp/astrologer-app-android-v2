import React, { useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Platform,
  Text,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart } from 'react-native-chart-kit';
import { DashboardHeader } from '../components/DashboardHeader';
import { useHomeAnalytics } from '../hooks/useHomeAnalytics';
import { useTheme } from '../../../../hooks/useTheme';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { useAccount } from '../../../account/presentation/hooks/useAccount';
import useDoubleBackExit from '../../../../hooks/useDoubleBackExit';
import { useFocusEffect } from '@react-navigation/native';

const DEFAULT_LIVE_STATUS = {
  isOnline: true,
  chatEnabled: true,
  callEnabled: true,
  videoEnabled: false,
};

const getChartColor = (hex: string, opacity = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const HomeDashboardScreen: React.FC = () => {
  const { theme, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useSelector((state: RootState) => state.auth.user);
  useDoubleBackExit();
  const { analytics, loading, error, refreshing, refresh, dataType, setDataType } = useHomeAnalytics();
  const { profile, refreshDashboard } = useAccount();

  const handleRefresh = useCallback(async () => {
    // console.log('🔥 Dashboard refresh');

    try {
      // console.log('🔥 Analytics refresh START');
      await refresh();
      // console.log('🔥 Analytics refresh DONE');

      // console.log('🔥 Account refresh START');
      await refreshDashboard();
      // console.log('🔥 Account refresh DONE');
    } catch (error) {
      // console.log('❌ Dashboard refresh error:', error);
    }
  }, [refresh, refreshDashboard]);

  useFocusEffect(
    useCallback(() => {

      refreshDashboard();

      return () => {
      };
    }, [refreshDashboard]),
  );
  useFocusEffect(
    useCallback(() => {
      StatusBar.setHidden(false);
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor('transparent', true);
      StatusBar.setTranslucent(true);
    }, [])
  );

  const chartWidth = Math.max(Dimensions.get('window').width - 64, 200);

  const labels = useMemo(() => {
    if (!analytics?.monthlyData) return [];
    return analytics.monthlyData.map(item => item.month);
  }, [analytics]);

  const chartData = useMemo(() => {
    if (!analytics?.monthlyData || analytics.monthlyData.length === 0) return [0];
    return analytics.monthlyData.map(item => {
      if (dataType === 'earnings') return item.earnings;
      return item.calls + item.chats;
    });
  }, [analytics, dataType]);

  const lastMonthData = useMemo(() => {
    if (!analytics?.monthlyData || analytics.monthlyData.length === 0) return null;
    const reversed = [...analytics.monthlyData].reverse();
    return reversed.find(m => {
      if (dataType === 'earnings') return m.earnings > 0;
      return m.calls + m.chats > 0;
    }) || analytics.monthlyData[analytics.monthlyData.length - 1];
  }, [analytics, dataType]);

  if (error && !analytics) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right', 'bottom']}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.errorContainer}>
          <View style={[styles.errorCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Icon name="error-outline" size={48} color={theme.colors.error} />
            <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Unable to Load Dashboard</Text>
            <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>Please check your internet connection and try again</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} onPress={refresh} activeOpacity={0.8}>
              <Text style={[styles.retryButtonText, { color: theme.colors.white }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !analytics) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right', 'bottom']}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <ScrollView showsVerticalScrollIndicator={false} bounces contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}>
          <DashboardHeader profile={profile} liveStatus={DEFAULT_LIVE_STATUS} onNotificationPress={() => { }} />
          <View style={styles.section}>
            <View style={[styles.segmentedShimmer, { backgroundColor: theme.colors.border, borderRadius: 12 }]} />
            <View style={styles.kpiGrid}>
              {[1, 2, 3, 4, 5].map(i => (
                <View key={i} style={[styles.kpiShimmer, { backgroundColor: theme.colors.surface, borderRadius: 16, marginBottom: 12, width: '47%' }]} />
              ))}
            </View>
            <View style={[styles.chartShimmer, { backgroundColor: theme.colors.border, borderRadius: 20 }]} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!analytics || !analytics.monthlyData || analytics.monthlyData.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right', 'bottom']}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <ScrollView showsVerticalScrollIndicator={false} bounces contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}>
          <DashboardHeader profile={profile} liveStatus={DEFAULT_LIVE_STATUS} onNotificationPress={() => { }} />
          <View style={styles.emptyState}>
            <Icon name="analytics" size={64} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Analytics Data</Text>
            <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>Your analytics will appear here once you start receiving sessions and earnings.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => getChartColor(theme.colors.primary, opacity),
    labelColor: (opacity = 1) => getChartColor(theme.colors.textSecondary, opacity),
    style: { borderRadius: 16 },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
    propsForBackgroundLines: {
      stroke: theme.colors.border,
      strokeDasharray: '',
    },
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right', 'bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}>
        <DashboardHeader profile={profile} liveStatus={DEFAULT_LIVE_STATUS} onNotificationPress={() => { }} />

        <View style={styles.section}>
          <View style={[styles.segmentedControl, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border }]}>
            {['Earnings', 'Sessions'].map((label, index) => {
              const value = index === 0 ? 'earnings' : 'sessions';
              const isActive = dataType === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[styles.segmentButton, { backgroundColor: isActive ? theme.colors.primary : 'transparent' }]}
                  onPress={() => setDataType(value)}
                  activeOpacity={0.8}>
                  <Text style={[styles.segmentLabel, { color: isActive ? theme.colors.white : theme.colors.textSecondary, fontWeight: isActive ? '700' : '500' }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>Total Earnings</Text>
              <Text style={[styles.kpiValue, { color: theme.colors.text }]}>₹{analytics.totalEarnings.toLocaleString()}</Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>Rating</Text>
              <Text style={[styles.kpiValue, { color: theme.colors.text }]}>{analytics.averageRating.toFixed(1)}</Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>Total Calls</Text>
              <Text style={[styles.kpiValue, { color: theme.colors.text }]}>{analytics.totalCalls}</Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>Total Chats</Text>
              <Text style={[styles.kpiValue, { color: theme.colors.text }]}>{analytics.totalChats}</Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>Followers</Text>
              <Text style={[styles.kpiValue, { color: theme.colors.text }]}>{analytics.totalFollowers}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.chartCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.chartTitle, { color: theme.colors.text, marginBottom: 16 }]}>
              {dataType === 'earnings' ? 'Earnings Overview' : 'Sessions Overview'}
            </Text>
            <LineChart
              data={{ labels, datasets: [{ data: chartData }] }}
              width={chartWidth}
              height={220}
              yAxisLabel={dataType === 'earnings' ? '₹' : ''}
              yAxisSuffix=""
              bezier
              chartConfig={chartConfig}
              style={styles.chart}
              withInnerLines
              withOuterLines
              withVerticalLines
              withHorizontalLines
            />
          </View>
        </View>

        {lastMonthData && (
          <View style={styles.section}>
            <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>{lastMonthData.month} Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Earnings</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>₹{lastMonthData.earnings}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Calls</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{lastMonthData.calls}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Chats</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{lastMonthData.chats}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Rating</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{analytics.averageRating.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  segmentedControl: { flexDirection: 'row', borderRadius: 12, padding: 4, borderWidth: 1 },
  segmentButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  segmentLabel: { fontSize: 14 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpiCard: { width: '47%', padding: 16, borderRadius: 16, borderWidth: 1, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }, android: { elevation: 3 } }) },
  kpiLabel: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  kpiValue: { fontSize: 20, fontWeight: '700' },
  chartCard: { borderRadius: 20, padding: 20, borderWidth: 1 },
  chartTitle: { fontSize: 16, fontWeight: '700' },
  chart: { borderRadius: 16 },
  summaryCard: { borderRadius: 20, padding: 20, borderWidth: 1 },
  summaryTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  summaryItem: { flex: 1, minWidth: '45%' },
  summaryLabel: { fontSize: 12, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '600' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  errorCard: { padding: 32, borderRadius: 20, borderWidth: 1, alignItems: 'center', width: '100%' },
  errorTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  errorMessage: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  retryButton: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24 },
  retryButtonText: { fontSize: 16, fontWeight: '600' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptyMessage: { fontSize: 14, textAlign: 'center' },
  kpiShimmer: { height: 100 },
  chartShimmer: { height: 300, marginTop: 16 },
  segmentedShimmer: { height: 44, marginBottom: 16 },
});

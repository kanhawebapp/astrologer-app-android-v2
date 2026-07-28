import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { SessionAnalytics } from '../../domain/types';

interface SessionAnalyticsChartProps {
  sessionAnalytics: SessionAnalytics;
}

interface SegmentData {
  label: string;
  value: number;
  color: string;
  icon: string;
}

export const SessionAnalyticsChart: React.FC<SessionAnalyticsChartProps> = memo(
  ({ sessionAnalytics }) => {
    const { theme, mode } = useTheme();

    const sessionTypeData = useMemo(
      (): SegmentData[] => [
        {
          label: 'Chat',
          value: sessionAnalytics.chatCount,
          color: theme.colors.primary,
          icon: 'chat',
        },
        {
          label: 'Call',
          value: sessionAnalytics.callCount,
          color: theme.colors.secondary,
          icon: 'call',
        },
        {
          label: 'Video',
          value: sessionAnalytics.videoCount,
          color: theme.colors.accentPurple,
          icon: 'videocam',
        },
      ],
      [sessionAnalytics, theme],
    );

    const completionData = useMemo(
      (): SegmentData[] => [
        {
          label: 'Completed',
          value: sessionAnalytics.completedCount,
          color: theme.colors.success,
          icon: 'check-circle',
        },
        {
          label: 'Cancelled',
          value: sessionAnalytics.cancelledCount,
          color: theme.colors.error,
          icon: 'cancel',
        },
      ],
      [sessionAnalytics, theme],
    );

    const totalSessions = sessionTypeData.reduce(
      (sum, item) => sum + item.value,
      0,
    );
    const totalCompletion = completionData.reduce(
      (sum, item) => sum + item.value,
      0,
    );

    const renderSessionTypeBars = (data: SegmentData[]) => {
      const maxValue = Math.max(...data.map(d => d.value));
      return (
        <View style={styles.barContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.barRow}>
              <View style={styles.barLabel}>
                <View
                  style={[
                    styles.barIcon,
                    { backgroundColor: item.color + '20' },
                  ]}>
                  <Icon name={item.icon} size={14} color={item.color} />
                </View>
                <AppText
                  variant="body2"
                  style={{ color: theme.colors.textSecondary, marginLeft: 8 }}>
                  {item.label}
                </AppText>
              </View>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: item.color,
                      width:
                        maxValue > 0
                          ? `${(item.value / maxValue) * 100}%`
                          : '0%',
                    },
                  ]}
                />
              </View>
              <AppText
                variant="body1"
                style={{
                  color: theme.colors.text,
                  fontWeight: '700',
                  width: 36,
                  textAlign: 'right',
                }}>
                {item.value}
              </AppText>
            </View>
          ))}
        </View>
      );
    };

    const renderProgressRing = (data: SegmentData[], total: number) => {
      let cumulativePercent = 0;
      return (
        <View style={styles.ringContainer}>
          <View style={styles.ringOuter}>
            {data.map((item, index) => {
              const percentage = total > 0 ? item.value / total : 0;
              const startPercent = cumulativePercent;
              cumulativePercent += percentage;

              return (
                <View
                  key={index}
                  style={[
                    styles.ringSegment,
                    {
                      backgroundColor: item.color,
                      opacity: 0.9,
                    },
                  ]}
                />
              );
            })}
            <View
              style={[
                styles.ringCenter,
                { backgroundColor: theme.colors.surface },
              ]}>
              <AppText
                variant="h2"
                style={{ color: theme.colors.text, fontWeight: '700' }}>
                {total}
              </AppText>
              <AppText
                variant="caption"
                style={{ color: theme.colors.textTertiary }}>
                Total
              </AppText>
            </View>
          </View>
        </View>
      );
    };

    const renderLegend = (data: SegmentData[], total: number) => {
      return (
        <View style={styles.legendContainer}>
          {data.map((item, index) => {
            const percentage =
              total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <View key={index} style={styles.legendRow}>
                <View style={styles.legendLeft}>
                  <View
                    style={[styles.legendDot, { backgroundColor: item.color }]}
                  />
                  <AppText
                    variant="body2"
                    style={{ color: theme.colors.textSecondary }}>
                    {item.label}
                  </AppText>
                </View>
                <AppText
                  variant="body1"
                  style={{
                    color: theme.colors.text,
                    fontWeight: '700',
                  }}>
                  {percentage}%
                </AppText>
              </View>
            );
          })}
        </View>
      );
    };

    const renderPeakHours = () => {
      const maxCount = Math.max(
        ...sessionAnalytics.peakHours.map(h => h.count),
        0,
      );
      return (
        <View style={styles.peakHoursContainer}>
          <AppText
            variant="body1"
            style={[
              styles.sectionTitle,
              { color: theme.colors.textSecondary, fontWeight: '600' },
            ]}>
            Peak Hours
          </AppText>
          <View style={styles.peakHoursBars}>
            {sessionAnalytics.peakHours.map((hour, index) => {
              const heightPercent =
                maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
              return (
                <View key={index} style={styles.peakHourItem}>
                  <View
                    style={[
                      styles.peakHourBar,
                      {
                        height: `${heightPercent}%`,
                        backgroundColor:
                          heightPercent === 100
                            ? theme.colors.primary
                            : theme.colors.primaryLight,
                      },
                    ]}
                  />
                  <AppText
                    variant="caption"
                    style={{ color: theme.colors.textTertiary, marginTop: 6 }}>
                    {hour.hour.split(' ')[0]}
                  </AppText>
                </View>
              );
            })}
          </View>
        </View>
      );
    };

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}>
        <View style={styles.section}>
          <AppText
            variant="h4"
            style={[
              styles.sectionTitle,
              { color: theme.colors.text, fontWeight: '700' },
            ]}>
            Session Types
          </AppText>
          <View style={styles.chartRow}>
            {renderSessionTypeBars(sessionTypeData)}
          </View>
        </View>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.border }]}
        />

        <View style={styles.section}>
          <AppText
            variant="h4"
            style={[
              styles.sectionTitle,
              { color: theme.colors.text, fontWeight: '700' },
            ]}>
            Completion Rate
          </AppText>
          <View style={styles.chartRow}>
            {renderProgressRing(completionData, totalCompletion)}
            {renderLegend(completionData, totalCompletion)}
          </View>
        </View>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.border }]}
        />

        <View style={styles.section}>{renderPeakHours()}</View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  barLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  barIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barWrapper: {
    flex: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 6,
  },
  ringContainer: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  ringOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ringSegment: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  ringCenter: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    top: 18,
    left: 18,
  },
  legendContainer: {
    flex: 1,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  peakHoursContainer: {
    marginTop: 4,
  },
  peakHoursBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  peakHourItem: {
    alignItems: 'center',
    flex: 1,
  },
  peakHourBar: {
    width: 28,
    borderRadius: 6,
    minHeight: 8,
  },
});

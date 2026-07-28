import React, { memo, useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { EarningsTrend } from '../../domain/types';

interface EarningsGraphProps {
  earningsTrend: EarningsTrend;
  showComparison?: boolean;
}

interface DataPoint {
  x: number;
  y: number;
  value: number;
  label: string | undefined;
}

const CHART_HEIGHT = 220;
const POINT_SIZE = 12;
const Scrollable_CHART_WIDTH = 320;

export const EarningsGraph: React.FC<EarningsGraphProps> = memo(
  ({ earningsTrend, showComparison = true }) => {
    const { theme, mode } = useTheme();
    const [selectedIndex, setSelectedIndex] = useState<any | null>(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, [fadeAnim]);

    useEffect(() => {
      if (selectedIndex !== null) {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [selectedIndex, scaleAnim]);

    const chartData = useMemo((): {
      current: DataPoint[];
      previous: DataPoint[];
    } => {
      const currentData = earningsTrend?.current;
      const previousData = earningsTrend?.previous;

      if (currentData?.length === 0) {
        return { current: [], previous: [] };
      }

      const allValues = [
        ...currentData?.map(d => d.value),
        ...previousData?.map(d => d.value),
      ];
      const minValue = Math.min(...allValues);
      const maxValue = Math.max(...allValues);
      const valueRange = maxValue - minValue || 1;
      const padding = valueRange * 0.15;

      const chartWidth = Scrollable_CHART_WIDTH - 54;
      const stepX = chartWidth / (currentData.length - 1 || 1);

      const currentPoints: DataPoint[] = currentData.map((point, index) => ({
        x: index * stepX,
        y:
          CHART_HEIGHT -
          ((point.value - minValue + padding) / (valueRange + padding * 2)) *
          CHART_HEIGHT,
        value: point.value,
        label: point.label,
      }));

      const previousPoints: DataPoint[] = previousData.map((point, index) => ({
        x: index * stepX,
        y:
          CHART_HEIGHT -
          ((point.value - minValue + padding) / (valueRange + padding * 2)) *
          CHART_HEIGHT,
        value: point.value,
        label: point.label,
      }));

      return { current: currentPoints, previous: previousPoints };
    }, [earningsTrend]);

    const formatCurrency = (value: number) => {
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k coins`;
      }
      return `${value} coins`;
    };

    const renderAreaGradient = (points: DataPoint[], color: string) => {
      if (points.length < 2) return null;

      const areaColor = mode === 'dark' ? `${color}25` : `${color}10`;
      const gradientHeight = Math.min(...points.map(p => p.y)) - 20;

      return (
        <View
          style={[
            styles.areaGradient,
            {
              backgroundColor: areaColor,
              top: gradientHeight,
              height: CHART_HEIGHT - gradientHeight + 20,
            },
          ]}
        />
      );
    };

    const renderSmoothLine = (
      points: DataPoint[],
      color: string,
      dashed = false,
    ) => {
      if (points.length < 2) return null;

      const segments: React.ReactNode[] = [];

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        segments.push(
          <View
            key={i}
            style={[
              styles.lineSegment,
              {
                width: length,
                left: p1.x + 4,
                top: p1.y + 4,
                transform: [{ rotate: `${angle}deg` }],
                backgroundColor: color,
                opacity: dashed ? 0.35 : 1,
              },
            ]}
          />,
        );
      }

      return <View style={styles.lineContainer}>{segments}</View>;
    };

    const renderPoints = (
      points: DataPoint[],
      color: string,
      onPress?: (point: DataPoint, index: number) => void,
    ) => {
      return points.map((point, index) => {
        const isSelected = selectedIndex === index;
        return (
          <Animated.View
            key={index}
            style={[
              styles.pointWrapper,
              {
                left: point.x - 6,
                top: point.y - 6,
                transform: [
                  { scale: isSelected ? scaleAnim : new Animated.Value(1) },
                ],
              },
            ]}>
            <TouchableOpacity
              style={[
                styles.point,
                {
                  backgroundColor: color,
                  borderColor: theme.colors.surface,
                  width: isSelected ? POINT_SIZE + 4 : POINT_SIZE,
                  height: isSelected ? POINT_SIZE + 4 : POINT_SIZE,
                  borderRadius: isSelected
                    ? (POINT_SIZE + 4) / 2
                    : POINT_SIZE / 2,
                },
              ]}
              onPress={() => {
                setSelectedIndex(point);
                setSelectedIndex(index);
                onPress?.(point, index);
              }}
              activeOpacity={0.8}
            />
            {isSelected && (
              <Animated.View
                style={[
                  styles.tooltip,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <AppText
                  variant="caption"
                  style={{ color: theme.colors.text, fontWeight: '700' }}>
                  {formatCurrency(point.value)}
                </AppText>
                <AppText
                  variant="caption"
                  style={{ color: theme.colors.textSecondary, fontSize: 10 }}>
                  {point.label}
                </AppText>
              </Animated.View>
            )}
          </Animated.View>
        );
      });
    };

    const handlePointPress = (point: DataPoint, index: number) => {
      setSelectedIndex(point);
      setSelectedIndex(index);
    };

    const isPositive = earningsTrend.percentageChange >= 0;

    return (
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}>
        <View style={styles.header}>
          <View>
            <AppText
              variant="caption"
              style={{ color: theme.colors.textSecondary }}>
              Total Earnings
            </AppText>
            <AppText
              variant="h2"
              style={[styles.totalValue, { color: theme.colors.text }]}>
              {formatCurrency(earningsTrend.totalCurrent)}
            </AppText>
          </View>
          <View style={styles.changeContainer}>
            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor: isPositive
                    ? theme.colors.successLight
                    : theme.colors.errorLight,
                },
              ]}>
              <AppText
                variant="body2"
                style={{
                  color: isPositive ? theme.colors.success : theme.colors.error,
                  fontWeight: '700',
                }}>
                {isPositive ? '+' : ''}
                {earningsTrend.percentageChange.toFixed(1)}%
              </AppText>
            </View>
            <AppText
              variant="caption"
              style={{ color: theme.colors.textTertiary, marginTop: 4 }}>
              vs previous
            </AppText>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.chartContainer}>
            <View style={styles.yAxis}>
              {chartData.current.length > 0 && (
                <>
                  <AppText
                    variant="caption"
                    style={{ color: theme.colors.textTertiary }}>
                    {formatCurrency(
                      Math.max(...chartData.current.map(p => p.value)),
                    )}
                  </AppText>
                  <AppText
                    variant="caption"
                    style={{ color: theme.colors.textTertiary }}>
                    {formatCurrency(
                      Math.min(...chartData.current.map(p => p.value)),
                    )}
                  </AppText>
                </>
              )}
            </View>
            <View
              style={[
                styles.chart,
                { height: CHART_HEIGHT, width: Scrollable_CHART_WIDTH },
              ]}>
              {showComparison && chartData.previous.length > 0 && (
                <>
                  {renderAreaGradient(
                    chartData.previous,
                    theme.colors.textTertiary,
                  )}
                  {renderSmoothLine(
                    chartData.previous,
                    theme.colors.textTertiary,
                    true,
                  )}
                  {renderPoints(
                    chartData.previous,
                    theme.colors.textTertiary,
                    () => { },
                  )}
                </>
              )}
              {chartData.current.length > 0 && (
                <>
                  {renderAreaGradient(chartData.current, theme.colors.primary)}
                  {renderSmoothLine(chartData.current, theme.colors.primary)}
                  {renderPoints(
                    chartData.current,
                    theme.colors.primary,
                    handlePointPress,
                  )}
                </>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.xAxis}>
          {earningsTrend.current.map((point, index) => (
            <AppText
              key={index}
              variant="caption"
              style={{
                color: theme.colors.textTertiary,
                flex: 1,
                textAlign: 'center',
              }}>
              {point.label?.split(' ')[1] || point.label || ''}
            </AppText>
          ))}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <AppText
              variant="caption"
              style={{ color: theme.colors.textSecondary }}>
              Current Period
            </AppText>
          </View>
          {showComparison && (
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: theme.colors.textTertiary },
                ]}
              />
              <AppText
                variant="caption"
                style={{ color: theme.colors.textSecondary }}>
                Previous Period
              </AppText>
            </View>
          )}
        </View>
      </Animated.View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  totalValue: {
    fontWeight: '700',
    marginTop: 4,
  },
  changeContainer: {
    alignItems: 'flex-end',
  },
  changeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  scrollContent: {
    paddingRight: 20,
  },
  chartContainer: {
    flexDirection: 'row',
  },
  yAxis: {
    width: 44,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  chart: {
    position: 'relative',
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lineSegment: {
    position: 'absolute',
    height: 2.5,
    transformOrigin: 'left center',
  },
  areaGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 8,
  },
  pointWrapper: {
    position: 'absolute',
    zIndex: 10,
  },
  point: {
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  tooltip: {
    position: 'absolute',
    bottom: 20,
    left: -30,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 60,
  },
  xAxis: {
    flexDirection: 'row',
    marginTop: 12,
    paddingLeft: 44,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
});

import React, { memo, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { KPIMetric } from '../../domain/types';

interface KPIStatsGridProps {
  kpis: KPIMetric[];
  onKPIPress?: (kpi: KPIMetric) => void;
}

interface KPICardProps {
  kpi: KPIMetric;
  onPress?: () => void;
  index: number;
}

const KPICard: React.FC<KPICardProps> = memo(({ kpi, onPress, index }) => {
  const { theme, mode } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getChangeColor = () => {
    switch (kpi.changeType) {
      case 'positive':
        return theme.colors.success;
      case 'negative':
        return theme.colors.error;
      default:
        return theme.colors.textTertiary;
    }
  };

  const getChangeIcon = () => {
    switch (kpi.changeType) {
      case 'positive':
        return 'trending-up';
      case 'negative':
        return 'trending-down';
      default:
        return 'trending-flat';
    }
  };

  // const getAccentColor = () => {
  //   const colors = [
  //     theme.colors.primary,
  //     theme.colors.secondary,
  //     theme.colors.success,
  //     theme.colors.info,
  //     theme.colors.accentPurple,
  //     theme.colors.warning,
  //   ];
  //   return colors[index % colors.length];
  // };

   const getAccentColor = () => {
    const colors = [
      theme.colors.primary,
      theme.colors.primary,
      theme.colors.primary,
      theme.colors.primary,
      theme.colors.primary,
      theme.colors.primary,
    ];
    return colors[index % colors.length];
  };

  const accentColor = getAccentColor();
  const accentLight = mode === 'dark' ? `${accentColor}30` : `${accentColor}15`;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.96,
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

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.kpiCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            shadowColor: mode === 'dark' ? '#000' : '#6C63FF',
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={!onPress}>
        <View style={styles.kpiHeader}>
          {kpi.icon && (
            <View
              style={[
                styles.kpiIconContainer,
                { backgroundColor: accentLight },
              ]}>
              <Icon name={kpi.icon} size={14} color={accentColor} />
            </View>
          )}
        </View>
        <AppText
          variant="body2"
          style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>
          {kpi.label}
        </AppText>
        <AppText
          variant="h2"
          style={[styles.kpiValue, { color: theme.colors.text }]}>
          {kpi.value}
        </AppText>
        {kpi.change !== undefined && (
          <View style={styles.kpiChangeRow}>
            <Icon name={getChangeIcon()} size={12} color={getChangeColor()} />
            <AppText
              variant="body2"
              style={[styles.kpiChange, { color: getChangeColor() }]}>
              {kpi.change > 0 ? '+' : ''}
              {kpi.change}%
            </AppText>
            <AppText
              variant="caption"
              style={[
                styles.kpiChangeLabel,
                { color: theme.colors.textTertiary },
              ]}>
              vs last period
            </AppText>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

export const KPIStatsGrid: React.FC<KPIStatsGridProps> = memo(
  ({ kpis, onKPIPress }) => {
    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {kpis?.map((kpi, index) => (
            <KPICard
              key={kpi.id}
              kpi={kpi}
              index={index}
              onPress={() => onKPIPress?.(kpi)}
            />
          ))}
        </ScrollView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  kpiCard: {
    width: 140,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  kpiIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  kpiValue: {
    marginTop: 4,
    fontWeight: '700',
    fontSize: 18,
  },
  kpiChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  kpiChange: {
    marginLeft: 2,
    fontWeight: '600',
    fontSize: 11,
  },
  kpiChangeLabel: {
    marginLeft: 4,
    fontSize: 9,
  },
});

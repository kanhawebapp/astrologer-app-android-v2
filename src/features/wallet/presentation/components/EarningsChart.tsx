// import React from 'react';
// import { View, StyleSheet, TouchableOpacity } from 'react-native';
// import { useTheme } from '../../../../hooks/useTheme';
// import { AppText } from '../../../../components/common/AppText';
// import { spacing, borderRadius } from '../../../../theme/spacing';
// import { ChartData, TimePeriod } from '../../domain/types';

// interface EarningsChartProps {
//   chartData: ChartData[];
//   selectedPeriod: TimePeriod;
//   onPeriodChange: (period: TimePeriod) => void;
//   weeklyEarnings: number;
//   monthlyEarnings: number;
// }

// export const EarningsChart: React.FC<EarningsChartProps> = ({
//   chartData,
//   selectedPeriod,
//   onPeriodChange,
//   weeklyEarnings,
//   monthlyEarnings,
// }) => {
//   console.log('🔥 EarningsChart Render', {
//     timestamp: new Date().toISOString(),
//     renderCountPayload: undefined,
//     chartDataLength: chartData?.length,
//     selectedPeriod,
//     weeklyEarnings,
//     monthlyEarnings,
//   });
//   const { theme } = useTheme();

//   const maxValue = Math.max(...chartData.map(d => d.value), 1);

//   const formatCurrency = (amount: number): string => {
//     return `₹${amount.toLocaleString('en-IN')}`;
//   };

//   const periods: { key: TimePeriod; label: string }[] = [
//     { key: 'weekly', label: 'This Week' },
//     { key: 'monthly', label: 'This Month' },
//   ];

//   return (
//     <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
//       <View style={styles.header}>
//         <AppText variant="h4" color={theme.colors.text}>
//           Earnings
//         </AppText>
//         <View style={styles.periodTabs}>
//           {periods.map(period => (
//             <TouchableOpacity
//               key={period.key}
//               style={[
//                 styles.periodTab,
//                 selectedPeriod === period.key && {
//                   backgroundColor: theme.colors.primary,
//                 },
//               ]}
//               onPress={() => onPeriodChange(period.key)}>
//               <AppText
//                 variant="caption"
//                 color={
//                   selectedPeriod === period.key
//                     ? theme.colors.white
//                     : theme.colors.textSecondary
//                 }>
//                 {period.label}
//               </AppText>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       <View style={styles.amountContainer}>
//         <AppText variant="h3" color={theme.colors.text}>
//           {selectedPeriod === 'weekly'
//             ? formatCurrency(weeklyEarnings)
//             : formatCurrency(monthlyEarnings)}
//         </AppText>
//         <AppText variant="caption" color={theme.colors.success}>
//           {selectedPeriod === 'weekly' ? 'This Week' : 'This Month'}
//         </AppText>
//       </View>

//       <View style={styles.chartContainer}>
//         {chartData.map((data, index) => {
//           const height = (data.value / maxValue) * 100;
//           return (
//             <View key={index} style={styles.barContainer}>
//               <View
//                 style={[
//                   styles.bar,
//                   {
//                     height: `${height}%`,
//                     backgroundColor:
//                       index === chartData.length - 1
//                         ? theme.colors.primary
//                         : theme.colors.primaryLight,
//                   },
//                 ]}
//               />
//               <AppText
//                 variant="caption"
//                 color={theme.colors.textTertiary}
//                 style={styles.barLabel}>
//                 {data.label}
//               </AppText>
//             </View>
//           );
//         })}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginHorizontal: spacing.lg,
//     marginTop: spacing.lg,
//     padding: spacing.lg,
//     borderRadius: borderRadius.lg,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: spacing.md,
//   },
//   periodTabs: {
//     flexDirection: 'row',
//     backgroundColor: 'rgba(0,0,0,0.05)',
//     borderRadius: borderRadius.sm,
//     padding: 2,
//   },
//   periodTab: {
//     paddingVertical: spacing.xs,
//     paddingHorizontal: spacing.md,
//     borderRadius: borderRadius.xs,
//   },
//   amountContainer: {
//     marginBottom: spacing.lg,
//   },
//   chartContainer: {
//     flexDirection: 'row',
//     height: 120,
//     alignItems: 'flex-end',
//     justifyContent: 'space-between',
//     paddingHorizontal: spacing.sm,
//   },
//   barContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     marginHorizontal: 2,
//   },
//   bar: {
//     width: '60%',
//     borderRadius: borderRadius.xs,
//     minHeight: 8,
//   },
//   barLabel: {
//     marginTop: spacing.xs,
//   },
// });


import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { AppText } from '../../../../components/common/AppText';
import { spacing, borderRadius } from '../../../../theme/spacing';
import { ChartData, TimePeriod } from '../../domain/types';

interface EarningsChartProps {
  chartData: ChartData[];
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  weeklyEarnings: number;
  monthlyEarnings: number;
}

const CHART_HEIGHT = 120;

export const EarningsChart: React.FC<EarningsChartProps> = ({
  chartData,
  selectedPeriod,
  onPeriodChange,
  weeklyEarnings,
  monthlyEarnings,
}) => {
  const { theme } = useTheme();

  console.log('🔥 EarningsChart Render', {
    chartDataLength: chartData?.length,
    selectedPeriod,
  });

  // ✅ SAFE DATA HANDLING
  const safeData = chartData?.length ? chartData : [{ label: '', value: 0 }];

  const values = safeData.map(d => d.value ?? 0);
  const maxValue = Math.max(...values, 1);

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const periods: { key: TimePeriod; label: string }[] = [
    { key: 'weekly', label: 'This Week' },
    { key: 'monthly', label: 'This Month' },
  ];

  const currentAmount =
    selectedPeriod === 'weekly' ? weeklyEarnings : monthlyEarnings;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <AppText variant="h4" color={theme.colors.text}>
          Earnings
        </AppText>

        <View style={styles.periodTabs}>
          {periods.map(period => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodTab,
                selectedPeriod === period.key && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() => onPeriodChange(period.key)}
            >
              <AppText
                variant="caption"
                color={
                  selectedPeriod === period.key
                    ? theme.colors.white
                    : theme.colors.textSecondary
                }
              >
                {period.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* AMOUNT */}
      <View style={styles.amountContainer}>
        <AppText variant="h3" color={theme.colors.text}>
          {formatCurrency(currentAmount)}
        </AppText>

        <AppText variant="caption" color={theme.colors.success}>
          {selectedPeriod === 'weekly' ? 'This Week' : 'This Month'}
        </AppText>
      </View>

      {/* CHART */}
      <View style={styles.chartContainer}>
        {safeData.map((data, index) => {
          const value = data.value ?? 0;

          const barHeight =
            maxValue > 0 ? (value / maxValue) * CHART_HEIGHT : 0;

          return (
            <View key={index} style={styles.barContainer}>
              
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(barHeight, 4), // minimum visible bar
                    backgroundColor:
                      index === safeData.length - 1
                        ? theme.colors.primary
                        : theme.colors.primaryLight,
                  },
                ]}
              />

              <AppText
                variant="caption"
                color={theme.colors.textTertiary}
                style={styles.barLabel}
              >
                {data.label}
              </AppText>

            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  periodTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: borderRadius.sm,
    padding: 2,
  },

  periodTab: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xs,
  },

  amountContainer: {
    marginBottom: spacing.lg,
  },

  chartContainer: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },

  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },

  bar: {
    width: 10,
    borderRadius: borderRadius.xs,
  },

  barLabel: {
    marginTop: spacing.xs,
  },
});


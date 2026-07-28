import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { AppText } from '../../../../components/common/AppText';
import { spacing, borderRadius } from '../../../../theme/spacing';

type FilterType = 'all' | 'credit' | 'debit';
type DateFilterType = 'all' | 'today' | 'week' | 'month' | 'custom';

interface FilterTabsProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  creditCount?: number;
  debitCount?: number;
  onDateFilterChange?: (startDate: Date | null, endDate: Date | null) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  selectedFilter,
  onFilterChange,
  creditCount,
  debitCount,
  onDateFilterChange,
}) => {
  console.log('🔥 FilterTabs Render', {
    timestamp: new Date().toISOString(),
    selectedFilter,
    creditCount,
    debitCount,
  });
  const { theme } = useTheme();
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date>(new Date());
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());
  const [selectingStart, setSelectingStart] = useState(true);

  const filters: { key: FilterType; label: string; count?: number }[] = [
    { key: 'all', label: 'All' },
    { key: 'credit', label: 'Credits', count: creditCount },
    { key: 'debit', label: 'Debits', count: debitCount },
  ];

  const dateFilters: { key: DateFilterType; label: string }[] = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'custom', label: 'Custom' },
  ];

  const handleDateFilterChange = (key: DateFilterType) => {
    setDateFilter(key);
    const now = new Date();

    switch (key) {
      case 'today': {
        const todayStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const todayEnd = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999,
        );
        setStartDate(todayStart);
        setEndDate(todayEnd);
        onDateFilterChange?.(todayStart, todayEnd);
        break;
      }
      case 'week': {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(now);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        setStartDate(weekStart);
        setEndDate(weekEnd);
        onDateFilterChange?.(weekStart, weekEnd);
        break;
      }
      case 'month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
        setStartDate(monthStart);
        setEndDate(monthEnd);
        onDateFilterChange?.(monthStart, monthEnd);
        break;
      }
      case 'all':
        setStartDate(null);
        setEndDate(null);
        onDateFilterChange?.(null, null);
        break;
      case 'custom':
        setTempStartDate(new Date());
        setTempEndDate(new Date());
        setShowCustomModal(true);
        break;
    }
  };

  const confirmCustomDate = () => {
    const start = new Date(
      tempStartDate.getFullYear(),
      tempStartDate.getMonth(),
      tempStartDate.getDate(),
      0,
      0,
      0,
      0,
    );
    const end = new Date(
      tempEndDate.getFullYear(),
      tempEndDate.getMonth(),
      tempEndDate.getDate(),
      23,
      59,
      59,
      999,
    );
    setStartDate(start);
    setEndDate(end);
    setShowCustomModal(false);
    onDateFilterChange?.(start, end);
  };

  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return 'Select';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const generateDays = (
    selectedDate: Date,
  ): { day: number; month: number; year: number }[] => {
    const days: { day: number; month: number; year: number }[] = [];
    const daysInMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0,
    ).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: selectedDate.getMonth(),
        year: selectedDate.getFullYear(),
      });
    }
    return days;
  };

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.surfaceSecondary },
        ]}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.tab,
              selectedFilter === filter.key && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => onFilterChange(filter.key)}>
            <AppText
              variant="body2"
              color={
                selectedFilter === filter.key
                  ? theme.colors.white
                  : theme.colors.textSecondary
              }>
              {filter.label}
              {filter.count !== undefined && ` (${filter.count})`}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={[
          styles.dateContainer,
          { backgroundColor: theme.colors.surface },
        ]}>
        <AppText
          variant="caption"
          color={theme.colors.textSecondary}
          style={styles.dateLabel}>
          Filter by Date
        </AppText>
        <View style={styles.dateFiltersRow}>
          {dateFilters.map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.dateTab,
                dateFilter === filter.key && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() => handleDateFilterChange(filter.key)}>
              <AppText
                variant="caption"
                color={
                  dateFilter === filter.key
                    ? theme.colors.white
                    : theme.colors.textSecondary
                }
                style={styles.dateTabText}>
                {filter.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        {(dateFilter === 'custom' || (startDate && endDate)) && (
          <View style={styles.customDateRow}>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.colors.border }]}
              onPress={() => {
                setSelectingStart(true);
                setShowCustomModal(true);
              }}>
              <AppText variant="caption" color={theme.colors.text}>
                {formatDateDisplay(startDate)}
              </AppText>
            </TouchableOpacity>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              to
            </AppText>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.colors.border }]}
              onPress={() => {
                setSelectingStart(false);
                setShowCustomModal(true);
              }}>
              <AppText variant="caption" color={theme.colors.text}>
                {formatDateDisplay(endDate)}
              </AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal visible={showCustomModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCustomModal(false)}>
                <AppText variant="body2" color={theme.colors.textSecondary}>
                  Cancel
                </AppText>
              </TouchableOpacity>
              <AppText variant="h5" color={theme.colors.text}>
                {selectingStart ? 'Select Start Date' : 'Select End Date'}
              </AppText>
              <TouchableOpacity onPress={confirmCustomDate}>
                <AppText variant="body2" color={theme.colors.primary}>
                  Done
                </AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.monthSelector}>
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(
                    tempStartDate.getFullYear(),
                    tempStartDate.getMonth() - 1,
                    1,
                  );
                  setTempStartDate(newDate);
                  setTempEndDate(newDate);
                }}>
                <AppText variant="h4" color={theme.colors.primary}>
                  ‹
                </AppText>
              </TouchableOpacity>
              <AppText variant="h5" color={theme.colors.text}>
                {months[tempStartDate.getMonth()]} {tempStartDate.getFullYear()}
              </AppText>
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(
                    tempStartDate.getFullYear(),
                    tempStartDate.getMonth() + 1,
                    1,
                  );
                  setTempStartDate(newDate);
                  setTempEndDate(newDate);
                }}>
                <AppText variant="h4" color={theme.colors.primary}>
                  ›
                </AppText>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.daysGrid}>
              <View style={styles.daysHeader}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <AppText
                    key={i}
                    variant="caption"
                    color={theme.colors.textSecondary}
                    style={styles.dayHeaderText}>
                    {d}
                  </AppText>
                ))}
              </View>
              <View style={styles.daysRow}>
                {Array.from({
                  length: new Date(
                    tempStartDate.getFullYear(),
                    tempStartDate.getMonth(),
                    1,
                  ).getDay(),
                }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.dayCell} />
                ))}
                {generateDays(tempStartDate).map(({ day, month, year }) => {
                  const isSelected = selectingStart
                    ? day === tempStartDate.getDate() &&
                      month === tempStartDate.getMonth()
                    : day === tempEndDate.getDate() &&
                      month === tempEndDate.getMonth();
                  return (
                    <Pressable
                      key={day}
                      style={[
                        styles.dayCell,
                        isSelected && { backgroundColor: theme.colors.primary },
                      ]}
                      onPress={() => {
                        const newDate = new Date(year, month, day);
                        if (selectingStart) {
                          setTempStartDate(newDate);
                        } else {
                          setTempEndDate(newDate);
                        }
                      }}>
                      <AppText
                        variant="body2"
                        color={
                          isSelected ? theme.colors.white : theme.colors.text
                        }>
                        {day}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.md,
  },
  container: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  dateContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  dateLabel: {
    marginBottom: spacing.sm,
  },
  dateFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  dateTab: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  dateTabText: {
    fontSize: 11,
  },
  customDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  dateButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  daysGrid: {
    maxHeight: 250,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  dayHeaderText: {
    width: 40,
    textAlign: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: borderRadius.full,
  },
});

import React, { memo, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import {
  FilterPeriod,
  SessionTypeFilter,
  DataTypeFilter,
} from '../../domain/types';
import { PeriodSelector } from './homeHeaderComponents/PeriodSelector';
import { SessionTypeSelector } from './homeHeaderComponents/SessionTypeSelector';
import { DataTypeSelector } from './homeHeaderComponents/DataTypeSelector';
import { CustomDateModal } from './homeHeaderComponents/CustomDateModal';

interface FilterTabsProps {
  selectedPeriod: FilterPeriod;
  onPeriodChange: (period: FilterPeriod) => void;
  selectedSessionType: SessionTypeFilter;
  onSessionTypeChange: (type: SessionTypeFilter) => void;
  selectedDataType: DataTypeFilter;
  onDataTypeChange: (type: DataTypeFilter) => void;
}

interface CustomDateRange {
  start: Date;
  end: Date;
}


const PERIODS = [
  { label: 'Today', value: 'today', icon: 'weather-sunny' },
  { label: '7 Days', value: '7days', icon: 'calendar-week' },
  { label: '30 Days', value: '30days', icon: 'calendar-month-outline' },
  { label: 'Custom', value: 'custom', icon: 'calendar-star' },
];


const SESSION_TYPES = [
  { label: 'All', value: 'all', icon: 'view-grid-outline' },
  { label: 'Chat', value: 'chat', icon: 'message-processing-outline' },
  { label: 'Call', value: 'call', icon: 'phone-outline' },
  { label: 'Video', value: 'video', icon: 'video-outline' },
];


const DATA_TYPES = [
  { label: 'Earnings', value: 'earnings', icon: 'cash-multiple' },
  { label: 'Sessions', value: 'sessions', icon: 'chart-timeline-variant' },
];

const QUICK_RANGES: { label: string; days: number }[] = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 14 Days', days: 14 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
];

export const FilterTabs: React.FC<FilterTabsProps> = memo(
  ({
    selectedPeriod,
    onPeriodChange,
    selectedSessionType,
    onSessionTypeChange,
    selectedDataType,
    onDataTypeChange,
  }) => {
    const { theme } = useTheme();
    const [showDateModal, setShowDateModal] = useState(false);
    const [customRange, setCustomRange] = useState<CustomDateRange>({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    });



    const periodScale = useRef(
      PERIODS.map(() => new Animated.Value(1)),
    ).current;

    const sessionScale = useRef(
      SESSION_TYPES.map(() => new Animated.Value(1)),
    ).current;

    const dataScale = useRef(
      DATA_TYPES.map(() => new Animated.Value(1)),
    ).current;

    const handlePeriodPress = (index: number, value: FilterPeriod) => {
      Animated.sequence([
        Animated.timing(periodScale[index], {
          toValue: 0.92,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(periodScale[index], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      if (value === 'custom') {
        setShowDateModal(true);
      } else {
        onPeriodChange(value);
      }
    };

    const handleSessionPress = (index: number, value: SessionTypeFilter) => {
      Animated.sequence([
        Animated.timing(sessionScale[index], {
          toValue: 0.92,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(sessionScale[index], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      onSessionTypeChange(value);
    };

    const handleDataPress = (index: number, value: DataTypeFilter) => {
      Animated.sequence([
        Animated.timing(dataScale[index], {
          toValue: 0.92,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(dataScale[index], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      onDataTypeChange(value);
    };

    const handleQuickRangeSelect = useCallback((days: number) => {
      const end = new Date();
      const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      setCustomRange({ start, end });
    }, []);

    const handleApplyCustomRange = useCallback(() => {
      onPeriodChange('custom');
      setShowDateModal(false);
    }, [onPeriodChange]);

    const formatDateRange = (range: CustomDateRange) => {
      const formatOptions: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
      };
      return `${range.start.toLocaleDateString(
        'en-US',
        formatOptions,
      )} - ${range.end.toLocaleDateString('en-US', formatOptions)}`;
    };

    const isCustomSelected = selectedPeriod === 'custom';

    return (
      <View style={styles.container}>
        <PeriodSelector
          periods={PERIODS}
          scales={periodScale}
          selectedPeriod={selectedPeriod}
          onPress={handlePeriodPress}
          customRange={
            isCustomSelected ? (
              <View style={styles.customDateDisplay}>
                <Icon
                  name="calendar-range"
                  size={14}
                  color={theme.colors.primary}
                />

                <AppText
                  variant="caption"
                  style={{
                    color: theme.colors.primary,
                    marginLeft: 4,
                  }}>
                  {formatDateRange(customRange)}
                </AppText>
              </View>
            ) : null
          }
          theme={theme}
        />

        {/* <View style={styles.filtersRow}>
          <SessionTypeSelector
            data={SESSION_TYPES}
            scales={sessionScale}
            selected={selectedSessionType}
            onPress={handleSessionPress}
            theme={theme}
          />

          <DataTypeSelector
            data={DATA_TYPES}
            scales={dataScale}
            selected={selectedDataType}
            onPress={handleDataPress}
          />
        </View> */}

        <CustomDateModal
          visible={showDateModal}
          theme={theme}
          quickRanges={QUICK_RANGES}
          selectedRange={formatDateRange(customRange)}
          onClose={() => setShowDateModal(false)}
          onQuickRange={handleQuickRangeSelect}
          onApply={handleApplyCustomRange}
        />
      </View>
    );

  },
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  periodSection: {
    marginBottom: 12,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  periodScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  periodIcon: {
    marginRight: 6,
  },
  customDateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterLabelContainer: {
    paddingHorizontal: 4,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  dataToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quickRangeLabel: {
    marginBottom: 12,
  },
  quickRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  quickRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectedRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
});



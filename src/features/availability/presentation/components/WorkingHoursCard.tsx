import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { Availability, WorkingHours } from '../../domain/types';
import { useEffect } from 'react';

interface WorkingHoursCardProps {
  availability: Availability;
  onUpdateWorkingHours: (workingHours: WorkingHours) => void;
  isLoading?: boolean;
}

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const WorkingHoursCard: React.FC<WorkingHoursCardProps> = ({
  availability,
  onUpdateWorkingHours,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempStart, setTempStart] = useState(availability.workingHours.start);
  const [tempEnd, setTempEnd] = useState(availability.workingHours.end);

  useEffect(() => {
    setTempStart(availability.workingHours.start);
    setTempEnd(availability.workingHours.end);
  }, [availability.workingHours]);

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const handleStartSelect = (time: string) => {
    setTempStart(time);
    onUpdateWorkingHours({ start: time, end: tempEnd });
    setShowStartPicker(false);
  };

  const handleEndSelect = (time: string) => {
    setTempEnd(time);
    onUpdateWorkingHours({ start: tempStart, end: time });
    setShowEndPicker(false);
  };

  const TimePickerModal = ({
    visible,
    onClose,
    selectedTime,
    onSelect,
  }: {
    visible: boolean;
    onClose: () => void;
    selectedTime: string;
    onSelect: (time: string) => void;
  }) => (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: theme.colors.overlay,
        }}>
        <View
          style={[
            styles.pickerContainer,
            { backgroundColor: theme.colors.surface },
          ]}>
          <View
            style={[
              styles.pickerHeader,
              { borderBottomColor: theme.colors.border },
            ]}>
            <AppText variant="h5" color={theme.colors.text}>
              Select Time
            </AppText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.pickerContent}>
            {timeOptions.map(time => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeOption,
                  selectedTime === time && {
                    backgroundColor: theme.colors.primary + '20',
                  },
                ]}
                onPress={() => onSelect(time)}>
                <AppText
                  variant="body1"
                  color={
                    selectedTime === time
                      ? theme.colors.primary
                      : theme.colors.text
                  }>
                  {formatTime(time)}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <AppText variant="h5" color={theme.colors.text}>
          Working Hours
        </AppText>
        <View
          style={[
            styles.scheduleBadge,
            {
              backgroundColor: theme.colors.surfaceSecondary,
            },
          ]}>
          <Icon name="time" size={14} color={theme.colors.textTertiary} />
          <AppText variant="caption" color={theme.colors.textTertiary}>
            Today
          </AppText>
        </View>
      </View>

      <View
        style={[styles.divider, { backgroundColor: theme.colors.border }]}
      />

      <View style={styles.timeRow}>
        <TouchableOpacity
          style={[
            styles.timeBlock,
            { backgroundColor: theme.colors.surfaceSecondary },
          ]}
          onPress={() => setShowStartPicker(true)}
          disabled={isLoading}>
          <AppText variant="caption" color={theme.colors.textTertiary}>
            Start
          </AppText>
          <AppText variant="h5" color={theme.colors.text}>
            {formatTime(tempStart)}
          </AppText>
        </TouchableOpacity>

        <View style={styles.timeArrow}>
          <Icon
            name="arrow-forward"
            size={20}
            color={theme.colors.textTertiary}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.timeBlock,
            { backgroundColor: theme.colors.surfaceSecondary },
          ]}
          onPress={() => setShowEndPicker(true)}
          disabled={isLoading}>
          <AppText variant="caption" color={theme.colors.textTertiary}>
            End
          </AppText>
          <AppText variant="h5" color={theme.colors.text}>
            {formatTime(tempEnd)}
          </AppText>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.scheduleInfo,
          { backgroundColor: theme.colors.infoLight },
        ]}>
        <Icon name="information-circle" size={16} color={theme.colors.info} />
        <AppText
          variant="caption"
          color={theme.colors.info}
          style={styles.infoText}>
          You won't receive sessions outside these hours
        </AppText>
      </View>

      <TimePickerModal
        visible={showStartPicker}
        onClose={() => setShowStartPicker(false)}
        selectedTime={tempStart}
        onSelect={handleStartSelect}
      />

      <TimePickerModal
        visible={showEndPicker}
        onClose={() => setShowEndPicker(false)}
        selectedTime={tempEnd}
        onSelect={handleEndSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeBlock: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  timeArrow: {
    paddingHorizontal: 12,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
  },
  infoText: {
    marginLeft: 6,
  },
  pickerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  pickerContent: {
    padding: 16,
    maxHeight: 300,
  },
  timeOption: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
});

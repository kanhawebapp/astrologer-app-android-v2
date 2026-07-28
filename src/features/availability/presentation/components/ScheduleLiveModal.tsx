import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { ScheduleLiveInput } from '../../domain/liveTypes';

interface ScheduleLiveModalProps {
  visible: boolean;
  onClose: () => void;
  onSchedule: (input: ScheduleLiveInput) => void;
}

export const ScheduleLiveModal: React.FC<ScheduleLiveModalProps> = ({
  visible,
  onClose,
  onSchedule,
}) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [selectedTime, setSelectedTime] = useState<string>('18:00');

  const dateOptions = [
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'thisWeek', label: 'This Week' },
  ];

  const timeOptions = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
  ];

  const handleSchedule = () => {
    if (!title.trim()) return;

    let scheduledAt: Date;
    const now = new Date();

    switch (selectedDate) {
      case 'today':
        scheduledAt = new Date(
          now.setHours(
            parseInt(selectedTime.split(':')[0]),
            parseInt(selectedTime.split(':')[1]),
            0,
            0,
          ),
        );
        if (scheduledAt < new Date()) {
          scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
        break;
      case 'tomorrow':
        scheduledAt = new Date(now);
        scheduledAt.setDate(scheduledAt.getDate() + 1);
        scheduledAt.setHours(
          parseInt(selectedTime.split(':')[0]),
          parseInt(selectedTime.split(':')[1]),
          0,
          0,
        );
        break;
      default:
        scheduledAt = new Date(now);
        scheduledAt.setHours(
          parseInt(selectedTime.split(':')[0]),
          parseInt(selectedTime.split(':')[1]),
          0,
          0,
        );
    }

    onSchedule({
      title: title.trim(),
      description: description.trim() || undefined,
      scheduledAt: scheduledAt.toISOString(),
    });

    setTitle('');
    setDescription('');
    setSelectedDate('today');
    setSelectedTime('18:00');
    onClose();
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isValid = title.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View
          style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <View
            style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <AppText variant="h4" color={theme.colors.text}>
              Schedule Live Session
            </AppText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <AppText
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.label}>
                Session Title *
              </AppText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Enter session title"
                placeholderTextColor={theme.colors.textTertiary}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <AppText
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.label}>
                Description (Optional)
              </AppText>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="What will you cover in this session?"
                placeholderTextColor={theme.colors.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={300}
              />
            </View>

            <View style={styles.inputGroup}>
              <AppText
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.label}>
                Select Date
              </AppText>
              <View style={styles.optionsRow}>
                {dateOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: theme.colors.surfaceSecondary,
                        borderColor:
                          selectedDate === option.value
                            ? theme.colors.primary
                            : 'transparent',
                      },
                    ]}
                    onPress={() => setSelectedDate(option.value)}>
                    <AppText
                      variant="body2"
                      color={
                        selectedDate === option.value
                          ? theme.colors.primary
                          : theme.colors.textSecondary
                      }>
                      {option.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.label}>
                Select Time
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.timeOptionsRow}>
                  {timeOptions.map(time => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeButton,
                        {
                          backgroundColor: theme.colors.surfaceSecondary,
                          borderColor:
                            selectedTime === time
                              ? theme.colors.primary
                              : 'transparent',
                        },
                      ]}
                      onPress={() => setSelectedTime(time)}>
                      <AppText
                        variant="caption"
                        color={
                          selectedTime === time
                            ? theme.colors.primary
                            : theme.colors.textSecondary
                        }>
                        {formatTime(time)}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </ScrollView>

          <View
            style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: theme.colors.surfaceSecondary },
              ]}
              onPress={onClose}>
              <AppText variant="button" color={theme.colors.textSecondary}>
                Cancel
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.scheduleButton,
                {
                  backgroundColor: isValid
                    ? theme.colors.primary
                    : theme.colors.textTertiary,
                },
              ]}
              onPress={handleSchedule}
              disabled={!isValid}>
              <Icon name="calendar" size={20} color={theme.colors.white} />
              <AppText variant="button" color={theme.colors.white}>
                Schedule
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  timeOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  scheduleButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
});

export default ScheduleLiveModal;

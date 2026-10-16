import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import {AppText} from '../../../../components/common/AppText';
import {useTheme} from '../../../../hooks/useTheme';
import {ScheduleLiveInput} from '../../domain/liveTypes';

interface ScheduleLiveModalProps {
  visible: boolean;
  onClose: () => void;
  onSchedule: (input: ScheduleLiveInput) => Promise<boolean>;
  isSubmitting?: boolean;
}

type PickerTarget = 'start' | 'end';

const DEFAULT_DURATION_MS = 3 * 60 * 60 * 1000;

const formatSelected = (date: Date) =>
  date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

export const ScheduleLiveModal: React.FC<ScheduleLiveModalProps> = ({
  visible,
  onClose,
  onSchedule,
  isSubmitting = false,
}) => {
  const {theme} = useTheme();
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [scheduledEndAt, setScheduledEndAt] = useState<Date | null>(null);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setScheduledAt(null);
    setScheduledEndAt(null);
    setPickerTarget(null);
    setValidationError(null);
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    resetForm();
    onClose();
  };

  const openPicker = (target: PickerTarget) => {
    if (isSubmitting) {
      return;
    }
    setPickerTarget(target);
  };

  const handlePickerConfirm = (date: Date) => {
    const target = pickerTarget;
    setPickerTarget(null);
    setValidationError(null);

    if (target === 'start') {
      setScheduledAt(date);
      setScheduledEndAt(prev => {
        if (!prev || prev.getTime() <= date.getTime()) {
          return new Date(date.getTime() + DEFAULT_DURATION_MS);
        }
        return prev;
      });
      return;
    }

    if (target === 'end') {
      setScheduledEndAt(date);
    }
  };

  const handleSchedule = async () => {
    if (isSubmitting) {
      return;
    }
    if (!title.trim()) {
      setValidationError('Please enter a session title.');
      return;
    }
    if (!scheduledAt || isNaN(scheduledAt.getTime())) {
      setValidationError('Please select a start date and time.');
      return;
    }
    if (!scheduledEndAt || isNaN(scheduledEndAt.getTime())) {
      setValidationError('Please select an end date and time.');
      return;
    }
    if (scheduledAt.getTime() <= Date.now()) {
      setValidationError('Please select a start time in the future.');
      return;
    }
    if (scheduledEndAt.getTime() <= scheduledAt.getTime()) {
      setValidationError('End time must be later than the start time.');
      return;
    }
    setValidationError(null);

    // Date#toISOString() converts the local Date to UTC with a Z suffix.
    const scheduled = await onSchedule({
      title: title.trim(),
      scheduledAt: scheduledAt.toISOString(),
      scheduledEndAt: scheduledEndAt.toISOString(),
    });
    if (scheduled) {
      resetForm();
      onClose();
    }
  };

  const isValid =
    title.trim().length > 0 && scheduledAt !== null && scheduledEndAt !== null;

  const pickerDate =
    pickerTarget === 'end'
      ? scheduledEndAt ??
        (scheduledAt
          ? new Date(scheduledAt.getTime() + DEFAULT_DURATION_MS)
          : new Date())
      : scheduledAt ?? new Date();

  const pickerMinimumDate =
    pickerTarget === 'end'
      ? scheduledAt
        ? new Date(scheduledAt.getTime() + 60 * 1000)
        : new Date()
      : new Date();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}>
      <View style={[styles.overlay, {backgroundColor: theme.colors.overlay}]}>
        <View
          style={[styles.container, {backgroundColor: theme.colors.surface}]}>
          <View
            style={[styles.header, {borderBottomColor: theme.colors.border}]}>
            <AppText variant="h4" color={theme.colors.text}>
              Schedule Live Session
            </AppText>
            <TouchableOpacity onPress={handleClose} disabled={isSubmitting}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            keyboardShouldPersistTaps="handled"
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
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <AppText
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.label}>
                Start Date & Time *
              </AppText>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.dateButton,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => openPicker('start')}
                disabled={isSubmitting}>
                <Icon
                  name="calendar-outline"
                  size={18}
                  color={theme.colors.textSecondary}
                />
                <AppText
                  variant="body2"
                  color={
                    scheduledAt ? theme.colors.text : theme.colors.textTertiary
                  }>
                  {scheduledAt
                    ? formatSelected(scheduledAt)
                    : 'Select start date and time'}
                </AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <AppText
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.label}>
                End Date & Time *
              </AppText>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.dateButton,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => openPicker('end')}
                disabled={isSubmitting}>
                <Icon
                  name="time-outline"
                  size={18}
                  color={theme.colors.textSecondary}
                />
                <AppText
                  variant="body2"
                  color={
                    scheduledEndAt
                      ? theme.colors.text
                      : theme.colors.textTertiary
                  }>
                  {scheduledEndAt
                    ? formatSelected(scheduledEndAt)
                    : 'Select end date and time'}
                </AppText>
              </TouchableOpacity>
            </View>

            {validationError && (
              <AppText
                variant="caption"
                color={theme.colors.error}
                style={styles.errorText}>
                {validationError}
              </AppText>
            )}
          </ScrollView>

          <View style={[styles.footer, {borderTopColor: theme.colors.border}]}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {backgroundColor: theme.colors.surfaceSecondary},
              ]}
              onPress={handleClose}
              disabled={isSubmitting}>
              <AppText variant="button" color={theme.colors.textSecondary}>
                Cancel
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.scheduleButton,
                {
                  backgroundColor:
                    isValid && !isSubmitting
                      ? theme.colors.primary
                      : theme.colors.textTertiary,
                },
              ]}
              onPress={handleSchedule}
              disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Icon name="calendar" size={20} color={theme.colors.white} />
              )}
              <AppText variant="button" color={theme.colors.white}>
                {isSubmitting ? 'Scheduling...' : 'Schedule'}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <DatePicker
        modal
        open={pickerTarget !== null}
        date={pickerDate}
        minimumDate={pickerMinimumDate}
        mode="datetime"
        title={
          pickerTarget === 'end'
            ? 'Select end date and time'
            : 'Select start date and time'
        }
        onConfirm={handlePickerConfirm}
        onCancel={() => setPickerTarget(null)}
      />
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    marginBottom: 12,
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

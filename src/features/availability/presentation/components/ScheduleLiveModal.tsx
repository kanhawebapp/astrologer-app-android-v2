import React, { useState } from 'react';
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
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { ScheduleLiveInput } from '../../domain/liveTypes';

interface ScheduleLiveModalProps {
  visible: boolean;
  onClose: () => void;
  onSchedule: (input: ScheduleLiveInput) => Promise<boolean>;
  isSubmitting?: boolean;
}

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
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setScheduledAt(null);
    setValidationError(null);
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    resetForm();
    onClose();
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
      setValidationError('Please select a date and time.');
      return;
    }
    if (scheduledAt.getTime() <= Date.now()) {
      setValidationError('Please select a time in the future.');
      return;
    }
    setValidationError(null);

    const scheduled = await onSchedule({
      title: title.trim(),
      scheduledAt: scheduledAt.toISOString(),
    });
    if (scheduled) {
      resetForm();
      onClose();
    }
  };

  const isValid = title.trim().length > 0 && scheduledAt !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View
          style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <View
            style={[styles.header, { borderBottomColor: theme.colors.border }]}>
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
                Date & Time *
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
                onPress={() => setPickerOpen(true)}
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
                    : 'Select date and time'}
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

          <View
            style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: theme.colors.surfaceSecondary },
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
        open={pickerOpen}
        date={scheduledAt ?? new Date()}
        minimumDate={new Date()}
        mode="datetime"
        title="Select date and time"
        onConfirm={date => {
          setPickerOpen(false);
          setScheduledAt(date);
          setValidationError(null);
        }}
        onCancel={() => setPickerOpen(false)}
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

import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../../../components/common/AppText';
import { useTheme } from '../../../../../../hooks/useTheme';

interface ProfileFormProps {
  control: any;
  errors: any;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  control,
  errors,
}) => {
  const { theme } = useTheme();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Icon
              name="person-outline"
              size={18}
              color={theme.colors.primary}
            />
            <AppText variant="label" color={theme.colors.textSecondary}>
              Full Name
            </AppText>
          </View>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderColor: errors.name
                      ? theme.colors.error
                      : theme.colors.border,
                  },
                ]}>
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
            )}
          />
          {errors.name && (
            <AppText
              variant="caption"
              color={theme.colors.error}
              style={styles.errorText}>
              {errors.name.message}
            </AppText>
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Icon
              name="document-text-outline"
              size={18}
              color={theme.colors.primary}
            />
            <AppText variant="label" color={theme.colors.textSecondary}>
              About
            </AppText>
          </View>
          <Controller
            control={control}
            name="about"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                style={[
                  styles.textAreaContainer,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderColor: errors.about
                      ? theme.colors.error
                      : theme.colors.border,
                  },
                ]}>
                <TextInput
                  style={[styles.textArea, { color: theme.colors.text }]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Tell clients about yourself, your experience, and expertise..."
                  placeholderTextColor={theme.colors.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            )}
          />
          {errors.about && (
            <AppText
              variant="caption"
              color={theme.colors.error}
              style={styles.errorText}>
              {errors.about.message}
            </AppText>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textAreaContainer: {
    borderRadius: 12,
    borderWidth: 1,
  },
  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 120,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
});

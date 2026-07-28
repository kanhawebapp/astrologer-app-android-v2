import React, { useRef, useCallback, useEffect } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { UseFormReturn } from 'react-hook-form';
import { AppButton } from '../../../components/common/AppButton';
import { AppText } from '../../../components/common/AppText';
import { useTheme } from '../../../hooks/useTheme';

const OTP_LENGTH = 4;

interface OtpFormValues {
  otp: string;
}

interface OtpInputFormProps {
  form: UseFormReturn<OtpFormValues>;
  otpDigits: string[];
  onOtpChange: (text: string, index: number) => void;
  onOtpKeyPress: (key: string, index: number) => void;
  onSubmit: (data: OtpFormValues) => void;
  onGoBack: () => void;
  isLoading: boolean;
  isOtpComplete: boolean;
  autoFocus?: boolean;
}

export const OtpInputForm: React.FC<OtpInputFormProps> = ({
  // form,
  // otpDigits,
  // onOtpChange,
  // onOtpKeyPress,
  // onSubmit,
  // onGoBack,
  // isLoading,
  // isOtpComplete,
  form,
  otpDigits,
  onOtpChange,
  onOtpKeyPress,
  onSubmit,
  onGoBack,
  isLoading,
  isOtpComplete,
  autoFocus = false,

}) => {
  const { theme } = useTheme();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleBoxPress = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (
    <View style={styles.container}>
      <View style={styles.otpContainer}>
        {otpDigits.map((digit, index) => {
          const isFilled = digit !== '';
          const isFirstEmpty =
            !isFilled && (index === 0 || otpDigits[index - 1] !== '');
          const isActive =
            isFirstEmpty || (index === OTP_LENGTH - 1 && isFilled);

          return (
            <Pressable
              key={index}
              onPress={() => handleBoxPress(index)}
              style={[
                styles.otpBox,
                {
                  borderColor: isActive
                    ? theme.colors.primary
                    : isFilled
                      ? theme.colors.primaryLight
                      : theme.colors.border,
                  backgroundColor: isFilled
                    ? theme.colors.accentPurpleLight
                    : theme.colors.surfaceSecondary,
                  shadowColor: isActive ? theme.colors.primary : 'transparent',
                },
              ]}>
              {/* <TextInput
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                style={[styles.otpInput, { color: theme.colors.text }]}
                keyboardType="number-pad"
                maxLength={1}
                // maxLength={OTP_LENGTH}
                caretHidden
                value={digit}
                // onChangeText={text => onOtpChange(text, index)}
                onChangeText={text => {
                  onOtpChange(text, index);

                  if (text && index < OTP_LENGTH - 1) {
                    inputRefs.current[index + 1]?.focus(); // ✅ move forward
                  }
                }}
                // onKeyPress={({ nativeEvent }) =>
                //   onOtpKeyPress(nativeEvent.key, index)
                // }
                onKeyPress={({ nativeEvent }) => {
                  onOtpKeyPress(nativeEvent.key, index);

                  if (
                    nativeEvent.key === 'Backspace' &&
                    !otpDigits[index] &&
                    index > 0
                  ) {
                    inputRefs.current[index - 1]?.focus(); // ✅ move back
                  }
                }}
              /> */}
              <TextInput
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                style={[styles.otpInput, { color: theme.colors.text }]}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                maxLength={1}
                caretHidden
                value={digit}
                onChangeText={text => {
                  const numericText = text.replace(/[^0-9]/g, '');

                  onOtpChange(numericText, index);

                  if (numericText && index < OTP_LENGTH - 1) {
                    inputRefs.current[index + 1]?.focus();
                  }
                }}
                onKeyPress={({ nativeEvent }) => {
                  onOtpKeyPress(nativeEvent.key, index);

                  if (
                    nativeEvent.key === 'Backspace' &&
                    !otpDigits[index] &&
                    index > 0
                  ) {
                    inputRefs.current[index - 1]?.focus();
                  }
                }}
              />
              {digit ? (
                <AppText
                  variant="h2"
                  color={theme.colors.white}
                  style={[styles.otpDigit, { backgroundColor: 'transparent' }]}>
                  {digit}
                </AppText>
              ) : isFirstEmpty ? null : (
                <View
                  style={[
                    styles.otpPlaceholder,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      {form.formState.errors.otp && (
        <AppText
          variant="caption"
          color={theme.colors.error}
          align="center"
          style={styles.errorText}>
          {form.formState.errors.otp.message}
        </AppText>
      )}

      <AppButton
        title="Verify OTP"
        onPress={form.handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={!isOtpComplete}
        fullWidth
        size="large"
        style={styles.verifyButton}
      />

      <View style={styles.resendRow}>
        <AppText variant="body2" color="white" align="center">
          Didn't receive code?{' '}
        </AppText>
        <Pressable onPress={form.handleSubmit(onSubmit)}>
          <AppText variant="label" color={theme.colors.secondary}>
            Resend OTP
          </AppText>
        </Pressable>
      </View>

      <AppButton
        title="Change Phone Number"
        onPress={onGoBack}
        variant="ghost"
        fullWidth
        size="large"
        textStyle={{ color: theme.colors.white }}
        style={styles.backButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  otpBox: {
    width: 64,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  otpInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 1,
    opacity: 0,
  },
  otpDigit: {
    fontSize: 28,
    fontWeight: '700',
    backgroundColor: 'transparent',
  },
  otpPlaceholder: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  errorText: {
    marginTop: 12,
  },
  verifyButton: {
    marginTop: 28,
    borderRadius: 14,
    paddingVertical: 16,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  backButton: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 14,
    paddingVertical: 16,
  },
});

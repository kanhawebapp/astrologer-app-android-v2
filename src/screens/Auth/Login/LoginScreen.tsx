import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  Keyboard,
  TextInput,
  View,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Button,
} from 'react-native';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CountryCode} from 'react-native-country-picker-modal';
import {Loader} from '../../../components/common/Loader';
import {useAuth} from '../../../hooks/useAuth';
import {useTheme} from '../../../hooks/useTheme';
import {useToast} from '../../../hooks/useToast';
import {phoneSchema, otpSchema} from '../../../utils/validators';
import {LoginHeader} from './LoginHeader';
import {PhoneInputForm} from './PhoneInputForm';
import {OtpInputForm} from './OtpInputForm';
import RNRestart from 'react-native-restart';

const OTP_LENGTH = 4;

interface PhoneFormValues {
  contactNo: string;
}

interface OtpFormValues {
  otp: string;
}

export const LoginScreen: React.FC = () => {
  const {requestOtp, verifyOtp, isLoading, error, clearError} = useAuth();
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {toast, hideToast, showError, showSuccess} = useToast();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [contactNo, setContactNo] = useState('');
  const [callingCode, setCallingCode] = useState('+91');
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill(''),
  );
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const phoneForm = useForm<PhoneFormValues>({
    resolver: yupResolver(phoneSchema),
    mode: 'onBlur',
    defaultValues: {contactNo: ''},
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: yupResolver(otpSchema),
    mode: 'onBlur',
    defaultValues: {otp: ''},
  });

  useEffect(() => {
    if (error) {
      showError(error, 'Error');
      clearError();
    }
  }, [error, clearError, showError]);

  const handleCountryChange = useCallback(
    (code: string, _cca2: CountryCode) => {
      setCallingCode(code);
    },
    [],
  );

  const handleRequestOtp = async (data: PhoneFormValues) => {
    Keyboard.dismiss();
    setIsSendingOtp(true);
    try {
      await requestOtp(data.contactNo);
      setContactNo(data.contactNo);
      setStep('otp');
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setResendCountdown(30);
      showSuccess('Please check your phone for the OTP.', 'OTP Sent');
    } catch {
      // Error handled by error effect
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (data: OtpFormValues) => {
    Keyboard.dismiss();
    setIsVerifyingOtp(true);
    try {
      await verifyOtp(contactNo, data.otp);
    } catch {
      // Error handled by error effect
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleOtpChange = useCallback(
    (text: string, index: number) => {
      const cleanText = text.replace(/[^0-9]/g, '');

      if (cleanText.length > 1) {
        const chars = cleanText.slice(0, OTP_LENGTH).split('');
        const newDigits = [...otpDigits];
        chars.forEach((char, i) => {
          if (index + i < OTP_LENGTH) {
            newDigits[index + i] = char;
          }
        });
        setOtpDigits(newDigits);
        const nextIndex = Math.min(index + chars.length, OTP_LENGTH - 1);
        inputRefs.current[nextIndex]?.focus();
        otpForm.setValue('otp', newDigits.join(''), {shouldValidate: true});
        return;
      }

      const newDigits = [...otpDigits];
      newDigits[index] = cleanText;
      setOtpDigits(newDigits);
      otpForm.setValue('otp', newDigits.join(''), {shouldValidate: true});

      // if (cleanText && index < OTP_LENGTH - 1) {
      //   inputRefs.current[index + 1]?.focus();
      // }
      if (cleanText) {
        if (index < OTP_LENGTH - 1) {
          inputRefs.current[index + 1]?.focus();
        }

        const updatedDigits = [...newDigits];
        const isComplete = updatedDigits.every(digit => digit !== '');

        if (isComplete) {
          Keyboard.dismiss();
        }
      }
    },
    [otpDigits, otpForm],
  );

  const handleOtpKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === 'Backspace' && !otpDigits[index] && index > 0) {
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        otpForm.setValue('otp', newDigits.join(''), {shouldValidate: true});
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otpDigits, otpForm],
  );

  const handleGoBack = () => {
    setStep('phone');
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    otpForm.reset();
    setResendCountdown(0);
  };

  const handleResendOtp = async () => {
    Keyboard.dismiss();
    if (resendCountdown > 0 || isLoading) {
      return;
    }
    setIsSendingOtp(true);
    try {
      await requestOtp(contactNo);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      otpForm.reset();
      setResendCountdown(30);
      showSuccess('Please check your phone for the new OTP.', 'OTP Sent');
    } catch {
      // Error handled by error effect
    } finally {
      setIsSendingOtp(false);
    }
  };

  useEffect(() => {
    if (resendCountdown <= 0) {
      return;
    }

    const timerId = setInterval(() => {
      setResendCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [resendCountdown]);

  const isOtpComplete = otpDigits.every(d => d !== '');

  const isDark = theme.mode === 'dark';

  return (
    <View style={styles.flex}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={
          isDark
            ? ['#0B0B2A', '#12123A', '#0F172A', '#070720']
            : ['#1E1B4B', '#312E81', '#1E1B4B', '#0F172A']
        }
        start={{x: 0, y: 0}}
        end={{x: 0.5, y: 1}}
        style={styles.gradient}>
        <View style={[styles.statusBarSpacer, {height: insets.top}]} />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.contentContainer}>
            <LoginHeader
              step={step}
              contactNo={contactNo}
              countryCode={callingCode}
            />

            {step === 'phone' ? (
              <PhoneInputForm
                form={phoneForm}
                onSubmit={handleRequestOtp}
                isLoading={isLoading}
                onCountryChange={handleCountryChange}
                type="numeric"
              />
            ) : (
              <OtpInputForm
                form={otpForm}
                otpDigits={otpDigits}
                onOtpChange={handleOtpChange}
                onOtpKeyPress={handleOtpKeyPress}
                onSubmit={handleVerifyOtp}
                onGoBack={handleGoBack}
                isLoading={isLoading}
                isOtpComplete={isOtpComplete}
                autoFocus={step === 'otp'}
                onResendOtp={handleResendOtp}
                resendCountdown={resendCountdown}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>

      <Loader
        visible={isSendingOtp || isVerifyingOtp}
        message={isVerifyingOtp ? 'Verifying...' : 'Sending OTP...'}
        fullScreen
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  statusBarSpacer: {
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});

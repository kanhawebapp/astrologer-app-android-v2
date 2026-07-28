import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
  Keyboard,
} from 'react-native';
import { Controller, UseFormReturn } from 'react-hook-form';
import CountryPicker, {
  Country,
  CountryCode,
} from 'react-native-country-picker-modal';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../../../components/common/AppButton';
import { AppText } from '../../../components/common/AppText';
import { useTheme } from '../../../hooks/useTheme';
import { AuthNavigationProp } from '../../../navigation/types';

interface PhoneFormValues {
  contactNo: string;
}

interface PhoneInputFormProps {
  form: UseFormReturn<PhoneFormValues>;
  onSubmit: (data: PhoneFormValues) => void;
  isLoading: boolean;
  type?: any,
  onCountryChange?: (callingCode: string, countryCode: CountryCode) => void;
}

export const PhoneInputForm: React.FC<PhoneInputFormProps> = ({
  form,
  onSubmit,
  isLoading,
  onCountryChange,
  type = 'number-pad',
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<AuthNavigationProp>();
  const [countryCode, setCountryCode] = useState<CountryCode>('IN');
  const [callingCode, setCallingCode] = useState('+91');
  const [isFocused, setIsFocused] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const onSelect = useCallback(
    (country: Country) => {
      setCountryCode(country.cca2);
      const code = `+${country.callingCode[0]}`;
      setCallingCode(code);
      onCountryChange?.(code, country.cca2);
      setShowPicker(false);
    },
    [onCountryChange],
  );

  const borderColor = form.formState.errors.contactNo
    ? theme.colors.error
    : isFocused
      ? theme.colors.primary
      : theme.colors.border;

  return (
    <View style={styles.container}>
      <AppText variant="label" color={theme.colors.white} style={styles.label}>
        Phone Number
      </AppText>

      <View style={styles.inputRow}>
        <Pressable
          onPress={() => setShowPicker(true)}
          style={[
            styles.countryCodeBox,
            {
              borderColor,
              backgroundColor: theme.colors.surfaceSecondary,
            },
          ]}>
          <AppText
            variant="body1"
            color={theme.colors.text}
            style={styles.callingCodeText}>
            {callingCode}
          </AppText>
          <AppText
            variant="caption"
            color={theme.colors.textTertiary}
            style={styles.dropdownArrow}>
            {'\u25BC'}
          </AppText>
        </Pressable>

        <Modal
          visible={showPicker}
          animationType="slide"
          transparent
          onRequestClose={() => setShowPicker(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.background },
              ]}>
              <View style={styles.modalHeader}>
                <AppText variant="h5" color={theme.colors.text}>
                  Select Country
                </AppText>
                <Pressable onPress={() => setShowPicker(false)}>
                  <AppText variant="body1" color={theme.colors.primary}>
                    Close
                  </AppText>
                </Pressable>
              </View>
              <CountryPicker
                countryCode={countryCode}
                withFilter
                withFlag
                withCallingCode
                withEmoji
                withModal={false}
                onSelect={onSelect}
                containerButtonStyle={styles.countryPickerButton}
                theme={{
                  primaryColor: theme.colors.primary,
                  primaryColorVariant: theme.colors.primaryLight,
                  backgroundColor: theme.colors.background,
                  onBackgroundTextColor: theme.colors.text,
                  fontSize: 15,
                }}
              />
            </View>
          </View>
        </Modal>

        <View
          style={[
            styles.phoneInputBox,
            {
              borderColor,
              backgroundColor: theme.colors.surfaceSecondary,
            },
          ]}>
          <Controller
            control={form.control}
            name="contactNo"
            render={({ field: { onChange, onBlur, value } }) => (
              // <TextInput
              //   style={[
              //     styles.phoneInput,
              //     {
              //       color: theme.colors.text,
              //       fontSize: theme.typography.body1.fontSize,
              //     },
              //   ]}
              //   placeholder="Enter mobile number"
              //   placeholderTextColor={theme.colors.textTertiary}
              //   keyboardType={type}
              //   autoCapitalize="none"
              //   autoCorrect={false}
              //   maxLength={10}
              //   onBlur={() => {
              //     setIsFocused(false);
              //     onBlur();
              //   }}
              //   onFocus={() => setIsFocused(true)}
              //   onChangeText={text => {
              //     if (text.length === 10) {
              //       Keyboard.dismiss();
              //     }
              //     onChange(text);
              //   }}
              //   value={value}
              // />
              <TextInput
                style={[
                  styles.phoneInput,
                  {
                    color: theme.colors.text,
                    fontSize: theme.typography.body1.fontSize,
                  },
                ]}
                placeholder="Enter mobile number"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="number-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={10}
                onBlur={() => {
                  setIsFocused(false);
                  onBlur();
                }}
                onFocus={() => setIsFocused(true)}
                onChangeText={text => {
                  const numericText = text.replace(/[^0-9]/g, '');

                  if (numericText.length === 10) {
                    Keyboard.dismiss();
                  }

                  onChange(numericText);
                }}
                value={value}
              />
            )}
          />
        </View>
      </View>

      {form.formState.errors.contactNo && (
        <AppText
          variant="caption"
          color={theme.colors.error}
          style={styles.errorText}>
          {form.formState.errors.contactNo.message}
        </AppText>
      )}

      <AppButton
        title="Send OTP"
        onPress={form.handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={!form.formState.isValid}
        fullWidth
        size="large"
        style={styles.button}
      />

      <View style={styles.termsRow}>
        <AppText variant="caption" color="white" align="center">
          By continuing, you agree to our{' '}
        </AppText>
        <Pressable onPress={() => navigation.navigate('TermsOfService')}>
          <AppText variant="caption" color={theme.colors.secondary}>
            Terms of Service
          </AppText>
        </Pressable>
        <AppText variant="caption" color={theme.colors.white}>
          {' & '}
        </AppText>
        <Pressable onPress={() => navigation.navigate('PrivacyPolicy')}>
          <AppText variant="caption" color={theme.colors.secondary}>
            Privacy Policy
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    marginBottom: 10,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    // gap: 10,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    // borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    minWidth: 80,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callingCodeText: {
    fontWeight: '600',
    marginLeft: 4,
  },
  dropdownArrow: {
    marginLeft: 6,
    fontSize: 18,
    opacity: 0.5,
    justifyContent: 'center',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 6
  },
  phoneInputBox: {
    flex: 1,
    borderWidth: 1.5,
    // borderRadius: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  phoneInput: {
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    letterSpacing: 1,
  },
  errorText: {
    marginTop: 8,
    marginLeft: 4,
  },
  button: {
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 16,
  },
  termsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // maxHeight: '70%',
    paddingTop: 16,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
});

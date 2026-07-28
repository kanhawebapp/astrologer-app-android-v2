import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../../hooks/useTheme';
import { ScreenContainer } from '../../../../../components/layout/ScreenContainer';
import { Header } from '../../../../../components/layout/Header';
import { AppText } from '../../../../../components/common/AppText';
import { useEditProfile } from './hooks/useEditProfile';
import { ProfileForm } from './components/ProfileForm';
import { SkillSelector } from './components/SkillSelector';
import { LanguageSelector } from './components/LanguageSelector';
import { PriceInput } from './components/PriceInput';

export const EditProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    errors,
    isDirty,
    updating,
    successMessage,
    initializeForm,
    saveProfile,
    clearSuccessMessage,
    toggleSkill,
    toggleLanguage,
    watch,
  } = useEditProfile();

  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        clearSuccessMessage();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, clearSuccessMessage]);

  const watchedSkills = watch('skills');
  const watchedLanguages = watch('languages');
  const watchedChatPrice = watch('chatPrice');
  const watchedCallPrice = watch('callPrice');

  const handleSave = async (data: any) => {
    await saveProfile(data);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ScreenContainer scrollable={false} withPadding={false}>
      <Header
        title="Edit Profile"
        showBack
        onBackPress={handleBack}
        rightComponent={
          <TouchableOpacity
            onPress={handleSubmit(handleSave)}
            disabled={!isDirty || updating}
            style={[
              styles.saveButton,
              {
                backgroundColor: isDirty
                  ? theme.colors.primary
                  : theme.colors.surfaceSecondary,
              },
            ]}>
            {updating ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <AppText
                variant="body2"
                color={
                  isDirty ? theme.colors.white : theme.colors.textTertiary
                }>
                Save
              </AppText>
            )}
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {successMessage && (
            <View
              style={[
                styles.successBanner,
                { backgroundColor: theme.colors.successLight },
              ]}>
              <Icon
                name="checkmark-circle"
                size={20}
                color={theme.colors.success}
              />
              <AppText variant="body2" color={theme.colors.success}>
                {successMessage}
              </AppText>
            </View>
          )}

          <View
            style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <AppText
              variant="label"
              color={theme.colors.textSecondary}
              style={styles.sectionTitle}>
              PERSONAL INFO
            </AppText>
            <ProfileForm control={control} errors={errors} />
          </View>

          <View
            style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <AppText
              variant="label"
              color={theme.colors.textSecondary}
              style={styles.sectionTitle}>
              PROFESSIONAL INFO
            </AppText>
            <SkillSelector
              selectedSkills={watchedSkills}
              onToggleSkill={toggleSkill}
              error={errors.skills}
            />
            <LanguageSelector
              selectedLanguages={watchedLanguages}
              onToggleLanguage={toggleLanguage}
              error={errors.languages}
            />
          </View>

          <View
            style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <AppText
              variant="label"
              color={theme.colors.textSecondary}
              style={styles.sectionTitle}>
              PRICING
            </AppText>
            <PriceInput
              label="Chat Price"
              value={watchedChatPrice}
              onIncrement={() => {
                const newValue = Math.min(watchedChatPrice + 5, 100);
                control._formValues.chatPrice = newValue;
              }}
              onDecrement={() => {
                const newValue = Math.max(watchedChatPrice - 5, 5);
                control._formValues.chatPrice = newValue;
              }}
              minValue={5}
              maxValue={100}
              icon="chatbubble-ellipses"
              color={theme.colors.accentPurple}
              error={errors.chatPrice?.message}
            />
            <PriceInput
              label="Call Price"
              value={watchedCallPrice}
              onIncrement={() => {
                const newValue = Math.min(watchedCallPrice + 5, 200);
                control._formValues.callPrice = newValue;
              }}
              onDecrement={() => {
                const newValue = Math.max(watchedCallPrice - 5, 10);
                control._formValues.callPrice = newValue;
              }}
              minValue={10}
              maxValue={200}
              icon="call"
              color={theme.colors.info}
              error={errors.callPrice?.message}
            />
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: 40,
  },
});

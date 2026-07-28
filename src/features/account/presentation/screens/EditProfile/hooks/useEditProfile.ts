import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AppDispatch, RootState } from '../../../../../../store';
import { updateAstrologerProfile } from '../../../../../../store/slices/accountSlice';
import { EditProfileFormData, editProfileSchema } from '../types';

export const useEditProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, pricing, updating, error } = useSelector(
    (state: RootState) => state.account,
  );

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormData>({
    resolver: yupResolver(editProfileSchema) as any,
    defaultValues: {
      name: profile?.name || '',
      about: profile?.about || '',
      chatPrice: pricing?.chatPricePerMinute || 10,
      callPrice: pricing?.callPricePerMinute || 20,
      skills: profile?.skills || [],
      languages: profile?.languages || [],
    },
  });

  const initializeForm = useCallback(() => {
    if (profile && pricing) {
      reset({
        name: profile.name,
        about: profile.about,
        chatPrice: pricing.chatPricePerMinute,
        callPrice: pricing.callPricePerMinute,
        skills: profile.skills,
        languages: profile.languages,
      });
    }
  }, [profile, pricing, reset]);

  const saveProfile = useCallback(
    async (data: EditProfileFormData) => {
      setSuccessMessage(null);

      try {
        await dispatch(
          updateAstrologerProfile({
            name: data.name,
            about: data.about,
            skills: data.skills,
            languages: data.languages,
            chatPricePerMinute: data.chatPrice,
            callPricePerMinute: data.callPrice,
          }),
        ).unwrap();

        setSuccessMessage('Profile updated successfully!');
        return { success: true };
      } catch (err) {
        return { success: false, error: err };
      }
    },
    [dispatch],
  );

  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const toggleSkill = useCallback(
    (skill: string) => {
      const currentSkills = watch('skills');
      const newSkills = currentSkills.includes(skill)
        ? currentSkills.filter(s => s !== skill)
        : [...currentSkills, skill];
      setValue('skills', newSkills, { shouldDirty: true });
    },
    [watch, setValue],
  );

  const toggleLanguage = useCallback(
    (language: string) => {
      const currentLanguages = watch('languages');
      const newLanguages = currentLanguages.includes(language)
        ? currentLanguages.filter(l => l !== language)
        : [...currentLanguages, language];
      setValue('languages', newLanguages, { shouldDirty: true });
    },
    [watch, setValue],
  );

  return {
    control,
    handleSubmit,
    errors,
    isDirty,
    updating,
    error,
    successMessage,
    initializeForm,
    saveProfile,
    clearSuccessMessage,
    toggleSkill,
    toggleLanguage,
    watch,
  };
};

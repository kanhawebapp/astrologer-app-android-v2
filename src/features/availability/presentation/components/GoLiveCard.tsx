import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { useToast } from '../../../../hooks/useToast';
import { RootState } from '../../../../store';
import { astrologerServicesApi } from '../../../../services/api/AvailvalityToggle/toggleAstrologerService.service';
import { getErrorMessage } from '../../../../utils/helpers';

interface GoLiveCardProps {
  onGoLiveNow: (title: string) => Promise<boolean>;
  onScheduleLive: () => void;
  isLoading?: boolean;
}

export const GoLiveCard: React.FC<GoLiveCardProps> = ({
  onGoLiveNow,
  onScheduleLive,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const { showWarning, showError } = useToast();
  const [title, setTitle] = useState('');
  const [isValidatingLive, setIsValidatingLive] = useState(false);
  const astrologerId = useSelector(
    (state: RootState) =>
      state.account.profile?.id || state.auth.user?.id || null,
  );
  const isBusy = isLoading || isValidatingLive;
  const canGoLive = title.trim().length > 0 && !isBusy;

  const handleGoLive = async () => {
    if (!canGoLive) {
      return;
    }

    if (!astrologerId) {
      showError('Unable to identify astrologer. Please sign in again.');
      return;
    }

    setIsValidatingLive(true);
    try {
      // Always read the latest LIVE service status before starting Go Live.
      const response = await astrologerServicesApi.getAstrologerServices({
        astrologerId: String(astrologerId),
      });
      const isLiveActive =
        response?.getAstrologerById?.isLiveActive === true;

      if (!isLiveActive) {
        showWarning('Please turn ON Live stream first.');
        return;
      }
    } catch (error) {
      showError(getErrorMessage(error));
      return;
    } finally {
      setIsValidatingLive(false);
    }

    const started = await onGoLiveNow(title);
    if (started) {
      setTitle('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: theme.colors.errorLight },
          ]}>
          <Icon name="videocam" size={32} color={theme.colors.error} />
        </View>
      </View>

      <AppText variant="h4" color={theme.colors.text} style={styles.title}>
        Start Live Session
      </AppText>

      <AppText
        variant="body2"
        color={theme.colors.textSecondary}
        style={styles.description}>
        Go live instantly or schedule a session for later
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
        placeholder="Live session title"
        placeholderTextColor={theme.colors.textTertiary}
        value={title}
        onChangeText={setTitle}
        maxLength={100}
        editable={!isBusy}
        returnKeyType="done"
      />

      <TouchableOpacity
        style={[
          styles.goLiveButton,
          {
            backgroundColor: canGoLive
              ? theme.colors.error
              : theme.colors.textTertiary,
          },
        ]}
        onPress={handleGoLive}
        disabled={!canGoLive}
        activeOpacity={0.8}>
        {isBusy ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Icon name="radio-button-on" size={24} color={theme.colors.white} />
        )}
        <AppText variant="button" color={theme.colors.white}>
          {isBusy ? 'STARTING...' : 'GO LIVE NOW'}
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.scheduleButton,
          { backgroundColor: theme.colors.surfaceSecondary },
        ]}
        onPress={onScheduleLive}
        disabled={isBusy}
        activeOpacity={0.8}>
        <Icon
          name="calendar-outline"
          size={20}
          color={theme.colors.textSecondary}
        />
        <AppText variant="button" color={theme.colors.textSecondary}>
          Schedule Live
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  goLiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    gap: 10,
    marginBottom: 12,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    gap: 8,
  },
});

export default GoLiveCard;

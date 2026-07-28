import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';

interface GoLiveCardProps {
  onGoLiveNow: () => void;
  onScheduleLive: () => void;
  isLoading?: boolean;
}

export const GoLiveCard: React.FC<GoLiveCardProps> = ({
  onGoLiveNow,
  onScheduleLive,
  isLoading = false,
}) => {
  const { theme } = useTheme();

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

      <TouchableOpacity
        style={[styles.goLiveButton, { backgroundColor: theme.colors.error }]}
        onPress={onGoLiveNow}
        disabled={isLoading}
        activeOpacity={0.8}>
        <Icon name="radio-button-on" size={24} color={theme.colors.white} />
        <AppText variant="button" color={theme.colors.white}>
          GO LIVE NOW
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.scheduleButton,
          { backgroundColor: theme.colors.surfaceSecondary },
        ]}
        onPress={onScheduleLive}
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

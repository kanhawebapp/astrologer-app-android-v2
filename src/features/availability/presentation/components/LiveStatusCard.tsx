import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { LiveSession } from '../../domain/liveTypes';

interface LiveStatusCardProps {
  session: LiveSession;
  isEnding: boolean;
  onReturnToLive: (session: LiveSession) => void;
  onEndLive: (session: LiveSession) => void;
}

export const LiveStatusCard: React.FC<LiveStatusCardProps> = ({
  session,
  isEnding,
  onReturnToLive,
  onEndLive,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <AppText variant="caption" color={theme.colors.textSecondary}>
          Active session
        </AppText>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: theme.colors.errorLight },
          ]}>
          <AppText variant="caption" color={theme.colors.error}>
            {session.status}
          </AppText>
        </View>
      </View>

      <AppText variant="h4" color={theme.colors.text} style={styles.title}>
        {session.title}
      </AppText>

      <AppText
        variant="caption"
        color={theme.colors.textTertiary}
        style={styles.hint}>
        Camera and microphone are off. Return to the broadcast screen to
        reconnect, or end the session.
      </AppText>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => onReturnToLive(session)}
        disabled={isEnding}
        activeOpacity={0.8}>
        <Icon name="videocam" size={20} color={theme.colors.white} />
        <AppText variant="button" color={theme.colors.white}>
          Return to Live
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.endButton,
          {
            backgroundColor: isEnding
              ? theme.colors.textTertiary
              : theme.colors.error,
          },
        ]}
        onPress={() => onEndLive(session)}
        disabled={isEnding}
        activeOpacity={0.8}>
        {isEnding ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Icon name="close" size={20} color={theme.colors.white} />
        )}
        <AppText variant="button" color={theme.colors.white}>
          {isEnding ? 'ENDING...' : 'END LIVE'}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  title: {
    marginBottom: 8,
  },
  hint: {
    marginBottom: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 12,
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
});

export default LiveStatusCard;

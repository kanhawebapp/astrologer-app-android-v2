import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { spacing, borderRadius } from './theme/timeThemeColors';
import { LiveStatus } from '../../domain/types';

interface SessionTypeBadgesProps {
  liveStatus: LiveStatus;
}

export const SessionTypeBadges: React.FC<SessionTypeBadgesProps> = memo(
  ({ liveStatus }) => {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';

    return (
      <View style={styles.container}>
        {liveStatus.chatEnabled && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isDark
                  ? 'rgba(139, 133, 255, 0.18)'
                  : 'rgba(108, 99, 255, 0.08)',
              },
            ]}>
            <Icon name="chat" size={14} color={theme.colors.primary} />
            <AppText
              variant="caption"
              style={[styles.text, { color: theme.colors.primary }]}>
              Chat
            </AppText>
          </View>
        )}
        {liveStatus.callEnabled && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 101, 132, 0.18)'
                  : 'rgba(255, 101, 132, 0.08)',
              },
            ]}>
            <Icon name="call" size={14} color={theme.colors.secondary} />
            <AppText
              variant="caption"
              style={[styles.text, { color: theme.colors.secondary }]}>
              Call
            </AppText>
          </View>
        )}
        {liveStatus.videoEnabled && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isDark
                  ? 'rgba(139, 92, 246, 0.18)'
                  : 'rgba(139, 92, 246, 0.08)',
              },
            ]}>
            <Icon name="videocam" size={14} color={theme.colors.accentPurple} />
            <AppText
              variant="caption"
              style={[styles.text, { color: theme.colors.accentPurple }]}>
              Video
            </AppText>
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  text: {
    fontWeight: '600',
    fontSize: 11,
  },
});

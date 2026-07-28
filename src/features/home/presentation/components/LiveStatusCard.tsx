import React from 'react';
import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { LiveStatus } from '../../domain/types';

interface LiveStatusCardProps {
  liveStatus: LiveStatus;
  onToggleOnline: (isOnline: boolean) => void;
  onGoLivePress?: () => void;
}

export const LiveStatusCard: React.FC<LiveStatusCardProps> = ({
  liveStatus,
  onToggleOnline,
  onGoLivePress,
}) => {
  const { theme } = useTheme();
  const isOnline = liveStatus.isOnline;

  const StatusBadge: React.FC<{
    enabled: boolean;
    label: string;
    icon: string;
  }> = ({ enabled, label, icon }) => (
    <View style={[styles.statusBadge, enabled && styles.statusBadgeActive]}>
      <View
        style={[styles.statusIconWrapper, enabled && styles.statusIconActive]}>
        <Icon
          name={icon}
          size={14}
          color={enabled ? theme.colors.success : theme.colors.textTertiary}
        />
      </View>
      <AppText
        variant="caption"
        color={enabled ? theme.colors.success : theme.colors.textTertiary}
        style={styles.statusBadgeText}>
        {label}
      </AppText>
    </View>
  );

  return (
    <View style={styles.container}>
      {isOnline && (
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.15)', 'transparent']}
          style={styles.onlineGradient}
        />
      )}
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.indicatorWrapper}>
              <View
                style={[
                  styles.indicator,
                  {
                    backgroundColor: isOnline
                      ? theme.colors.success
                      : theme.colors.textTertiary,
                  },
                  isOnline && styles.indicatorPulse,
                ]}
              />
              {isOnline && <View style={styles.indicatorGlow} />}
            </View>
            <AppText variant="h5" color={theme.colors.text}>
              {isOnline ? 'Live' : 'Offline'}
            </AppText>
            {isOnline && (
              <View
                style={[
                  styles.liveTag,
                  { backgroundColor: theme.colors.successLight },
                ]}>
                <View style={styles.liveTagDot} />
                <AppText variant="caption" color={theme.colors.success}>
                  Online
                </AppText>
              </View>
            )}
          </View>
          <View style={styles.switchContainer}>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              {isOnline ? 'Available' : 'Unavailable'}
            </AppText>
            <View style={styles.switchWrapper}>
              <Switch
                value={isOnline}
                onValueChange={onToggleOnline}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.successLight,
                }}
                thumbColor={
                  isOnline ? theme.colors.success : theme.colors.surface
                }
              />
            </View>
          </View>
        </View>

        <View style={styles.statusRow}>
          <StatusBadge
            enabled={liveStatus.chatEnabled}
            label="Chat"
            icon="chat"
          />
          <StatusBadge
            enabled={liveStatus.callEnabled}
            label="Call"
            icon="call"
          />
          <StatusBadge
            enabled={liveStatus.videoEnabled}
            label="Video"
            icon="videocam"
          />
        </View>

        {isOnline && (
          <TouchableOpacity onPress={onGoLivePress} activeOpacity={0.8}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.goLiveButton}>
              <View style={styles.goLiveButtonContent}>
                <View style={styles.buttonIconWrapper}>
                  <Icon name="broadcast" size={20} color={theme.colors.white} />
                </View>
                <View style={styles.buttonTextContainer}>
                  <AppText variant="button" color={theme.colors.white}>
                    Start New Session
                  </AppText>
                  <AppText variant="caption" color="rgba(255,255,255,0.8)">
                    Begin accepting consultations
                  </AppText>
                </View>
                <View style={styles.arrowCircle}>
                  <Icon
                    name="arrow-forward"
                    size={18}
                    color={theme.colors.white}
                  />
                </View>
              </View>
              <View style={styles.buttonGlow} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.cardShadow, isOnline && styles.cardShadowActive]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  onlineGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  cardContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
  },
  cardShadow: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  cardShadowActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    shadowColor: '#10B981',
    shadowOpacity: 0.2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  indicatorWrapper: {
    position: 'relative',
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  indicatorPulse: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 3,
  },
  indicatorGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 9,
    backgroundColor: 'rgba(16, 185, 129, 0.35)',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 5,
  },
  liveTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  switchContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  switchWrapper: {
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusBadgeText: {
    fontWeight: '600',
  },
  goLiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  goLiveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  buttonIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextContainer: {
    flex: 1,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});

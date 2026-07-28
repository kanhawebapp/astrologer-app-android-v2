import React, {memo, useState, useCallback, useRef, useEffect} from 'react';
import {View, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AppText} from '../../../../components/common/AppText';
import {useTheme} from '../../../../hooks/useTheme';
import {LiveStatus} from '../../domain/types';

interface LiveStatusWidgetProps {
  liveStatus: LiveStatus;
  activeSessionCount: number;
  liveEarnings: number;
  onToggleOnline: (isOnline: boolean) => void;
  onGoLivePress?: () => void;
}

export const LiveStatusWidget: React.FC<LiveStatusWidgetProps> = memo(
  ({
    liveStatus,
    activeSessionCount,
    liveEarnings,
    onToggleOnline,
    onGoLivePress,
  }) => {
    const {theme, mode} = useTheme();
    const [isToggling, setIsToggling] = useState(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
      if (liveStatus.isOnline) {
        const pulse = Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(pulseAnim, {
                toValue: 1.2,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(glowAnim, {
                toValue: 0.8,
                duration: 800,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(glowAnim, {
                toValue: 0.4,
                duration: 800,
                useNativeDriver: true,
              }),
            ]),
          ]),
        );
        pulse.start();
        return () => pulse.stop();
      } else {
        pulseAnim.setValue(1);
        glowAnim.setValue(0.4);
      }
    }, [liveStatus.isOnline, pulseAnim, glowAnim]);

    const handleToggle = useCallback(async () => {
      setIsToggling(true);
      try {
        await onToggleOnline(!liveStatus.isOnline);
      } finally {
        setIsToggling(false);
      }
    }, [liveStatus.isOnline, onToggleOnline]);

    const formatEarnings = (amount: number) => {
      if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}k coins`;
      }
      return `${amount} coins`;
    };

    const isOnline = liveStatus.isOnline;

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isOnline
              ? mode === 'dark'
                ? 'rgba(16, 185, 129, 0.12)'
                : 'rgba(16, 185, 129, 0.08)'
              : theme.colors.surfaceSecondary,
            borderColor: isOnline ? theme.colors.success : theme.colors.border,
          },
        ]}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              {
                backgroundColor: isOnline
                  ? theme.colors.success
                  : theme.colors.textTertiary,
              },
            ]}
            onPress={handleToggle}
            disabled={isToggling}
            activeOpacity={0.7}>
            <View style={styles.toggleContent}>
              <Animated.View
                style={[
                  styles.recordIndicator,
                  {
                    backgroundColor: theme.colors.white,
                    transform: [{scale: pulseAnim}],
                    opacity: isOnline ? glowAnim : 0.6,
                  },
                ]}
              />
              <AppText variant="body2" style={styles.toggleText}>
                {isOnline ? 'Online' : 'Go Live'}
              </AppText>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.centerSection}>
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIcon,
                {backgroundColor: theme.colors.primaryLight},
              ]}>
              <Icon name="videocam" size={16} color={theme.colors.primary} />
            </View>
            <View style={styles.statText}>
              <AppText
                variant="caption"
                style={{color: theme.colors.textTertiary}}>
                Active
              </AppText>
              <AppText
                variant="h4"
                style={{color: theme.colors.text, fontWeight: '700'}}>
                {activeSessionCount}
              </AppText>
            </View>
          </View>

          <View
            style={[styles.divider, {backgroundColor: theme.colors.border}]}
          />

          <View style={styles.statItem}>
            <View
              style={[
                styles.statIcon,
                {backgroundColor: theme.colors.successLight},
              ]}>
              <Icon
                name="account-balance-wallet"
                size={16}
                color={theme.colors.success}
              />
            </View>
            <View style={styles.statText}>
              <AppText
                variant="caption"
                style={{color: theme.colors.textTertiary}}>
                Today
              </AppText>
              <AppText
                variant="h4"
                style={{color: theme.colors.text, fontWeight: '700'}}>
                {formatEarnings(liveEarnings)}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.enabledTypes}>
            {liveStatus.chatEnabled && (
              <View
                style={[
                  styles.typeBadge,
                  {backgroundColor: theme.colors.primaryLight},
                ]}>
                <Icon name="chat" size={14} color={theme.colors.primary} />
              </View>
            )}
            {liveStatus.callEnabled && (
              <View
                style={[
                  styles.typeBadge,
                  {backgroundColor: theme.colors.secondaryLight},
                ]}>
                <Icon name="call" size={14} color={theme.colors.secondary} />
              </View>
            )}
            {liveStatus.videoEnabled && (
              <View
                style={[
                  styles.typeBadge,
                  {backgroundColor: theme.colors.accentPurpleLight},
                ]}>
                <Icon
                  name="videocam"
                  size={14}
                  color={theme.colors.accentPurple}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  leftSection: {
    flex: 0.35,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 24,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  toggleText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  centerSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statText: {
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 36,
    marginHorizontal: 8,
  },
  rightSection: {
    flex: 0.3,
    alignItems: 'flex-end',
  },
  enabledTypes: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

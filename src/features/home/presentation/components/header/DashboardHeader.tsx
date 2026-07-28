import React, { memo, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LiveStatus } from '@features/home/domain/types';
import { useTimeTheme } from './hooks/useTimeTheme';
import {
  useHeaderAnimations,
  useNotificationAnimation,
} from './hooks/useHeaderAnimations';
import { HeaderContainer } from './HeaderContainer';
import { GreetingSection } from './GreetingSection';
import { NotificationButton } from './NotificationButton';
import { LiveStatusCard } from './LiveStatusCard';
import { EnergyFooter } from './EnergyFooter';
import { DecorativeBackground } from './DecorativeBackground';
import { TimeOfDay } from './theme/timeThemeColors';

interface DashboardHeaderProps {
  profileName: string;
  liveStatus: LiveStatus;
  onNotificationPress: () => void;
  notificationCount?: number;
}

const formatDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = memo(
  ({ profileName, liveStatus, onNotificationPress, notificationCount = 0 }) => {
    const timeTheme = useTimeTheme();
    const { isOnline, hasNotification } = {
      isOnline: liveStatus.isOnline,
      hasNotification: notificationCount > 0,
    };

    const animations = useHeaderAnimations({ isOnline, hasNotification });
    const { scale: notificationScale, startBounce } =
      useNotificationAnimation();

    const handleNotificationPress = useCallback(() => {
      startBounce();
      onNotificationPress();
    }, [onNotificationPress, startBounce]);

    const notificationAnimatedStyle = {
      transform: [
        {
          scale: notificationScale.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1],
          }),
        },
      ],
    };

    return (
      <View style={styles.container}>
        <DecorativeBackground timeOfDay={timeTheme.timeOfDay as TimeOfDay} />

        <View style={styles.decorativeStars}>
          <Text style={styles.starIcon}>✦</Text>
          <Text style={[styles.starIcon, styles.starIconSmall]}>✧</Text>
        </View>

        <HeaderContainer animatedStyle={animations.entryStyle}>
          <View style={styles.topRow}>
            <GreetingSection
              greeting={timeTheme.greeting}
              subtitle={timeTheme.subtitle}
              profileName={profileName}
              date={formatDate()}
              showPremiumBadge={true}
            />
            <NotificationButton
              notificationCount={notificationCount}
              onPress={handleNotificationPress}
              animatedStyle={notificationAnimatedStyle}
            />
          </View>

          <LiveStatusCard
            liveStatus={liveStatus}
            shimmerStyle={animations.shimmerStyle}
            floatStyle={animations.floatStyle}
            pulseStyle={animations.pulseStyle}
          />

          <EnergyFooter />
        </HeaderContainer>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  decorativeStars: {
    position: 'absolute',
    top: 12,
    right: 60,
    flexDirection: 'row',
    zIndex: 10,
  },
  starIcon: {
    fontSize: 12,
    color: 'rgba(139, 133, 255, 0.4)',
  },
  starIconSmall: {
    fontSize: 8,
    marginLeft: -4,
    marginTop: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});

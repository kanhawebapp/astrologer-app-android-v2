import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Text,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { LiveStatus } from '../../domain/types';
import { HeaderContainer } from './header/HeaderContainer';
import { GreetingSection } from './header/GreetingSection';
import { PremiumBadge } from './header/PremiumBadge';
import { NotificationButton } from './header/NotificationButton';
import { LiveStatusCard } from './header/LiveStatusCard';
import { EnergyFooter } from './header/EnergyFooter';
import { DecorativeBackground } from './header/DecorativeBackground';
import { useTimeTheme } from './header/hooks/useTimeTheme';
import {
  useHeaderAnimations,
  useNotificationAnimation,
} from './header/hooks/useHeaderAnimations';
import { TimeOfDay } from './header/theme/timeThemeColors';
import { useNavigation } from '@react-navigation/native';

interface DashboardHeaderProps {
  profile: any;
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
  ({ profile, liveStatus, onNotificationPress, notificationCount = 0 }) => {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';
    const timeTheme = useTimeTheme();
    const navigation = useNavigation<any>()

    const { isOnline, hasNotification } = {
      isOnline: liveStatus?.isOnline,
      hasNotification: notificationCount > 0,
    };

    const animations = useHeaderAnimations({ isOnline, hasNotification });
    const { scale: notificationScale, startBounce } =
      useNotificationAnimation();

    useEffect(() => {
      if (notificationCount > 0) {
        startBounce();
      }
    }, [notificationCount, startBounce]);

    const handleNotificationPress = useCallback(() => {
      navigation.navigate("NotificationScreen")
      onNotificationPress();
    }, [onNotificationPress]);

    const getGreeting = () => {
      return timeTheme.greeting;
    };

    // const firstName = profileName.split(' ')[0] || profileName; displayName

    const getActiveSessionTypes = (status: LiveStatus): string[] => {
      const types: string[] = [];
      if (status.chatEnabled) types.push('Chat');
      if (status.callEnabled) types.push('Call');
      if (status.videoEnabled) types.push('Video');
      return types;
    };

    const IMAGE_BASE_URL = 'https://dhwaniastro.com';
    const imageUrl = profile?.avatar
      ? `${IMAGE_BASE_URL}${profile.avatar}`
      : null;

    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
      ).start();
    }, []);


    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    // console.log("profileName here in DashboardHeader:", profileName);

    return (
      <View style={styles.container}>
        <DecorativeBackground timeOfDay={timeTheme.timeOfDay} />

        <View style={styles.decorativeStars}>
          <Text style={styles.starIcon}>✦</Text>
          <Text style={[styles.starIcon, styles.starIconSmall]}>✧</Text>
        </View>

        <HeaderContainer animatedStyle={animations.entryStyle}>
          <View style={styles.topRow}>
            {/* <View style={styles.astrologerImageContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.astrologerImage}
                resizeMode="cover"
              />
              <View style={styles.onlineIndicator} />
            </View> */}


            <View style={styles.astrologerImageContainer}>
              <Animated.View
                style={[
                  styles.sunRing,
                  {
                    transform: [{ rotate: spin }],
                  },
                ]}
              />

              <Image
                source={{ uri: imageUrl }}
                style={styles.astrologerImage}
              />
            </View>

            <View style={styles.greetingContainer}>
              <View style={styles.greetingRow}>
                <AppText
                  // variant="h3"
                  style={[styles.greeting, { color: theme.colors.white }]}>
                  {getGreeting()}
                </AppText>
              </View>

              <View style={styles.nameRow}>
                <Text style={styles.nameGradient}>{profile?.displayName}!</Text>
                {/* <PremiumBadge /> */}
              </View>

              <View style={styles.subtitleContainer}>
                <AppText
                  variant="body2"
                  style={[
                    styles.cosmicSubtitle,
                    { color: theme.colors.white },
                  ]}>
                  {timeTheme.subtitle}
                </AppText>
              </View>
            </View>

            <NotificationButton
              notificationCount={notificationCount}
              onPress={handleNotificationPress}
              animatedStyle={{
                transform: [
                  {
                    scale: notificationScale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              }}
            />
          </View>

          <EnergyFooter />
        </HeaderContainer>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    // paddingTop: Platform.OS === 'ios' ? 60 : 40,
    // paddingBottom: 20,
    // paddingHorizontal: 20,
    // overflow: 'hidden',

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
    padding: 20,
    marginTop: 15,
  },
  greetingContainer: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 12,
  },
  // astrologerImageContainer: {
  //   position: 'relative',
  //   width: 70,
  //   height: 70,
  //   marginLeft: -15,
  //   marginTop: 10,
  // },
  // astrologerImage: {
  //   width: 70,
  //   height: 70,
  //   borderRadius: 35,
  //   borderWidth: 3,
  //   borderColor: 'rgba(255, 255, 255, 0.3)',
  // },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: 'white',
  },

  astrologerImageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -15,
    marginTop: 10,
  },

  auraRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FBBF24',
    shadowColor: '#FBBF24',
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },

  astrologerImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFF',
  },

  sunRing: {
  position: 'absolute',
  width: 82,
  height: 82,
  borderRadius: 41,
  borderWidth: 3,
  borderStyle: 'dashed',
  borderColor: '#F59E0B',
},


  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  waveContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  greeting: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: -10,
    marginTop: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  nameGradient: {
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: 'transparent',
    color: 'white',
  },
  subtitleContainer: {
    marginTop: 6,
  },
  cosmicSubtitle: {
    fontStyle: 'italic',
    fontSize: 14,
  },
  date: {
    marginTop: 10,
    fontSize: 13,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  statusCardGradientBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#10B981',
  },
  statusGlowBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orbContainer: {
    position: 'relative',
    marginRight: 14,
  },
  statusIndicatorGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    opacity: 0.25,
    top: -10,
    left: -10,
  },
  statusOrb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOrbOffline: {
    backgroundColor: '#6B7280',
  },
  statusOrbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  statusOrbInnerOffline: {
    backgroundColor: '#E5E7EB',
  },
  statusTextContainer: {
    justifyContent: 'center',
  },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goLiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  goLiveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  statusRight: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    maxWidth: '40%',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  typeBadgeText: {
    fontWeight: '600',
    fontSize: 11,
  },
});

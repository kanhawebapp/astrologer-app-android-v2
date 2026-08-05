import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import { MainTabParamList, RootStackParamList } from './types';
import { HomeDashboardScreen } from '../features/home/presentation/screens/HomeDashboardScreen';
import { SessionsScreen } from '../features/sessions/presentation/screens/SessionsScreen';
import { AvailabilityScreen } from '../features/availability/presentation/screens/AvailabilityScreen';
import { WalletScreen } from '../features/wallet/presentation/screens/WalletScreen';
import { AccountScreen } from '../features/account/presentation/screens/AccountScreen';
import { useTheme } from '../hooks/useTheme';
import { AppText } from '../components/common/AppText';
import { FloatingChatBubble } from '../components/common/FloatingChatBubble';
import { ChatRequestCard } from '../components/common/ChatRequestCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


type MainNavigatorNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabConfig {
  name: keyof MainTabParamList;
  component: React.ComponentType<any>;
  label: string;
  icon: string;
  activeIcon?: string;
}

// const TAB_CONFIGS: TabConfig[] = [
//   {
//     name: 'Home',
//     component: HomeDashboardScreen,
//     label: 'Home',
//     icon: 'home',
//     activeIcon: 'home',
//   },
//   {
//     name: 'Sessions',
//     component: SessionsScreen,
//     label: 'Sessions',
//     icon: 'chat-bubble-outline',
//     activeIcon: 'chat-bubble',
//   },
//   {
//     name: 'Availability',
//     component: AvailabilityScreen,
//     label: 'Availability',
//     icon: 'event-available',
//     activeIcon: 'event-available',
//   },
//   {
//     name: 'Wallet',
//     component: WalletScreen,
//     label: 'Wallet',
//     icon: 'account-balance-wallet',
//     activeIcon: 'account-balance-wallet',
//   },
//   {
//     name: 'Account',
//     component: AccountScreen,
//     label: 'Account',
//     icon: 'person-outline',
//     activeIcon: 'person',
//   },
// ];

const TAB_CONFIGS: TabConfig[] = [
  {
    name: 'Home',
    component: HomeDashboardScreen,
    label: 'Home',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    name: 'Sessions',
    component: SessionsScreen,
    label: 'Sessions',
    icon: 'message-text-outline',
    activeIcon: 'message-text',
  },
  {
    name: 'Availability',
    component: AvailabilityScreen,
    label: 'Availability',
    icon: 'calendar-check-outline',
    activeIcon: 'calendar-check',
  },
  {
    name: 'Wallet',
    component: WalletScreen,
    label: 'Wallet',
    icon: 'wallet-outline',
    activeIcon: 'wallet',
  },
  {
    name: 'Account',
    component: AccountScreen,
    label: 'Account',
    icon: 'account-outline',
    activeIcon: 'account',
  },
];


const TabBarIcon: React.FC<{
  icon: string;
  activeIcon?: string;
  focused: boolean;
  color: string;
}> = ({ icon, activeIcon, focused, color }) => (
  <Icon
    name={focused && activeIcon ? activeIcon : icon}
    size={24}
    color={color}
  />
);

const TabBarLabel: React.FC<{
  label: string;
  color: string;
  focused: boolean;
}> = ({ label, color, focused }) => (
  <AppText
    variant="caption"
    color={color}
    style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
    {label}
  </AppText>
);

const renderTabIcon =
  (icon: string, activeIcon?: string) =>
    ({ focused, color }: { focused: boolean; color: string }) =>
    (
      <TabBarIcon
        icon={icon}
        activeIcon={activeIcon}
        focused={focused}
        color={color}
      />
    );

const renderTabLabel =
  (label: string) =>
    ({ color, focused }: { color: string; focused: boolean }) =>
      <TabBarLabel label={label} color={color} focused={focused} />;

export const MainNavigator: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MainNavigatorNavigationProp>();
  const chat = useSelector((state: RootState) => state.chat as any);
  const activeSession = chat?.activeSession ?? null;
  const chatStatus = chat?.chatStatus ?? 'IDLE';

  const hasNavigatedRef = useRef(false);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const currentAstrologerId = authUser?.id;


  useEffect(() => {
    console.log('Current Astro:', currentAstrologerId);
    console.log('Session:', activeSession);

    if (
      activeSession &&
      chatStatus === 'ACTIVE' &&
      activeSession.astrologerId === currentAstrologerId &&
      !hasNavigatedRef.current
    ) {
      hasNavigatedRef.current = true;

      navigation.navigate('ChatScreen', {
        roomId: activeSession.roomId,
        userId: activeSession.userId,
        userName: activeSession.userName,
        maximumTime: activeSession.maximumTime,
      });
    } else if (!activeSession) {
      hasNavigatedRef.current = false;
    }
  }, [activeSession, chatStatus, currentAstrologerId, navigation]);

  const screenOptions = useCallback(
    () => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        height: 56 + insets.bottom,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        paddingTop: 6,
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textTertiary,
    }),
    [theme, insets.bottom],
  );

  return (
    <View style={styles.container}>
      <ChatRequestCard />
      <Tab.Navigator screenOptions={screenOptions}>
        {TAB_CONFIGS.map(tab => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.component}
            options={{
              tabBarIcon: renderTabIcon(tab.icon, tab.activeIcon),
              tabBarLabel: renderTabLabel(tab.label),
            }}
          />
        ))}
      </Tab.Navigator>
      <FloatingChatBubble />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    textAlign: 'center',
  },
  tabLabelFocused: {
    fontWeight: '600',
  },
});

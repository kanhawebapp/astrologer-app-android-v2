import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {Session} from '../features/sessions/domain/types';

export type RootStackParamList = {
  Splash: undefined;
  AuthStack: undefined;
  MainTabs: undefined;
  IncomingCallFullscreen: {
    roomId: string;
    callId?: string;
    callerId?: string;
    callerName?: string;
    callTime?: number;
  };
  ChatScreen: {
    chatId?: string;
    sessionId?: string;
    roomId?: string;
    userId?: string;
    userName?: string;
    maximumTime?: number;
  };
  CallScreen: {
    roomId: string;
    callId?: string;
    callerId: string;
    callerName: string;
  };
  EditProfile: undefined;
  ChatStack: {sessionId?: string};
  SessionDetailScreen: {
    sessionId: string;
    roomId?: string;
    session?: Session;
  };
};

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Sessions: undefined;
  Availability: undefined;
  Wallet: undefined;
  Account: undefined;
  ChatScreen: {chatId: string};
};

export type HomeStackParamList = {
  Dashboard: undefined;
};

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
export type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export type LoginScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList, 'Login'>,
  RootNavigationProp
>;

export type LoginScreenRouteProp = RouteProp<AuthStackParamList, 'Login'>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

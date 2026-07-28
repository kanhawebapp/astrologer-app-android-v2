import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { LoginScreen } from '../screens/Auth/Login/LoginScreen';
import { TermsOfService } from '../screens/Legal/TermsOfService';
import { PrivacyPolicy } from '../screens/Legal/PrivacyPolicy';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfService}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
};

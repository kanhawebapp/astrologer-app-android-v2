// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { RootStackParamList } from './types';
// import { AuthNavigator } from './AuthNavigator';
// import { MainNavigator } from './MainNavigator';
// import { SplashScreen } from '../screens/Splash/SplashScreen';
// import { ChatScreen } from '../features/chat/presentation/screens/ChatScreen';
// import { CallScreen } from '../features/call/presentation/screens/CallScreen';
// import { EditProfileScreen } from '../features/account/presentation/screens/EditProfile/EditProfileScreen';
// import { useAuth } from '../hooks/useAuth';

// const Stack = createNativeStackNavigator<RootStackParamList>();

// export const RootNavigator: React.FC = () => {
//   const { isAuthenticated } = useAuth();

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Splash" component={SplashScreen} />
//         {isAuthenticated ? (
//           <>
//             <Stack.Screen name="MainTabs" component={MainNavigator} />
//             <Stack.Screen
//               name="ChatScreen"
//               component={ChatScreen}
//               options={{
//                 presentation: 'card',
//               }}
//             />
//             <Stack.Screen
//               name="CallScreen"
//               component={CallScreen}
//               options={{
//                 presentation: 'card',
//               }}
//             />
//             <Stack.Screen
//               name="EditProfile"
//               component={EditProfileScreen}
//               options={{
//                 presentation: 'card',
//               }}
//             />
//           </>
//         ) : (
//           <Stack.Screen name="AuthStack" component={AuthNavigator} />
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };


import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { SplashScreen } from '../screens/Splash/SplashScreen';
import { ChatScreen } from '../features/chat/presentation/screens/ChatScreen';
import { CallScreen } from '../features/call/presentation/screens/CallScreen';
import { EditProfileScreen } from '../features/account/presentation/screens/EditProfile/EditProfileScreen';
import { AllReviewScreen } from '../features/account/presentation/screens/AllReviewScreen';
import { useAuth } from '../hooks/useAuth';
import OfferScreen from '../features/account/presentation/screens/OfferSecreen';
import SessionDetailScreen from '../features/sessions/presentation/screens/SessionDetailScreen';
import KundliScreen from '../features/sessions/screens/KundliScreen';
import AllFollowers from '../features/account/presentation/screens/AllFollowers';
import AnalytcsScreen from '../features/account/presentation/screens/AnalyticsScreen';
import NoticeScreen from '../features/account/presentation/screens/NoticeScreen';
import NotificationScreen from '../features/home/notification/NotificationScreen';
import MyRemedies from '../features/account/presentation/screens/MyRemedies';
import MyServices from '../features/account/presentation/screens/MyServices';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainNavigator} />
            <Stack.Screen
              name="ChatScreen"
              component={ChatScreen}
              options={{
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="CallScreen"
              component={CallScreen}
              options={{
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="AllReviewScreen"
              component={AllReviewScreen}
              options={{
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="AllFollowers"
              component={AllFollowers}
              options={{
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="AnalytcsScreen"
              component={AnalytcsScreen}

            />
            <Stack.Screen
              name="MyRemedies"
              component={MyRemedies}
            />

            <Stack.Screen
              name="MyServices"
              component={MyServices}
            />

            <Stack.Screen
              name="NotificationScreen"
              component={NotificationScreen}

            />
            <Stack.Screen
              name="NoticeScreen"
              component={NoticeScreen}

            />
            <Stack.Screen
              name="OfferScreen"
              component={OfferScreen}
              options={{
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="SessionDetailScreen"
              component={SessionDetailScreen}
              options={{
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="KundliScreen"
              component={KundliScreen}
              options={{
                presentation: 'card',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="AuthStack" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};


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
import {View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';
import {AuthNavigator} from './AuthNavigator';
import {MainNavigator} from './MainNavigator';
import {SplashScreen} from '../screens/Splash/SplashScreen';
import {ChatScreen} from '../features/chat/presentation/screens/ChatScreen';
import {CallScreen} from '../features/call/presentation/screens/CallScreen';
import {IncomingCallFullscreen} from '../features/call/presentation/screens/IncomingCallFullscreen';
import {EditProfileScreen} from '../features/account/presentation/screens/EditProfile/EditProfileScreen';
import {AllReviewScreen} from '../features/account/presentation/screens/AllReviewScreen';
import {useAuth} from '../hooks/useAuth';
import InternetProvider from '../components/NoInternet/InternetProvider';
import {navigationService} from '../services/navigation/navigationService';
import OfferScreen from '../features/account/presentation/screens/OfferSecreen';
import SessionDetailScreen from '../features/sessions/presentation/screens/SessionDetailScreen';
import SessionMessagesScreen from '../features/sessions/presentation/screens/SessionMessagesScreen';
import KundliScreen from '../features/sessions/screens/KundliScreen';
import AllFollowers from '../features/account/presentation/screens/AllFollowers';
import AnalytcsScreen from '../features/account/presentation/screens/AnalyticsScreen';
import AstrologerUpdatesScreen from '../features/home/notification/AstrologerUpdatesScreen';
import MyRemedies from '../features/account/presentation/screens/MyRemedies';
import MyServices from '../features/account/presentation/screens/MyServices';
import {ChatRequestCard} from '../components/common/ChatRequestCard';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const {isAuthenticated} = useAuth();

  return (
    <NavigationContainer
      ref={navigationService.navigationRef}
      onReady={() => navigationService.markNavigationReady()}>
      <View style={{flex: 1}}>
        <ChatRequestCard />
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen
            name="IncomingCallFullscreen"
            component={IncomingCallFullscreen}
            options={{
              presentation: 'fullScreenModal',
              animation: 'none',
            }}
          />
          {isAuthenticated ? (
            <>
              <Stack.Screen name="MainTabs" component={MainNavigator} />
              <Stack.Screen
                name="ChatScreen"
                options={{
                  presentation: 'card',
                }}>
                {() => (
                  <InternetProvider>
                    <ChatScreen />
                  </InternetProvider>
                )}
              </Stack.Screen>
              <Stack.Screen
                name="CallScreen"
                options={{
                  presentation: 'card',
                }}>
                {() => (
                  <InternetProvider>
                    <CallScreen />
                  </InternetProvider>
                )}
              </Stack.Screen>
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
              <Stack.Screen name="AnalytcsScreen" component={AnalytcsScreen} />
              <Stack.Screen name="MyRemedies" component={MyRemedies} />

              <Stack.Screen name="MyServices" component={MyServices} />

              <Stack.Screen
                name="AstrologerUpdatesScreen"
                component={AstrologerUpdatesScreen}
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
                name="SessionMessagesScreen"
                component={SessionMessagesScreen}
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
      </View>
    </NavigationContainer>
  );
};

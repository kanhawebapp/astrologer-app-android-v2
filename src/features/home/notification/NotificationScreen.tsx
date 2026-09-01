// import React, {useState} from 'react';
// import {
//   View,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
// } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import {useNavigation} from '@react-navigation/native';
// import { useTheme } from '../../../hooks';
// import { AppText } from '../../../components/common/AppText';
// import { Header } from '../../../components';



// const NotificationScreen = () => {
//   const navigation = useNavigation<any>();
//   const {theme} = useTheme();

//   const [notifications] = useState([
//     {
//       id: '1',
//       title: 'New Chat Request',
//       message:
//         'A user has started a new chat session with you.',
//       time: '2 min ago',
//       read: false,
//       icon: 'chatbubble-ellipses',
//       color: '#6366F1',
//     },
//     {
//       id: '2',
//       title: 'Payment Received',
//       message:
//         '₹500 has been credited to your wallet.',
//       time: '25 min ago',
//       read: false,
//       icon: 'wallet',
//       color: '#22C55E',
//     },
//     {
//       id: '3',
//       title: 'New Follower',
//       message:
//         'Rohit Sharma started following your profile.',
//       time: '1 hour ago',
//       read: true,
//       icon: 'people',
//       color: '#F59E0B',
//     },
//     {
//       id: '4',
//       title: 'Profile Approved',
//       message:
//         'Your profile verification has been approved.',
//       time: '3 hours ago',
//       read: true,
//       icon: 'checkmark-circle',
//       color: '#10B981',
//     },
//     {
//       id: '5',
//       title: 'Special Offer',
//       message:
//         'Boost your visibility with a featured astrologer badge.',
//       time: 'Yesterday',
//       read: true,
//       icon: 'gift',
//       color: '#EC4899',
//     },
//     {
//       id: '6',
//       title: 'Notice Board Update',
//       message:
//         'A new announcement has been posted by admin.',
//       time: '2 days ago',
//       read: true,
//       icon: 'megaphone',
//       color: '#3B82F6',
//     },
//   ]);

//   const renderItem = ({item}: any) => (
//     <TouchableOpacity
//       activeOpacity={0.85}
//       style={[
//         styles.card,
//         {
//           backgroundColor: theme.colors.card,
//           borderColor: item.read
//             ? theme.colors.border
//             : '#6366F120',
//         },
//       ]}>
//       <View
//         style={[
//           styles.iconContainer,
//           {
//             backgroundColor: item.color + '15',
//           },
//         ]}>
//         <Ionicons
//           name={item.icon}
//           size={22}
//           color={item.color}
//         />
//       </View>

//       <View style={styles.content}>
//         <View style={styles.topRow}>
//           <AppText style={styles.title}>
//             {item.title}
//           </AppText>

//           {!item.read && (
//             <View style={styles.unreadDot} />
//           )}
//         </View>

//         <AppText
//           color={theme.colors.textSecondary}
//           style={styles.message}>
//           {item.message}
//         </AppText>

//         <AppText
//           color={theme.colors.textSecondary}
//           style={styles.time}>
//           {item.time}
//         </AppText>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <View
//       style={[
//         styles.container,
//         {
//           backgroundColor:
//             theme.colors.background,
//         },
//       ]}>
//       <Header
//         title="Notifications"
//         showBack
//         onBackPress={() => navigation.goBack()}
//       />

//       <View style={styles.headerSection}>
//         <AppText style={styles.heading}>
//           Notifications
//         </AppText>

//         <AppText
//           color={theme.colors.textSecondary}>
//           Stay updated with your latest activity.
//         </AppText>
//       </View>

//       <FlatList
//         data={notifications}
//         keyExtractor={item => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{
//           paddingHorizontal: 16,
//           paddingBottom: 30,
//         }}
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   );
// };

// export default NotificationScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     marginTop:35
//   },

//   headerSection: {
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//   },

//   heading: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 4,
//   },

//   card: {
//     flexDirection: 'row',
//     padding: 16,
//     borderRadius: 20,
//     marginBottom: 12,
//     borderWidth: 1,

//     // shadowColor: '#000',
//     // shadowOpacity: 0.04,
//     // shadowRadius: 8,
//     // shadowOffset: {
//     //   width: 0,
//     //   height: 2,
//     // },

//     // elevation: 2,
//   },

//   iconContainer: {
//     width: 52,
//     height: 52,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   content: {
//     flex: 1,
//     marginLeft: 14,
//   },

//   topRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   title: {
//     flex: 1,
//     fontSize: 15,
//     fontWeight: '700',
//   },

//   unreadDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#6366F1',
//   },

//   message: {
//     marginTop: 4,
//     lineHeight: 20,
//     fontSize: 13,
//   },

//   time: {
//     marginTop: 8,
//     fontSize: 12,
//   },
// });

import React from 'react';
import {View, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../../hooks';
import {AppText} from '../../../components/common/AppText';
import {Header} from '../../../components';

const NotificationScreen = () => {
  const navigation = useNavigation<any>();
  const {theme} = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}>
      <Header
        title="Notifications"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.colors.surfaceSecondary,
            },
          ]}>
          <Ionicons
            name="notifications-outline"
            size={48}
            color={theme.colors.primary}
          />
        </View>

        <AppText
          style={[
            styles.title,
            {color: theme.colors.text},
          ]}>
          Coming Soon
        </AppText>

        <AppText
          color={theme.colors.textSecondary}
          style={styles.message}>
          Notifications will be available soon.
          {'\n'}
          Stay tuned for updates and important activity alerts.
        </AppText>
      </View>
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 35,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },

  message: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
// import React from 'react';
// import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { AppText } from '../../../../components/common/AppText';
// import { useTheme } from '../../../../hooks/useTheme';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../../../store';

// interface ChatHeaderProps {
//   userName: string;
//   userProfilePic?: string;
//   onBackPress?: () => void;
//   onEndChatPress?: () => void;
//   onCancelPress?: () => void;
//   showEndButton?: boolean;
//   showCancelButton?: boolean;
//   formattedTime?: string;
//   isTimeLow?: boolean;
//   isTimeCritical?: boolean;
//   progress?: number;
//   isActive?: boolean;
// }

// export const ChatHeader: React.FC<ChatHeaderProps> = ({
//   userName,
//   userProfilePic,
//   onBackPress,
//   onEndChatPress,
//   onCancelPress,
//   showEndButton = true,
//   showCancelButton = false,
//   // Timer props (optional - for single timer instance)
//   formattedTime = '00:00',
//   isTimeLow = false,
//   isTimeCritical = false,
//   progress = 100,
//   isActive = false,
// }) => {
//   const { theme } = useTheme();

//   const timerColor = isTimeCritical
//     ? theme.colors.error
//     : isTimeLow
//       ? theme.colors.warning
//       : theme.colors.success;

//   return (
//     <View
//       style={[
//         styles.container,
//         {
//           backgroundColor: theme.colors.surface,
//           borderBottomColor: theme.colors.border,
//           paddingTop: Platform.OS === 'ios' ? 50 : 30,
//         },
//       ]}>
//       <View style={styles.leftSection}>

//         <View style={styles.userInfo}>
//           <View
//             style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
//             <Icon name="person" size={20} color={theme.colors.white} />
//           </View>
//           <View style={styles.nameContainer}>
//             <AppText
//               // variant="h6"
//               color={theme.colors.text}
//               numberOfLines={1}
//               style={styles.userName}>
//               {userName}
//             </AppText>
//             {isActive && (
//               <View style={styles.timerContainer}>
//                 <Icon name="timer" size={14} color={timerColor} />
//                 <AppText
//                   variant="caption"
//                   color={timerColor}
//                   style={styles.timerText}>
//                   {formattedTime}
//                 </AppText>
//               </View>
//             )}
//           </View>
//         </View>
//       </View>

//       <View style={styles.rightSection}>
//         {isActive && (
//           <View
//             style={[
//               styles.progressBar,
//               { backgroundColor: theme.colors.border },
//             ]}>
//             <View
//               style={[
//                 styles.progressFill,
//                 {
//                   backgroundColor: timerColor,
//                   width: `${progress}%`,
//                 },
//               ]}
//             />
//           </View>
//         )}

//         {showCancelButton && onCancelPress && (
//           <TouchableOpacity
//             onPress={onCancelPress}
//             style={[styles.endButton, { backgroundColor: theme.colors.error }]}>
//             <AppText variant="button" color={theme.colors.white}>
//               End chat
//             </AppText>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 12,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//   },
//   leftSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   rightSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconButton: {
//     padding: 8,
//     marginRight: 4,
//   },
//   userInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   avatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   nameContainer: {
//     marginLeft: 10,
//     flex: 1,
//   },
//   userName: {
//     maxWidth: 120,
//   },
//   timerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   timerText: {
//     marginLeft: 4,
//   },
//   progressBar: {
//     width: 60,
//     height: 4,
//     borderRadius: 2,
//     overflow: 'hidden',
//     marginRight: 12,
//   },
//   progressFill: {
//     height: '100%',
//     borderRadius: 2,
//   },
//   endButton: {
//     paddingVertical: 6,
//     paddingHorizontal: 6,
//     borderRadius: 4,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });


import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';

interface ChatHeaderProps {
  userName: string;
  userProfilePic?: string;
  onBackPress?: () => void;
  onEndChatPress?: () => void;
  onCancelPress?: () => void;
  showEndButton?: boolean;
  showCancelButton?: boolean;
  formattedTime?: string;
  isTimeLow?: boolean;
  isTimeCritical?: boolean;
  progress?: number;
  isActive?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  userName,
  onCancelPress,
  showCancelButton = false,
  formattedTime = '00:00',
  isTimeLow = false,
  isTimeCritical = false,
  progress = 100,
  isActive = false,
}) => {
  const { theme } = useTheme();

  const avatarLetter =
    userName?.trim()?.charAt(0)?.toUpperCase() || '?';

  const timerColor = isTimeCritical
    ? theme.colors.error
    : isTimeLow
      ? theme.colors.warning
      : theme.colors.success;


  const displayTime = React.useMemo(() => {
    const parts = formattedTime.split(':');

    // Already HH:MM:SS
    if (parts.length === 3) {
      return formattedTime;
    }

    // MM:SS -> HH:MM:SS
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);

      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      return `${String(hours).padStart(2, '0')}:${String(
        remainingMinutes,
      ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return formattedTime;
  }, [formattedTime]);

  return (
    <View
      style={[
        styles.container,
        {
          // backgroundColor: theme.colors.surface,
          // borderBottomColor: theme.colors.border,
          paddingTop: Platform.OS === 'ios' ? 52 : 14,
        },
      ]}>

      <View style={styles.headerRow}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}>
          <AppText style={styles.avatarText} color="#fff">
            {avatarLetter}
          </AppText>
        </View>

        <View style={styles.content}>
          {/* Name */}
          <AppText
            numberOfLines={1}
            style={[
              styles.userName,
              {
                color: theme.colors.text,
              },
            ]}>
            {userName}
          </AppText>

          {/* Timer + End Button */}
          <View style={styles.secondRow}>
            {isActive ? (
              <View style={styles.timerContainer}>
                <Icon
                  name="schedule"
                  size={16}
                  color={timerColor}
                />

                <AppText
                  style={[
                    styles.timerText,
                    {
                      color: timerColor,
                    },
                  ]}>
                  {displayTime}
                  {/* {formattedTime} */}
                </AppText>
              </View>
            ) : (
              <View />
            )}

            {showCancelButton && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onCancelPress}
                style={[
                  styles.endButton,
                  {
                    backgroundColor: theme.colors.error,
                  },
                ]}>
                <Icon
                  name="call-end"
                  color="#FFF"
                  size={16}
                />

                <AppText
                  style={styles.endText}
                  color="#FFF">
                  End Chat
                </AppText>
              </TouchableOpacity>
            )}
          </View>


        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',

    elevation: 0.5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 22,
    fontWeight: '700',
  },

  content: {
    flex: 1,
    marginLeft: 14,
  },

  userName: {
    fontSize: 18,
    fontWeight: '700',
  },

  secondRow: {
    // marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timerText: {
    marginLeft: 5,
    fontSize: 15,
    fontWeight: '600',
  },

  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
  },

  endText: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '700',
  },

  progressBar: {
    marginTop: 12,
    width: '100%',
    height: 5,
    borderRadius: 5,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
});

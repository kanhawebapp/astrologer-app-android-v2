// import React from 'react';
// import { View, StyleSheet, Switch, TouchableOpacity } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { AppText } from '../../../../components/common/AppText';
// import { useTheme } from '../../../../hooks/useTheme';
// import { Availability } from '../../domain/types';

// interface StatusToggleCardProps {
//   availability: Availability;
//   onToggle: (key: keyof Availability, value: boolean) => void;
//   loading?: boolean;
// }


// export const StatusToggleCard: React.FC<StatusToggleCardProps> = ({
//   availability,
//   onToggle,
//   loading = false,
// }) => {
//   const { theme } = useTheme();
//   console.log("availability here",availability)

//   const renderToggleRow = (
//     label: string,
//     key: keyof Availability,
//     value: boolean,
//     color: string,
//     icon: string,
//     description?: string,
//   ) => (
//     <TouchableOpacity
//       style={styles.toggleRow}
//       onPress={() => onToggle(key, !value)}
//       activeOpacity={0.7}
//       disabled={loading}>
//       <View style={styles.toggleLabelContainer}>
//         <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
//           <Icon name={icon} size={20} color={color} />
//         </View>
//         <View style={styles.labelContainer}>
//           <AppText variant="body1" color={theme.colors.text}>
//             {label}
//           </AppText>
//           {description && (
//             <AppText variant="caption" color={theme.colors.textTertiary}>
//               {description}
//             </AppText>
//           )}
//         </View>
//       </View>
//       <Switch
//         value={value}
//         onValueChange={newValue => onToggle(key, newValue)}
//         disabled={loading}
//         trackColor={{ false: theme.colors.border, true: color + '80' }}
//         thumbColor={value ? color : theme.colors.textTertiary}
//         ios_backgroundColor={theme.colors.border}
//       />
//     </TouchableOpacity>
//   );

//   return (
//     <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
//       <View style={styles.header}>
//         <AppText variant="h5" color={theme.colors.text}>
//           Availability Control
//         </AppText>
//         <View
//           style={[
//             styles.statusBadge,
//             {
//               backgroundColor: availability.isOnline
//                 ? theme.colors.successLight
//                 : theme.colors.surfaceSecondary,
//             },
//           ]}>
//           <View
//             style={[
//               styles.statusDot,
//               {
//                 backgroundColor: availability.isOnline
//                   ? theme.colors.success
//                   : theme.colors.textTertiary,
//               },
//             ]}
//           />
//           <AppText
//             variant="caption"
//             color={
//               availability.isOnline ? theme.colors.success : theme.colors.text
//             }>
//             {availability.isOnline ? 'Online' : 'Offline'}
//           </AppText>
//         </View>
//       </View>

//       <View
//         style={[styles.divider, { backgroundColor: theme.colors.border }]}
//       />

//       {/* {renderToggleRow(
//         'Master Toggle',
//         'isOnline',
//         availability.isOnline,
//         theme.colors.success,
//         'wifi',
//         'Enable/disable all sessions',
//       )} */}

//       <View
//         style={[styles.rowDivider, { backgroundColor: theme.colors.border }]}
//       />

//       {renderToggleRow(
//         'Chat Sessions',
//         'chatEnabled',
//         availability.chatEnabled,
//         theme.colors.accentPurple,
//         'chatbubble-ellipses',
//         'Accept chat consultations',
//       )}

//       <View
//         style={[styles.rowDivider, { backgroundColor: theme.colors.border }]}
//       />

//       {renderToggleRow(
//         'Call Sessions',
//         'callEnabled',
//         availability.callEnabled,
//         theme.colors.info,
//         'call',
//         'Accept voice/video calls',
//       )}

//       <View
//         style={[styles.rowDivider, { backgroundColor: theme.colors.border }]}
//       />

//       {/* {renderToggleRow(
//         'Busy Mode',
//         'isBusy',
//         availability.isBusy,
//         theme.colors.warning,
//         'alert-circle',
//         'Block new sessions temporarily',
//       )} */}

//       <View
//         style={[styles.rowDivider, { backgroundColor: theme.colors.border }]}
//       />


//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     borderRadius: 16,
//     marginHorizontal: 16,
//     marginTop: 12,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginRight: 4,
//   },
//   divider: {
//     height: 1,
//     marginBottom: 12,
//   },
//   toggleRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//   },
//   toggleLabelContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   iconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   labelContainer: {
//     flex: 1,
//   },
//   rowDivider: {
//     height: 1,
//     marginLeft: 52,
//   },
// });


import React from 'react';
import {
  View,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';

type ServiceType =
  | 'CHAT'
  | 'CALL'
  | 'LIVE'
  | 'PROMOTIONAL';

interface AstrologerServices {
  isChatActive: boolean;
  isCallActive: boolean;
  isLiveActive: boolean;
  isPromotional: boolean;
}

interface StatusToggleCardProps {
  availability: AstrologerServices;
  onToggle: (
    serviceType: ServiceType,
    value: boolean,
  ) => void;
  loading?: boolean;
}

export const StatusToggleCard: React.FC<
  StatusToggleCardProps
> = ({
  availability,
  onToggle,
  loading = false,
}) => {
    const { theme } = useTheme();

    const isOnline =
      availability?.isChatActive ||
      availability?.isCallActive ||
      availability?.isLiveActive;

    const renderToggleRow = (
      label: string,
      serviceType: ServiceType,
      value: boolean,
      color: string,
      icon: string,
      description?: string,
    ) => (
      <TouchableOpacity
        style={styles.toggleRow}
        activeOpacity={0.7}
        disabled={loading}
        onPress={() =>
          onToggle(serviceType, !value)
        }>
        <View
          style={
            styles.toggleLabelContainer
          }>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: theme.colors.primary + 20,
                // backgroundColor:color + '20',
              },
            ]}>
            <Icon
              name={icon}
              size={20}
              color={theme.colors.primary}
            />
          </View>

          <View
            style={styles.labelContainer}>
            <AppText
              variant="body1"
              color={theme.colors.text}>
              {label}
            </AppText>

            {description && (
              <AppText
                variant="caption"
                color={
                  theme.colors
                    .textTertiary
                }>
                {description}
              </AppText>
            )}
          </View>
        </View>

        <Switch
          value={value}
          disabled={loading}
          onValueChange={newValue =>
            onToggle(
              serviceType,
              newValue,
            )
          }
          trackColor={{
            false:
              theme.colors.border,
            true: theme.colors.primary,
          }}
          thumbColor={
            value
              ? theme.colors.secondary
              : theme.colors
                .textTertiary
          }
          ios_backgroundColor={
            theme.colors.border
          }
        />
      </TouchableOpacity>
    );

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              theme.colors.surface,
          },
        ]}>
        <View style={styles.header}>
          <AppText
            variant="h5"
            color={theme.colors.text}>
            Availability Control
          </AppText>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  isOnline
                    ? theme.colors
                      .successLight
                    : theme.colors
                      .surfaceSecondary,
              },
            ]}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    isOnline
                      ? theme.colors
                        .success
                      : theme.colors
                        .textTertiary,
                },
              ]}
            />

            <AppText
              variant="caption"
              color={
                isOnline
                  ? theme.colors
                    .success
                  : theme.colors
                    .text
              }>
              {isOnline
                ? 'Online'
                : 'Offline'}
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                theme.colors.border,
            },
          ]}
        />

        {renderToggleRow(
          'Chat',
          'CHAT',
          availability?.isChatActive ??
          false,
          theme.colors
            .accentPurple,
          'chatbubble-ellipses',
          'Accept chat consultations',
        )}

        <View
          style={[
            styles.rowDivider,
            {
              backgroundColor:
                theme.colors.border,
            },
          ]}
        />

        {renderToggleRow(
          'Call',
          'CALL',
          availability?.isCallActive ??
          false,
          theme.colors.info,
          'call',
          'Accept call consultations',
        )}

        <View
          style={[
            styles.rowDivider,
            {
              backgroundColor:
                theme.colors.border,
            },
          ]}
        />

        {/* {renderToggleRow(
          'Live',
          'LIVE',
          availability?.isLiveActive ??
          false,
          theme.colors.success,
          'videocam',
          'Accept live consultations',
        )}

        <View
          style={[
            styles.rowDivider,
            {
              backgroundColor:
                theme.colors.border,
            },
          ]}
        />

        {renderToggleRow(
          'Promotional Service',
          'PROMOTIONAL',
          availability?.isPromotional ??
          false,
          theme.colors.warning,
          'megaphone',
          'Promotional visibility',
        )} */}
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  header: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },

  divider: {
    height: 1,
    marginBottom: 12,
  },

  toggleRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },

  toggleLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  labelContainer: {
    flex: 1,
  },

  rowDivider: {
    height: 1,
    marginLeft: 52,
  },
});


// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   StyleSheet,
//   Modal,
//   TouchableOpacity,
//   Animated,
//   Dimensions,
//   ActivityIndicator,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { AppText } from '../../../../components/common/AppText';
// import { AppButton } from '../../../../components/common/AppButton';
// import { useTheme } from '../../../../hooks/useTheme';
// import type { ChatRequest } from '../../domain/chatTypes';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// interface ChatRequestModalProps {
//   visible: boolean;
//   request: ChatRequest | null;
//   onAccept: (sessionId: string) => void;
//   onReject: (sessionId: string) => void;
//   autoDismissTime?: number;
// }

// export const ChatRequestModal: React.FC<ChatRequestModalProps> = ({
//   visible,
//   request,
//   onAccept,
//   onReject,
//   autoDismissTime = 30000,
// }) => {
//   const { theme } = useTheme();
//   const slideAnim = useRef(new Animated.Value(0)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const [countdown, setCountdown] = React.useState(autoDismissTime / 1000);
//   const [accepting, setAccepting] = React.useState(false);

//   console.log('ChatRequestModal rendered with request:', request);

//   useEffect(() => {
//     if (visible && request) {
//       setCountdown(autoDismissTime / 1000);

//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//         Animated.spring(slideAnim, {
//           toValue: 1,
//           friction: 8,
//           tension: 65,
//           useNativeDriver: true,
//         }),
//       ]).start();

//       countdownRef.current = setInterval(() => {
//         setCountdown(prev => {
//           if (prev <= 1) {
//             if (countdownRef.current) {
//               clearInterval(countdownRef.current);
//             }
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     } else {
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 0,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//         Animated.timing(slideAnim, {
//           toValue: 0,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     }

//     return () => {
//       if (countdownRef.current) {
//         clearInterval(countdownRef.current);
//       }
//     };
//   }, [visible, request]);

//   const handleAccept = async () => {
//     if (!request || accepting) return;
//     setAccepting(true);
//     try {
//       await onAccept(request.sessionId);
//     } catch (error) {
//       console.log('Error accepting chat:', error);
//     } finally {
//       setAccepting(false);
//     }
//   };

//   if (!request) return null;

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       statusBarTranslucent
//       animationType="fade">
//       <Animated.View
//         style={[
//           styles.overlay,
//           { backgroundColor: theme.colors.overlay, opacity: fadeAnim },
//         ]}>
//         <Animated.View
//           style={[
//             styles.modalContainer,
//             {
//               backgroundColor: theme.colors.surface,
//               transform: [
//                 {
//                   translateY: slideAnim.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: [100, 0],
//                   }),
//                 },
//               ],
//             },
//           ]}>
//           <View
//             style={[styles.header, { backgroundColor: theme.colors.primary }]}>
//             <Icon name="chat" size={24} color={theme.colors.white} />
//             <AppText
//               variant="h6"
//               color={theme.colors.white}
//               style={styles.headerText}>
//               New Chat Request
//             </AppText>
//           </View>

//           <View style={styles.content}>
//             <View style={styles.userInfo}>
//               <View
//                 style={[
//                   styles.avatar,
//                   { backgroundColor: theme.colors.primaryLight },
//                 ]}>
//                 <Icon name="person" size={32} color={theme.colors.white} />
//               </View>
//               <AppText variant="h6" color={theme.colors.text}>
//                 {request.userName}
//               </AppText>
//             </View>

//             <View style={styles.detailsContainer}>
//               <View style={styles.detailRow}>
//                 <Icon
//                   name="schedule"
//                   size={20}
//                   color={theme.colors.textSecondary}
//                 />
//                 <AppText
//                   variant="body2"
//                   color={theme.colors.textSecondary}
//                   style={styles.detailText}>
//                   {Math.floor(request.maximumTime / 60)} min chat
//                 </AppText>
//               </View>

//               <View style={styles.detailRow}>
//                 <Icon
//                   name="attach-money"
//                   size={20}
//                   color={theme.colors.textSecondary}
//                 />
//                 <AppText
//                   variant="body2"
//                   color={theme.colors.textSecondary}
//                   style={styles.detailText}>
//                   ₹{request.pricePerMinute}/min
//                 </AppText>
//               </View>

//               {request.issue && (
//                 <View style={styles.issueContainer}>
//                   <AppText
//                     variant="caption"
//                     color={theme.colors.textTertiary}
//                     style={styles.issueLabel}>
//                     User Issue:
//                   </AppText>
//                   <AppText
//                     variant="body2"
//                     color={theme.colors.text}
//                     style={styles.issueText}>
//                     {request.issue}
//                   </AppText>
//                 </View>
//               )}
//             </View>

//             <View style={styles.countdownContainer}>
//               <AppText variant="caption" color={theme.colors.error}>
//                 Auto-dismiss in {countdown}s
//               </AppText>
//             </View>
//           </View>

//           <View style={styles.buttonContainer}>
//             <TouchableOpacity
//               style={[
//                 styles.rejectButton,
//                 { backgroundColor: theme.colors.errorLight },
//               ]}
//               onPress={() => onReject(request.sessionId)}>
//               <Icon name="close" size={24} color={theme.colors.error} />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.acceptButton,
//                 {
//                   backgroundColor: accepting
//                     ? theme.colors.textTertiary
//                     : theme.colors.success,
//                 },
//               ]}
//               onPress={handleAccept}
//               disabled={accepting}>
//               {accepting ? (
//                 <ActivityIndicator color={theme.colors.white} />
//               ) : (
//                 <>
//                   <Icon name="call" size={24} color={theme.colors.white} />
//                   <AppText
//                     variant="body1"
//                     color={theme.colors.white}
//                     style={styles.acceptText}>
//                     Accept
//                   </AppText>
//                 </>
//               )}
//             </TouchableOpacity>
//           </View>
//         </Animated.View>
//       </Animated.View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: SCREEN_WIDTH - 48,
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//   },
//   headerText: {
//     marginLeft: 8,
//   },
//   content: {
//     padding: 20,
//   },
//   userInfo: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   avatar: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 12,
//   },
//   detailsContainer: {
//     marginBottom: 16,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 6,
//   },
//   detailText: {
//     marginLeft: 8,
//   },
//   issueContainer: {
//     marginTop: 12,
//     padding: 12,
//     backgroundColor: 'rgba(0,0,0,0.03)',
//     borderRadius: 8,
//   },
//   issueLabel: {
//     marginBottom: 4,
//   },
//   issueText: {
//     lineHeight: 20,
//   },
//   countdownContainer: {
//     alignItems: 'center',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     padding: 16,
//     paddingTop: 0,
//   },
//   rejectButton: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 16,
//   },
//   acceptButton: {
//     flex: 1,
//     height: 56,
//     borderRadius: 28,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   acceptText: {
//     marginLeft: 8,
//     fontWeight: '600',
//   },
// });

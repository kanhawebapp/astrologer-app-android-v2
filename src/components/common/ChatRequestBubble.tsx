// import React, { useCallback, useState } from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   Animated,
// } from 'react-native';
// import { useSelector, useDispatch } from 'react-redux';
// import { RootState, AppDispatch } from '../../store';
// import { removeChatRequest } from '../../store/slices/chatSlice';
// import { chatSocketService } from '../../features/chat/data/chatSocketService';
// import { useTheme } from '../../hooks/useTheme';
// import { ChatRequest } from '../../features/chat/domain/chatTypes';

// const DEBUG_PREFIX = '[ChatRequestBubble]';

// interface ChatRequestBubbleProps {
//   onChatStarted?: (data: {
//     roomId: string;
//     userId: string;
//     userName: string;
//     maximumTime: number;
//   }) => void;
// }

// export const ChatRequestBubble: React.FC<ChatRequestBubbleProps> = ({
//   onChatStarted,
// }) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { theme } = useTheme();
//   const [accepting, setAccepting] = useState(false);
//   const [slideAnim] = useState(new Animated.Value(-100));

//   const { chatRequests, chatStatus } = useSelector(
//     (state: RootState) => state.chat,
//   );

//   const latestRequest: ChatRequest | null =
//     chatRequests.length > 0 ? chatRequests[0] : null;

//   React.useEffect(() => {
//     if (latestRequest) {
//       Animated.spring(slideAnim, {
//         toValue: 0,
//         useNativeDriver: true,
//         tension: 50,
//         friction: 8,
//       }).start();
//     } else {
//       Animated.timing(slideAnim, {
//         toValue: -150,
//         duration: 200,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [latestRequest, slideAnim]);

//   React.useEffect(() => {
//     const handleChatStarted = (data: {
//       sessionId: string;
//       roomId: string;
//       userId: string;
//       userName: string;
//       maximumTime: number;
//     }) => {
//       console.log(`📥 ${DEBUG_PREFIX} Received: "chat_started_astrologer"`);
//       console.log(`   Room ID: ${data.roomId}`);
//       console.log(`   User: ${data.userName}`);
//       setAccepting(false);
//       onChatStarted?.({
//         roomId: data.roomId,
//         userId: data.userId,
//         userName: data.userName,
//         maximumTime: data.maximumTime,
//       });
//     };

//     const callbacks = {
//       onChatStarted: handleChatStarted as any,
//     };
//     chatSocketService.addCallbacks(callbacks);
//     console.log(`${DEBUG_PREFIX}: Socket callbacks added`);

//     return () => {
//       chatSocketService.removeCallbacks(callbacks);
//       console.log(`${DEBUG_PREFIX}: Socket callbacks removed`);
//     };
//   }, [onChatStarted]);

//   const handleBubblePress = useCallback(async () => {
//     if (!latestRequest || accepting) {
//       console.log(
//         `${DEBUG_PREFIX} Bubble click ignored - no request or already accepting`,
//       );
//       return;
//     }

//     console.log(`👆 ${DEBUG_PREFIX} Bubble clicked`);
//     console.log(`   Request sessionId: ${latestRequest.sessionId}`);
//     console.log(`   Request roomId: ${latestRequest.roomId}`);
//     console.log(`   Request userName: ${latestRequest.userName}`);

//     setAccepting(true);

//     try {
//       console.log(`📤 ${DEBUG_PREFIX} EMIT: "chat_accepted_astrologer"`);
//       await chatSocketService.acceptChatAstrologer(latestRequest.sessionId);
//       console.log(
//         `${DEBUG_PREFIX} Emitted accept, waiting for chat_started...`,
//       );
//     } catch (error) {
//       console.log(`${DEBUG_PREFIX} Error emitting accept:`, error);
//       setAccepting(false);
//       dispatch(removeChatRequest(latestRequest.sessionId));
//     }
//   }, [latestRequest, accepting, dispatch]);

//   const handleReject = useCallback(async () => {
//     if (!latestRequest) return;

//     console.log(`👆 ${DEBUG_PREFIX} Reject clicked`);
//     console.log(`   Request sessionId: ${latestRequest.sessionId}`);

//     try {
//       await chatSocketService.rejectChat(latestRequest.sessionId);
//       dispatch(removeChatRequest(latestRequest.sessionId));
//     } catch (error) {
//       console.log(`${DEBUG_PREFIX} Error rejecting chat:`, error);
//       dispatch(removeChatRequest(latestRequest.sessionId));
//     }
//   }, [latestRequest, dispatch]);

//   if (!latestRequest) {
//     console.log(`${DEBUG_PREFIX} Render: No request, returning null`);
//     return null;
//   }

//   console.log(
//     `${DEBUG_PREFIX} Render: Showing request for ${latestRequest.userName}`,
//   );

//   if (chatStatus === 'ACTIVE') {
//     console.log(`${DEBUG_PREFIX} Render: Chat is active, hiding bubble`);
//     return null;
//   }

//   return (
//     <Animated.View
//       style={[
//         styles.container,
//         {
//           backgroundColor: theme.colors.surface,
//           borderColor: theme.colors.primary,
//           transform: [{ translateY: slideAnim }],
//         },
//       ]}>
//       <TouchableOpacity
//         style={styles.content}
//         onPress={handleBubblePress}
//         activeOpacity={0.8}>
//         <View style={styles.avatarContainer}>
//           <View
//             style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
//             <Text style={[styles.avatarText, { color: theme.colors.white }]}>
//               {latestRequest.userName.charAt(0).toUpperCase()}
//             </Text>
//           </View>
//         </View>
//         <View style={styles.textContainer}>
//           <Text
//             style={[styles.userName, { color: theme.colors.textPrimary }]}
//             numberOfLines={1}>
//             {latestRequest.userName}
//           </Text>
//           <Text
//             style={[styles.requestText, { color: theme.colors.textSecondary }]}
//             numberOfLines={1}>
//             New Chat Request
//           </Text>
//         </View>
//         {accepting ? (
//           <View
//             style={[
//               styles.acceptingBadge,
//               { backgroundColor: theme.colors.primary },
//             ]}>
//             <Text style={styles.acceptingText}>Waiting...</Text>
//           </View>
//         ) : (
//           <View style={styles.iconContainer}>
//             <Text style={[styles.chatIcon]}>💬</Text>
//           </View>
//         )}
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
//         <Text style={[styles.rejectText, { color: theme.colors.error }]}>
//           ✕
//         </Text>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     position: 'absolute',
//     top: 50,
//     left: 16,
//     right: 16,
//     borderRadius: 12,
//     borderWidth: 2,
//     elevation: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     zIndex: 999,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   content: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//   },
//   avatarContainer: {
//     marginRight: 12,
//   },
//   avatar: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   avatarText: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   textContainer: {
//     flex: 1,
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   requestText: {
//     fontSize: 13,
//   },
//   iconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#6C63FF',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   chatIcon: {
//     fontSize: 18,
//   },
//   acceptingBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   acceptingText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   rejectButton: {
//     padding: 12,
//     paddingLeft: 8,
//   },
//   rejectText: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

// export default ChatRequestBubble;

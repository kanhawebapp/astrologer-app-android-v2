// import React, { useState } from 'react';
// import {
//   View,
//   StyleSheet,
//   Modal,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
// } from 'react-native';
// import { useTheme } from '../../../../hooks/useTheme';
// import { AppText } from '../../../../components/common/AppText';
// import { AppButton } from '../../../../components/common/AppButton';

// interface SendRemedyModalProps {
//   visible: boolean;
//   onClose: () => void;
//   onSend: (title: string, description: string, isPaid: boolean) => void;
// }

// const remedySuggestions = [
//   {
//     title: 'Chant Om Gam Ganapataye',
//     description: 'Chant this mantra 108 times daily for 21 days',
//   },
//   {
//     title: 'Donate to charity on Thursday',
//     description: 'Donate 11 bananas to a needy person',
//   },
//   {
//     title: 'Light a mustard oil lamp',
//     description: 'Light a ghee lamp in front of Ganesha idol for 7 days',
//   },
//   {
//     title: 'Recite Hare Krishna mantra',
//     description: 'Chant Hare Krishna mantra 108 times every morning',
//   },
//   {
//     title: 'Worship Lord Shiva',
//     description: 'Visit a Shiva temple on Monday and offer milk',
//   },
// ];

// export const SendRemedyModal: React.FC<SendRemedyModalProps> = ({
//   visible,
//   onClose,
//   onSend,
// }) => {
//   const { theme } = useTheme();
//   const colors = theme.colors;
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [isPaid, setIsPaid] = useState(false);
//   const [price, setPrice] = useState('101');

//   const handleSend = () => {
//     if (title.trim() && description.trim()) {
//       onSend(title.trim(), description.trim(), isPaid);
//       setTitle('');
//       setDescription('');
//       setIsPaid(false);
//       setPrice('101');
//     }
//   };

//   const selectSuggestion = (suggestion: {
//     title: string;
//     description: string;
//   }) => {
//     setTitle(suggestion.title);
//     setDescription(suggestion.description);
//   };

//   const canSend = title.trim().length > 0 && description.trim().length > 0;

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent
//       onRequestClose={onClose}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.container}>
//         <View style={[styles.overlay, { backgroundColor: colors.overlay }]} />
//         <View style={[styles.content, { backgroundColor: colors.surface }]}>
//           <View style={styles.header}>
//             <AppText variant="h5" style={{ color: colors.text }}>
//               Send Remedy
//             </AppText>
//             <TouchableOpacity onPress={onClose}>
//               <AppText style={{ color: colors.textSecondary }}>✕</AppText>
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={styles.suggestions}>
//             <AppText
//               variant="caption"
//               style={{ color: colors.textSecondary, marginBottom: 8 }}>
//               Quick Suggestions:
//             </AppText>
//             {remedySuggestions.map((suggestion, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={[styles.suggestionItem, { borderColor: colors.border }]}
//                 onPress={() => selectSuggestion(suggestion)}>
//                 <AppText variant="caption" style={{ color: colors.text }}>
//                   {suggestion.title}
//                 </AppText>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>

//           <View style={styles.inputContainer}>
//             <AppText variant="caption" style={{ color: colors.textSecondary }}>
//               Title
//             </AppText>
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   backgroundColor: colors.backgroundSecondary,
//                   color: colors.text,
//                   borderColor: colors.border,
//                 },
//               ]}
//               value={title}
//               onChangeText={setTitle}
//               placeholder="Enter remedy title..."
//               placeholderTextColor={colors.textTertiary}
//             />
//           </View>

//           <View style={styles.inputContainer}>
//             <AppText variant="caption" style={{ color: colors.textSecondary }}>
//               Description
//             </AppText>
//             <TextInput
//               style={[
//                 styles.input,
//                 styles.textArea,
//                 {
//                   backgroundColor: colors.backgroundSecondary,
//                   color: colors.text,
//                   borderColor: colors.border,
//                 },
//               ]}
//               value={description}
//               onChangeText={setDescription}
//               placeholder="Enter remedy instructions..."
//               placeholderTextColor={colors.textTertiary}
//               multiline
//               numberOfLines={3}
//             />
//           </View>

//           <TouchableOpacity
//             style={[styles.paidToggle, { borderColor: colors.border }]}
//             onPress={() => setIsPaid(!isPaid)}>
//             <View
//               style={[
//                 styles.checkbox,
//                 { borderColor: colors.accentGold },
//                 isPaid && { backgroundColor: colors.accentGold },
//               ]}>
//               {isPaid && (
//                 <AppText style={{ color: colors.white, fontSize: 12 }}>
//                   ✓
//                 </AppText>
//               )}
//             </View>
//             <View>
//               <AppText variant="caption" style={{ color: colors.text }}>
//                 Make this a Paid Remedy
//               </AppText>
//               {isPaid && (
//                 <TextInput
//                   style={[
//                     styles.priceInput,
//                     {
//                       backgroundColor: colors.backgroundSecondary,
//                       color: colors.text,
//                       borderColor: colors.border,
//                     },
//                   ]}
//                   value={price}
//                   onChangeText={setPrice}
//                   keyboardType="numeric"
//                   placeholder="Price in coins"
//                   placeholderTextColor={colors.textTertiary}
//                 />
//               )}
//             </View>
//           </TouchableOpacity>

//           <View style={styles.actions}>
//             <AppButton
//               title="Cancel"
//               variant="outline"
//               onPress={onClose}
//               style={{ flex: 1, marginRight: 8 }}
//             />
//             <AppButton
//               title="Send to Chat"
//               onPress={handleSend}
//               disabled={!canSend}
//               style={{ flex: 1 }}
//             />
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'flex-end',
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   content: {
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 20,
//     maxHeight: '80%',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   suggestions: {
//     maxHeight: 120,
//     marginBottom: 16,
//   },
//   suggestionItem: {
//     padding: 10,
//     borderWidth: 1,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   inputContainer: {
//     marginBottom: 16,
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 12,
//     marginTop: 4,
//   },
//   textArea: {
//     height: 80,
//     textAlignVertical: 'top',
//   },
//   paidToggle: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//   },
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderWidth: 2,
//     borderRadius: 4,
//     marginRight: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   priceInput: {
//     borderWidth: 1,
//     borderRadius: 4,
//     padding: 4,
//     marginTop: 4,
//     width: 100,
//   },
//   actions: {
//     flexDirection: 'row',
//   },
// });

// export default SendRemedyModal;

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../../hooks/useTheme';
import { AppText } from '../../../../components/common/AppText';
import { AppButton } from '../../../../components/common/AppButton';
import { Session } from '../../domain/types';
import { SessionRemedy } from '../../domain/types';
import { useRemedyManager } from '../remedies/useRemedyManager';

interface SendRemedyModalProps {
  visible: boolean;
  session: Session | null;
  existingRemedies: SessionRemedy[];
  onClose: () => void;
  onSend: (
    sessionId: string,
    title: string,
    description: string,
    type: 'FREE' | 'PAID',
    price?: number,
  ) => void;
}

export const SendRemedyModal: React.FC<SendRemedyModalProps> = ({
  visible,
  session,
  existingRemedies,
  onClose,
  onSend,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [remedyType, setRemedyType] = useState<'FREE' | 'PAID'>('FREE');
  const [price, setPrice] = useState('101');


  const resetForm = () => {
    setTitle('');
    setDescription('');
    setRemedyType('FREE');
    setPrice('101');
  };

  const selectSuggestion = (suggestion: {
    title: string;
    description: string;
  }) => {
    setTitle(suggestion.title);
    setDescription(suggestion.description);
  };


  const {
    remedies,
    fetchRemedies,
    // fetchSessionRemedies,
    sendRemedy,
  } = useRemedyManager();
  // console.log("session idddd", session?.id);

  //   const handleSend = async () => {
  //     if (!session) {
  //       return;
  //     }

  //     try {
  //       const remedyText = `
  // Title: ${title.trim()}
  // console.log("session idddd and text", session?.id, remedyText);

  // Description:
  // ${description.trim()}
  //     `.trim();

  //       const result = await sendRemedy({
  //         sessionId: session.id,
  //         remedyText,
  //       });

  //       console.log('remedy sent result', result);

  //       resetForm();
  //       onClose();

  //       fetchSessionRemedies(session.id);
  //     } catch (error) {
  //       console.log(
  //         'send remedy failed',
  //         error,
  //       );
  //     }
  //   };

  const handleSend = async () => {
    if (!session) {
      return;
    }

    try {
      const remedyText = `
Title: ${title.trim()}

Description:
${description.trim()}
    `.trim();

      console.log('session idddd and text', session?.id, remedyText);

      const result = await sendRemedy({
        sessionId: session.id,
        remedyText,
      });

      console.log('remedy sent result', result);

      resetForm();
      onClose();

      fetchSessionRemedies(session.id);
    } catch (error) {
      console.log('send remedy failed', error);
    }
  };

  // useEffect(() => {
  //   if (session) {
  //     fetchSessionRemedies(session.id);
  //   }
  // }, [fetchSessionRemedies, session]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[styles.overlay, { backgroundColor: colors.overlay }]} />
        </TouchableWithoutFeedback>
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <View>
              <AppText variant="h5" style={{ color: colors.text }}>
                Send Remedy
              </AppText>
              <AppText
                variant="caption"
                style={{ color: colors.textSecondary }}>
                To: {session?.userName}
              </AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.suggestions}
            showsVerticalScrollIndicator={false}>
            <AppText
              variant="caption"
              style={{ color: colors.textSecondary, marginBottom: 8 }}>
              Quick Suggestions:
            </AppText>

            {remedies.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.suggestionItem,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceSecondary,
                  },
                ]}
                onPress={() => selectSuggestion(suggestion)}>
                <Icon name="auto-fix-high" size={16} color={colors.primary} />
                <AppText
                  variant="caption"
                  style={{ color: colors.text, flex: 1, marginLeft: 8 }}
                  numberOfLines={1}>
                  {suggestion.title}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>


          <View style={styles.inputContainer}>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Remedy Title
            </AppText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter remedy title..."
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.inputContainer}>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Instructions
            </AppText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter remedy instructions..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* <View style={styles.typeSelector}>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Remedy Type
            </AppText>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    borderColor: colors.border,
                    backgroundColor:
                      remedyType === 'FREE'
                        ? colors.primary
                        : colors.surfaceSecondary,
                  },
                ]}
                onPress={() => setRemedyType('FREE')}>
                <Icon
                  name="spa"
                  size={18}
                  color={
                    remedyType === 'FREE' ? colors.white : colors.textSecondary
                  }
                />
                <AppText
                  variant="caption"
                  style={{
                    color:
                      remedyType === 'FREE'
                        ? colors.white
                        : colors.textSecondary,
                    marginLeft: 4,
                  }}>
                  Free
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    borderColor: colors.border,
                    backgroundColor:
                      remedyType === 'PAID'
                        ? colors.accentGold
                        : colors.surfaceSecondary,
                  },
                ]}
                onPress={() => setRemedyType('PAID')}>
                <Icon
                  name="monetization-on"
                  size={18}
                  color={
                    remedyType === 'PAID' ? colors.white : colors.textSecondary
                  }
                />
                <AppText
                  variant="caption"
                  style={{
                    color:
                      remedyType === 'PAID'
                        ? colors.white
                        : colors.textSecondary,
                    marginLeft: 4,
                  }}>
                  Paid
                </AppText>
              </TouchableOpacity>
            </View>
          </View> */}

          {remedyType === 'PAID' && (
            <View style={styles.inputContainer}>
              <AppText
                variant="caption"
                style={{ color: colors.textSecondary }}>
                Price (in coins)
              </AppText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="Price in coins"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          )}

          <View style={styles.actions}>
            <AppButton
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8 }}
            />
            <AppButton
              title="Send Remedy"
              onPress={handleSend}

              style={{ flex: 1 }}
            // icon={<Icon name="send" size={18} color={colors.white} />}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  existingSection: {
    marginBottom: 16,
  },
  existingRemedyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    maxWidth: 150,
  },
  suggestions: {
    maxHeight: 140,
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
  },
});

export default SendRemedyModal;

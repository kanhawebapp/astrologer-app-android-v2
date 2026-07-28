import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';

interface Props {
    visible: boolean;
    review: any;
    loading: boolean;
    onClose: () => void;
    onSubmit: (reply: string) => void;
}

export const ReviewReplyModal: React.FC<Props> = ({
    visible,
    review,
    loading,
    onClose,
    onSubmit,
}) => {
    const { theme } = useTheme();

    const [reply, setReply] = useState('');

    //   useEffect(() => {
    //     if (visible) {
    //       setReply(review?.reply || '');
    //     }
    //   }, [visible, review]);

    //   const isEditMode = !!review?.reply;

    useEffect(() => {
        if (visible) {
            setReply('');
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}>
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={
                        Platform.OS === 'ios'
                            ? 'padding'
                            : undefined
                    }
                    style={styles.keyboard}>
                    <View
                        style={[
                            styles.container,
                            {
                                backgroundColor:
                                    theme.colors.surface,
                            },
                        ]}>
                        <View style={styles.header}>
                            <AppText variant="h5">
                                Reply Review
                            </AppText>

                            <TouchableOpacity
                                onPress={onClose}>
                                <Icon
                                    name="close"
                                    size={24}
                                    color={theme.colors.text}
                                />
                            </TouchableOpacity>
                        </View>

                        {!!review?.comment && (
                            <View
                                style={[
                                    styles.reviewBox,
                                    {
                                        backgroundColor:
                                            theme.colors.backgroundSecondary,
                                    },
                                ]}>
                                <AppText
                                    variant="body2"
                                    color={
                                        theme.colors.textSecondary
                                    }>
                                    {review.comment}
                                </AppText>
                            </View>
                        )}

                        <TextInput
                            value={reply}
                            onChangeText={setReply}
                            placeholder="Write your reply..."
                            multiline
                            style={[
                                styles.input,
                                {
                                    color: theme.colors.text,
                                    borderColor:
                                        theme.colors.border,
                                },
                            ]}
                            placeholderTextColor={
                                theme.colors.textTertiary
                            }
                        />

                        <TouchableOpacity
                            disabled={
                                loading || !reply.trim()
                            }
                            onPress={() =>
                                onSubmit(reply.trim())
                            }
                            style={[
                                styles.submitButton,
                                {
                                    backgroundColor:
                                        theme.colors.primary,
                                },
                            ]}>
                            {loading ? (
                                <ActivityIndicator
                                    color="#fff"
                                />
                            ) : (
                                <AppText variant="h5" color='white'>
                                    Reply to Review
                                </AppText>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor:
            'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    keyboard: {
        justifyContent: 'flex-end',
    },
    container: {
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent:
            'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    reviewBox: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    input: {
        minHeight: 120,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        textAlignVertical: 'top',
    },
    submitButton: {
        marginTop: 16,
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
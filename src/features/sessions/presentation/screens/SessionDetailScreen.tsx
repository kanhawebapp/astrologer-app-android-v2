import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Header } from '../../../../components';
import { AppText } from '../../../../components/common/AppText';
import { ScreenContainer } from '../../../../components/layout/ScreenContainer';
import { useTheme } from '../../../../hooks/useTheme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MessagesModal } from '../components/MessagesModal';
import { messagesApi } from '../../../../services/api/messageSession/messages.service';
import { SessionMessage } from '../../../../services/api/messageSession/messages.types';
import SendRemedyModal from '../components/SendRemedyModal';
import { useRemedies, useSessions } from '../hooks';
import { RemedyType, Session } from '../../domain';

const SessionDetailScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const { session } = route.params;

    const [showRemedyModal, setShowRemedyModal] = useState(false);
    const [messages, setMessages] = useState<SessionMessage[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [showMessagesModal, setShowMessagesModal] = useState(false);


    const { remedies, sendRemedy } = useRemedies();

    const {
        selectedSession,
        setSelectedSession,
    } = useSessions();

    const formatDate = (date: string) => {
        if (!date) return '-';

        return new Date(date).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDuration = (seconds: number) => {
        if (!seconds) return '0 sec';

        if (seconds < 60) {
            return `${seconds} sec`;
        }

        const minutes = Math.floor(seconds / 60);

        if (minutes < 60) {
            return `${minutes} min`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        return `${hours}h ${remainingMinutes}m`;
    };

    const getStatusColor = () => {
        switch (session.status?.toLowerCase()) {
            case 'completed':
                return '#22C55E';

            case 'active':
            case 'ongoing':
                return '#3B82F6';

            case 'cancelled':
                return '#EF4444';

            default:
                return '#F59E0B';
        }
    };

    // const fetchSessionMessages = async (sessionId: string) => {
    //     try {
    //         setMessagesLoading(true);

    //         const response =
    //             await messagesApi.getSessionMessages({
    //                 sessionId,
    //             });

    //         const messagesData =
    //             response?.getSessionMessages;

    //         if (messagesData?.success) {
    //             setMessages(messagesData.data || []);
    //             setShowMessagesModal(true);
    //         }
    //     } catch (err) {
    //         console.log('session messages fetch error:', err);
    //     } finally {
    //         setMessagesLoading(false);
    //     }
    // };

    const fetchSessionMessages = async (sessionId: string) => {
        setShowMessagesModal(true);      //  pehle modal kholo
        setMessages([]);                 // purane messages remove
        setMessagesLoading(true);

        try {
            const response = await messagesApi.getSessionMessages({
                sessionId,
            });

            const messagesData = response?.getSessionMessages;

            if (messagesData?.success) {
                setMessages(messagesData.data || []);
            } else {
                setMessages([]);
            }
        } catch (err) {
            console.log('session messages fetch error:', err);
            setMessages([]);
        } finally {
            setMessagesLoading(false);
        }
    };

    const getRemediesForSession = useCallback(
        (sessionId: string) => {
            return remedies.filter(r => r.sessionId === sessionId);
        },
        [remedies],
    );

    const handleRemedySend = useCallback(
        (
            sessionId: string,
            title: string,
            description: string,
            type: 'FREE' | 'PAID',
            price?: number,
        ) => {
            sendRemedy(
                sessionId,
                title,
                description,
                type as RemedyType,
                price,
            );

            setShowRemedyModal(false);
        },
        [sendRemedy],
    );





    return (
        <ScreenContainer
            scrollable={false}
            withPadding={false}>
            <Header
                title="Session Details"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}>

                {/* Hero Card */}

                <View
                    style={[
                        styles.heroCard,
                        {
                            backgroundColor: theme.colors.surface,
                        },
                    ]}>
                    <View
                        style={[
                            styles.avatar,
                            {
                                backgroundColor:
                                    theme.colors.primary + '20',
                            },
                        ]}>
                        <AppText
                            variant="h3"
                            color={theme.colors.primary}>
                            {session.userName?.charAt(0)?.toUpperCase()}
                        </AppText>
                    </View>

                    <AppText
                        variant="h5"
                        style={styles.userName}>
                        {session.userName}
                    </AppText>

                    <AppText
                        variant="body2"
                        color={theme.colors.textSecondary}>
                        {session.type?.toUpperCase()} SESSION
                    </AppText>

                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor:
                                    getStatusColor() + '20',
                            },
                        ]}>
                        <View
                            style={[
                                styles.statusDot,
                                {
                                    backgroundColor:
                                        getStatusColor(),
                                },
                            ]}
                        />
                        <AppText
                            style={{
                                color: getStatusColor(),
                                fontWeight: '700',
                            }}>
                            {session.status?.toUpperCase()}
                        </AppText>
                    </View>
                </View>

                {/* Stats */}

                <View style={styles.statsRow}>
                    <StatCard
                        icon="schedule"
                        title="Duration"
                        value={formatDuration(session.duration)}
                        theme={theme}
                    />

                    <StatCard
                        icon="account-balance-wallet"
                        title="Earnings"
                        value={`₹${session.commission ?? 0}`}
                        theme={theme}
                    />
                </View>

                {/* Session Details */}

                <View
                    style={[
                        styles.sectionCard,
                        {
                            backgroundColor: theme.colors.surface,
                        },
                    ]}>
                    <AppText
                        variant="h2"
                        style={styles.sectionTitle}>
                        Session Information
                    </AppText>

                    <InfoRow
                        icon="play-circle-filled"
                        label="Started At"
                        value={formatDate(session.startTime)}
                        theme={theme}
                    />

                    <InfoRow
                        icon="stop-circle"
                        label="Ended At"
                        value={formatDate(session.endTime)}
                        theme={theme}
                    />
                </View>

                {/* Actions */}

                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.primaryAction, {
                            borderColor: theme.colors.secondary
                        }]}
                        onPress={() => {
                            setSelectedSession(session);
                            setShowRemedyModal(true);
                        }}>
                        <Icon
                            name="spa"
                            size={20}
                            color={theme.colors.primary}
                        />

                        <AppText style={[styles.actionText, { color: theme.colors.primary }]}>
                            Send Remedy
                        </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryAction, {
                            // backgroundColor: theme.colors.secondary
                            borderColor: theme.colors.secondary
                        }]}
                        onPress={() =>
                            navigation.navigate("KundliScreen", {
                                session
                            })
                        }>
                        <Icon
                            name="chat"
                            size={20}
                            color={theme.colors.primary}
                        />

                        <AppText style={[styles.actionText, {
                            color: theme.colors.primary
                        }]}>
                            Kundli
                        </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        // style={styles.secondaryAction}
                        style={[styles.secondaryAction, {
                            // backgroundColor: theme.colors.secondary,
                            borderColor: theme.colors.secondary
                        }]}
                        onPress={() =>
                            fetchSessionMessages(session.id)
                        }>
                        <Icon
                            name="remove-red-eye"
                            size={20}
                            color={theme.colors.primary}
                        />

                        <AppText style={[styles.actionText, {
                            color: theme.colors.primary
                        }]}>
                            View Messages
                        </AppText>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            <SendRemedyModal
                visible={showRemedyModal}
                session={selectedSession}
                existingRemedies={
                    selectedSession
                        ? getRemediesForSession(
                            selectedSession.id,
                        )
                        : []
                }
                onClose={() =>
                    setShowRemedyModal(false)
                }
                onSend={handleRemedySend}
            />

            <MessagesModal
                visible={showMessagesModal}
                messages={messages}
                loading={messagesLoading}
                onClose={() =>
                    setShowMessagesModal(false)
                }
            />
        </ScreenContainer>
    );
};

const StatCard = ({
    icon,
    title,
    value,
    theme,
}: any) => (
    <View
        style={[
            styles.statCard,
            {
                backgroundColor:
                    theme.colors.surface,
            },
        ]}>
        <Icon
            name={icon}
            size={22}
            color={theme.colors.primary}
        />

        <AppText
            style={styles.statTitle}>
            {title}
        </AppText>

        <AppText
            style={styles.statValue}>
            {value}
        </AppText>
    </View>
);

const InfoRow = ({
    icon,
    label,
    value,
    theme
}: any) => (

    <View style={styles.infoRow}>
        <View style={[styles.iconCont, {
            backgroundColor: theme.colors.primary + 20
        }]}>
            <Icon
                name={icon}
                size={18}
                color={theme.colors.primary}
            />
        </View>

        <View style={{ flex: 1 }}>
            <AppText style={styles.infoLabel}>
                {label}
            </AppText>

            <AppText style={styles.infoValue}>
                {value || '-'}
            </AppText>
        </View>
    </View>
);

const styles = StyleSheet.create({
    content: {
        padding: 16,
        paddingBottom: 20,
    },

    heroCard: {
        borderRadius: 24,
        alignItems: 'center',
        padding: 24,
        // marginBottom: 16,
        marginTop: -30,
    },
    iconCont: {
        padding: 10,
        borderRadius: 5
    },

    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        // marginBottom: 12,
    },

    userName: {
        fontWeight: '700',
        marginBottom: 4,
    },

    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 50,
        marginTop: 12,
    },

    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },

    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },

    statCard: {
        flex: 1,
        padding: 8,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 10
    },

    statTitle: {
        marginTop: 8,
        opacity: 0.6,
        fontSize: 12,
    },

    statValue: {
        marginTop: 6,
        fontWeight: '700',
        fontSize: 16,
    },

    sectionCard: {
        borderRadius: 20,
        padding: 16,
    },

    sectionTitle: {
        marginBottom: 16,
        fontWeight: '700',
    },

    infoRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 18,
        alignItems: 'flex-start',
    },

    infoLabel: {
        opacity: 0.6,
        fontSize: 12,
        marginBottom: 4,
    },

    infoValue: {
        fontWeight: '600',
        fontSize: 14,
    },

    actionContainer: {
        // marginTop: 20,
        // gap: 12,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },

    primaryAction: {
        // backgroundColor: '#EAB308',
        padding: 8,
        // height: 56,
        borderWidth: 1,
        borderRadius: 14,
        borderColor: '#EAB308',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',

    },

    secondaryAction: {
        // backgroundColor: theme,
        // height: 56,
        padding: 8,
        borderWidth: 1,
        borderRadius: 14,
        borderColor: '#EAB308',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },

    actionText: {
        // color: '#FFF',
        fontWeight: '600',
        marginLeft: 1,
        fontSize: 12

    },
});

export default SessionDetailScreen;


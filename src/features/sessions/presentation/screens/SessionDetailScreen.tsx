import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Header} from '../../../../components';
import {AppText} from '../../../../components/common/AppText';
import {ScreenContainer} from '../../../../components/layout/ScreenContainer';
import {useTheme} from '../../../../hooks/useTheme';
import {useNavigation, useRoute} from '@react-navigation/native';
import {messagesApi} from '../../../../services/api/messageSession/messages.service';
import {SessionMessage} from '../../../../services/api/messageSession/messages.types';
import {Session, SessionType} from '../../domain/types';
import {formatDate, formatTime} from '../../../../utils/helpers';

const SessionDetailScreen: React.FC = () => {
  const {theme} = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const session: Session = route.params?.session;

  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const getStatusColor = () => {
    switch (session?.status?.toLowerCase()) {
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

  const fetchSessionMessages = useCallback(async (sessionId: string) => {
    setMessages([]);
    setMessagesLoading(true);
    setMessagesError(null);

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
      setMessagesError(
        err instanceof Error ? err.message : 'Failed to load messages',
      );
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.id) {
      fetchSessionMessages(session.id);
    }
  }, [session?.id, fetchSessionMessages]);

  const renderMessage = ({item}: {item: SessionMessage}) => {
    const isAstrologer = item.sender?.toLowerCase() === 'astrologer';

    return (
      <View
        style={[
          styles.messageRow,
          isAstrologer ? styles.astrologerMessage : styles.userMessage,
        ]}>
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isAstrologer
                ? theme.colors.primary
                : theme.colors.surfaceSecondary,
            },
          ]}>
          <AppText
            variant="caption"
            color={
              isAstrologer ? theme.colors.white : theme.colors.textSecondary
            }
            style={styles.senderLabel}>
            {item.sender}
          </AppText>

          {item.image ? (
            <View style={styles.imageContainer}>
              <AppText
                variant="body2"
                color={isAstrologer ? theme.colors.white : theme.colors.text}>
                Image
              </AppText>
            </View>
          ) : null}

          {item.message ? (
            <AppText
              variant="body2"
              color={isAstrologer ? theme.colors.white : theme.colors.text}
              style={item.image ? {marginTop: 8} : undefined}>
              {item.message}
            </AppText>
          ) : null}

          <AppText
            variant="caption"
            color={
              isAstrologer ? 'rgba(255,255,255,0.7)' : theme.colors.textTertiary
            }
            style={styles.messageTime}>
            {formatTime(item.createdAt)}
          </AppText>
        </View>
      </View>
    );
  };

  if (!session) {
    return (
      <ScreenContainer scrollable={false} withPadding={false}>
        <Header
          title="Session Details"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <AppText variant="body2" color={theme.colors.textSecondary}>
            No session data available
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  const statusColor = getStatusColor();
  const typeLabel = session.type === SessionType.CHAT ? 'Chat' : 'Call';

  return (
    <ScreenContainer scrollable={false} withPadding={false}>
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
                backgroundColor: theme.colors.primary + '20',
              },
            ]}>
            <AppText variant="h3" color={theme.colors.primary}>
              {session.userName?.charAt(0)?.toUpperCase()}
            </AppText>
          </View>

          <AppText variant="h5" style={styles.userName}>
            {session.userName}
          </AppText>

          <AppText variant="body2" color={theme.colors.textSecondary}>
            {typeLabel.toUpperCase()} SESSION
          </AppText>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusColor + '20',
              },
            ]}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: statusColor,
                },
              ]}
            />
            <AppText
              style={{
                color: statusColor,
                fontWeight: '700',
              }}>
              {session.status?.toUpperCase()}
            </AppText>
          </View>
        </View>

        {/* Session Information */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.surface,
            },
          ]}>
          <AppText variant="h2" style={styles.sectionTitle}>
            Session Information
          </AppText>

          <InfoRow
            icon="account-balance-wallet"
            label="Rate Per Min"
            value={
              session.ratePerMin != null ? `₹${session.ratePerMin}/min` : '-'
            }
            theme={theme}
          />

          <InfoRow
            icon="schedule"
            label="Duration"
            value={`${
              session.durationMinutes ??
              Math.floor((session.durationSec || 0) / 60)
            } min`}
            theme={theme}
          />

          <InfoRow
            icon="stars"
            label="Coins Earned"
            value={
              session.coinsEarned != null ? String(session.coinsEarned) : '-'
            }
            theme={theme}
          />

          <InfoRow
            icon="receipt"
            label="Commission"
            value={
              session.commission != null ? String(session.commission) : '-'
            }
            theme={theme}
          />

          <InfoRow
            icon="tag"
            label="Source"
            value={session.source || '-'}
            theme={theme}
          />

          <InfoRow
            icon="event"
            label="Created At"
            value={formatDate(session.startTime)}
            theme={theme}
          />

          {session.type === SessionType.CALL && (
            <>
              <InfoRow
                icon="play-circle-filled"
                label="Started At"
                value={formatDate(session.startTime)}
                theme={theme}
              />

              <InfoRow
                icon="stop-circle"
                label="Ended At"
                value={session.endTime ? formatDate(session.endTime) : '-'}
                theme={theme}
              />
            </>
          )}

          {session.type === SessionType.CHAT && (
            <>
              {session.rating != null && (
                <InfoRow
                  icon="star"
                  label="Rating"
                  value={String(session.rating)}
                  theme={theme}
                />
              )}

              {session.reviewComment ? (
                <InfoRow
                  icon="comment"
                  label="Review"
                  value={session.reviewComment}
                  theme={theme}
                />
              ) : null}
            </>
          )}
        </View>

        {/* Messages */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.surface,
            },
          ]}>
          <View style={styles.messagesHeader}>
            <AppText variant="h2" style={styles.sectionTitle}>
              Messages
            </AppText>
            {messages.length > 0 && (
              <AppText variant="caption" color={theme.colors.textTertiary}>
                {messages.length} messages
              </AppText>
            )}
          </View>

          {messagesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <AppText
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.loadingText}>
                Loading messages...
              </AppText>
            </View>
          ) : messagesError ? (
            <View style={styles.errorContainer}>
              <AppText variant="body2" color={theme.colors.error}>
                {messagesError}
              </AppText>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon
                name="chat-bubble-outline"
                size={48}
                color={theme.colors.textTertiary}
              />
              <AppText
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.emptyText}>
                No messages found
              </AppText>
            </View>
          ) : (
            <FlatList
              data={messages}
              keyExtractor={item => item.id}
              renderItem={renderMessage}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.messagesContent}
              removeClippedSubviews={false}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const InfoRow = ({icon, label, value, theme}: any) => (
  <View style={styles.infoRow}>
    <View
      style={[
        styles.iconCont,
        {
          backgroundColor: theme.colors.primary + 20,
        },
      ]}>
      <Icon name={icon} size={18} color={theme.colors.primary} />
    </View>

    <View style={{flex: 1}}>
      <AppText style={styles.infoLabel}>{label}</AppText>

      <AppText style={styles.infoValue}>{value || '-'}</AppText>
    </View>
  </View>
);

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
  },
  loadingText: {
    marginTop: 12,
  },
  heroCard: {
    borderRadius: 24,
    alignItems: 'center',
    padding: 24,
    marginTop: -30,
  },
  iconCont: {
    padding: 10,
    borderRadius: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
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
  messagesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  messagesContent: {
    paddingBottom: 40,
  },
  messageRow: {
    marginBottom: 12,
  },
  astrologerMessage: {
    alignItems: 'flex-end',
  },
  userMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  senderLabel: {
    marginBottom: 4,
    fontWeight: '700',
  },
  messageTime: {
    marginTop: 6,
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  imageContainer: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SessionDetailScreen;

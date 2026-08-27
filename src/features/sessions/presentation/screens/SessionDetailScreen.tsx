import React, {useCallback, useState} from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Header} from '../../../../components';
import {AppText} from '../../../../components/common/AppText';
import {ScreenContainer} from '../../../../components/layout/ScreenContainer';
import {useTheme} from '../../../../hooks/useTheme';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Session, SessionType} from '../../domain/types';
import {formatDate} from '../../../../utils/helpers';
import {SendRemedyModal} from '../components/SendRemedyModal';

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

const formatDateTime = (isoTime?: string, fallback = '-'): string => {
  if (!isoTime) {
    return fallback;
  }
  return formatDate(isoTime, DATE_TIME_OPTIONS);
};

const formatDuration = (durationMinutes?: number | null): string => {
  const totalSeconds = Math.floor(Number(durationMinutes || 0));

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes} min ${seconds.toString().padStart(2, '0')} sec`;
};

const formatSessionId = (id?: string): string => {
  if (!id) {
    return '-';
  }
  return id.slice(0, 8);
};

const formatRatingStars = (rating?: number | null): string => {
  const filled = Math.max(0, Math.min(5, Math.floor(Number(rating) || 0)));
  return `${'★'.repeat(filled)}${'☆'.repeat(5 - filled)}`;
};

const SessionDetailScreen: React.FC = () => {
  const {theme} = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const session: Session = route.params?.session;

  const [showRemedyModal, setShowRemedyModal] = useState(false);

  const handleRemedySend = useCallback(
    (
      _sessionId: string,
      _title: string,
      _description: string,
      _type: 'FREE' | 'PAID',
      _price?: number,
    ) => {
      setShowRemedyModal(false);
    },
    [],
  );

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
            icon="fingerprint"
            label="Session ID"
            value={formatSessionId(session.id)}
            theme={theme}
          />

          {session.type === SessionType.CHAT ? (
            <InfoRow
              icon="place"
              label="Birth Place"
              value={session.birthPlace || '-'}
              theme={theme}
            />
          ) : null}

          <InfoRow
            icon="schedule"
            label="Duration"
            value={formatDuration(session.durationMinutes)}
            theme={theme}
          />

          {session.type === SessionType.CHAT ? (
            <InfoRow
              icon="event"
              label="Created At"
              value={formatDateTime(session.startTime)}
              theme={theme}
            />
          ) : (
            <>
              <InfoRow
                icon="play-circle-filled"
                label="Started At"
                value={formatDateTime(session.startTime)}
                theme={theme}
              />

              <InfoRow
                icon="stop-circle"
                label="Ended At"
                value={formatDateTime(session.endTime, 'Not Available')}
                theme={theme}
              />
            </>
          )}

          <InfoRow
            icon="account-balance-wallet"
            label="Rate / Min"
            value={
              session.ratePerMin != null ? `₹${session.ratePerMin}/min` : '-'
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

          {session.type === SessionType.CHAT || session.rating != null ? (
            <InfoRow
              icon="star"
              label="Rating"
              value={formatRatingStars(session.rating)}
              theme={theme}
            />
          ) : null}

          {session.type === SessionType.CHAT && session.reviewComment?.trim() ? (
            <InfoRow
              icon="comment"
              label="Review Comment"
              value={session.reviewComment}
              theme={theme}
            />
          ) : null}
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.primaryAction,
              {
                borderColor: theme.colors.secondary,
              },
            ]}
            onPress={() => {
              setShowRemedyModal(true);
            }}>
            <Icon name="spa" size={20} color={theme.colors.primary} />

            <AppText style={[styles.actionText, {color: theme.colors.primary}]}>
              Send Remedy
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryAction,
              {
                borderColor: theme.colors.secondary,
              },
            ]}
            onPress={() =>
              navigation.navigate('KundliScreen', {
                session,
              })
            }>
            <Icon name="chat" size={20} color={theme.colors.primary} />

            <AppText style={[styles.actionText, {color: theme.colors.primary}]}>
              Kundli
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryAction,
              {
                borderColor: theme.colors.secondary,
              },
            ]}
            onPress={() =>
              navigation.navigate('SessionMessagesScreen', {
                sessionId: session.id,
                userName: session.userName,
              })
            }>
            <Icon name="message" size={20} color={theme.colors.primary} />

            <AppText style={[styles.actionText, {color: theme.colors.primary}]}>
              View Message
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SendRemedyModal
        visible={showRemedyModal}
        session={session}
        existingRemedies={[]}
        onClose={() => setShowRemedyModal(false)}
        onSend={handleRemedySend}
      />
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
  actionContainer: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  primaryAction: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 14,
    borderColor: '#EAB308',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  secondaryAction: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 14,
    borderColor: '#EAB308',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  actionText: {
    fontWeight: '600',
    marginLeft: 1,
    fontSize: 12,
  },
});

export default SessionDetailScreen;

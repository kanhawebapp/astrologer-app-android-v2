import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { AppButton } from '../../../../components/common/AppButton';
import { useTheme } from '../../../../hooks/useTheme';
import { Session, SessionStatus, SessionType } from '../../domain/types';
import { SessionMessage } from '../../../../services/api/messageSession/messages.types';

interface SessionRemedy {
  id: string;
  sessionId: string;
  title: string;
  description: string;
  type: 'FREE' | 'PAID';
  price?: number;
  createdAt: string;
}

interface SessionDetailModalProps {
  visible: boolean;
  session: Session | null;
  remedies?: SessionRemedy[];
  onClose: () => void;
  onJoinSession?: (session: Session) => void;
  onSendRemedy?: (session: Session) => void;
  messages?: SessionMessage[];
  messagesLoading?: boolean;
}

const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: '#22C55E' },
  pending: { label: 'Pending', color: '#F59E0B' },
  completed: { label: 'Completed', color: '#6B7280' },
  cancelled: { label: 'Cancelled', color: '#EF4444' },
};

const TYPE_CONFIG: Record<SessionType, { label: string; iconName: string }> = {
  chat: { label: 'Chat', iconName: 'chat' },
  call: { label: 'Call', iconName: 'phone' },
  // video: { label: 'Video', iconName: 'videocam' },
};

const formatDateTime = (isoTime: string): string => {
  const date = new Date(isoTime);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDuration = (minutes: number): string => {
  if (minutes === 0) return 'N/A';
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour(s)`;
};

const formatTime = (isoTime: string): string => {
  const date = new Date(isoTime);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  visible,
  session,
  remedies = [],
  onClose,
  onJoinSession,
  onSendRemedy,
  messages = [],
  messagesLoading = false,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  if (!session) return null;

  const statusConfig = STATUS_CONFIG[session.status];
  const typeConfig = TYPE_CONFIG[session.type];

  const handleCallUser = () => {
    if (session.userPhone) {
      Linking.openURL(`tel:${session.userPhone.replace(/\s/g, '')}`);
    }
  };

  const handleJoinSession = () => {
    if (onJoinSession) {
      onJoinSession(session);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.surface },
              ]}>
              <View style={styles.handle} />

              <View style={styles.header}>
                <View style={styles.userRow}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: theme.colors.surfaceSecondary },
                    ]}>
                    <AppText variant="h4" color={theme.colors.primary}>
                      {session.userName.charAt(0).toUpperCase()}
                    </AppText>
                  </View>
                  <View style={styles.userInfo}>
                    <AppText variant="h5" color={theme.colors.text}>
                      {session.userName}
                    </AppText>
                    <View style={styles.typeRow}>
                      <Icon
                        name={typeConfig.iconName}
                        size={14}
                        color={
                          session.type === SessionType.CHAT
                            ? theme.colors.info
                            : theme.colors.accentPurple
                        }
                      />
                      <AppText
                        variant="caption"
                        color={theme.colors.textSecondary}
                        style={styles.typeLabel}>
                        {typeConfig.label}
                      </AppText>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Icon
                    name="close"
                    size={24}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig.color + '18' },
                ]}>
                <Icon
                  name={
                    session.status === SessionStatus.ACTIVE
                      ? 'radio-button-checked'
                      : session.status === SessionStatus.PENDING
                      ? 'schedule'
                      : session.status === SessionStatus.COMPLETED
                      ? 'check-circle'
                      : 'cancel'
                  }
                  size={14}
                  color={statusConfig.color}
                />
                <AppText
                  variant="caption"
                  color={statusConfig.color}
                  style={styles.statusLabel}>
                  {statusConfig.label}
                </AppText>
              </View>

              <ScrollView style={styles.detailsContainer}>
                <View style={styles.statsRow}>
                  <View
                    style={[
                      styles.statCard,
                      { backgroundColor: theme.colors.surfaceSecondary },
                    ]}>
                    <Icon
                      name="schedule"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <AppText
                      variant="caption"
                      color={theme.colors.textTertiary}>
                      Start Time
                    </AppText>
                    <AppText
                      variant="body2"
                      color={theme.colors.text}
                      style={styles.statValue}>
                      {formatDateTime(session.startTime)}
                    </AppText>
                  </View>
                  <View
                    style={[
                      styles.statCard,
                      { backgroundColor: theme.colors.surfaceSecondary },
                    ]}>
                    <Icon
                      name="timelapse"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <AppText
                      variant="caption"
                      color={theme.colors.textTertiary}>
                      Duration
                    </AppText>
                    <AppText
                      variant="body2"
                      color={theme.colors.text}
                      style={styles.statValue}>
                      {formatDuration(session.duration)}
                    </AppText>
                  </View>
                </View>

                {session.endTime && (
                  <View
                    style={[
                      styles.statCard,
                      { backgroundColor: theme.colors.surfaceSecondary },
                    ]}>
                    <Icon name="event" size={20} color={theme.colors.primary} />
                    <AppText
                      variant="caption"
                      color={theme.colors.textTertiary}>
                      End Time
                    </AppText>
                    <AppText
                      variant="body2"
                      color={theme.colors.text}
                      style={styles.statValue}>
                      {formatDateTime(session.endTime)}
                    </AppText>
                  </View>
                )}

                <View
                  style={[
                    styles.detailItem,
                    { borderBottomColor: theme.colors.border },
                  ]}>
                  <View style={styles.detailIcon}>
                    <Icon
                      name="attach-money"
                      size={20}
                      color={theme.colors.success}
                    />
                  </View>
                  <View style={styles.detailContent}>
                    <AppText
                      variant="caption"
                      color={theme.colors.textTertiary}>
                      Earnings
                    </AppText>
                    <AppText variant="h5" color={theme.colors.success}>
                      ₹{session.earnings}
                    </AppText>
                  </View>
                </View>

                {session.rating !== undefined && session.rating > 0 && (
                  <View
                    style={[
                      styles.detailItem,
                      { borderBottomColor: theme.colors.border },
                    ]}>
                    <View style={styles.detailIcon}>
                      <Icon
                        name="star"
                        size={20}
                        color={theme.colors.warning}
                      />
                    </View>
                    <View style={styles.detailContent}>
                      <AppText
                        variant="caption"
                        color={theme.colors.textTertiary}>
                        Rating
                      </AppText>
                      <View style={styles.ratingRow}>
                        <AppText variant="h5" color={theme.colors.text}>
                          {session.rating}
                        </AppText>
                        <Icon
                          name="star"
                          size={16}
                          color={theme.colors.warning}
                        />
                      </View>
                    </View>
                  </View>
                )}

                <View
                  style={[
                    styles.detailItem,
                    { borderBottomColor: theme.colors.border },
                  ]}>
                  <View style={styles.detailIcon}>
                    <Icon name="phone" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.detailContent}>
                    <AppText
                      variant="caption"
                      color={theme.colors.textTertiary}>
                      Phone Number
                    </AppText>
                    <AppText variant="body1" color={theme.colors.text}>
                      {session.userPhone || 'Not available'}
                    </AppText>
                  </View>
                  {session.userPhone && (
                    <TouchableOpacity
                      onPress={handleCallUser}
                      style={styles.callButton}>
                      <Icon
                        name="call"
                        size={18}
                        color={theme.colors.primary}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <View
                  style={[
                    styles.detailItem,
                    { borderBottomColor: theme.colors.border },
                  ]}>
                  <View style={styles.detailIcon}>
                    <Icon
                      name="receipt"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.detailContent}>
                    <AppText
                      variant="caption"
                      color={theme.colors.textTertiary}>
                      Order ID
                    </AppText>
                    <AppText variant="body1" color={theme.colors.text}>
                      {session.orderId || 'N/A'}
                    </AppText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Icon name="tag" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.detailContent}>
                    <AppText
                      variant="caption"
                      color={theme.colors.textTertiary}>
                      Session ID
                    </AppText>
                    <AppText variant="body1" color={theme.colors.text}>
                      {session.id?.slice(0, 8)}
                    </AppText>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.actionButtons}>
                {session.status === SessionStatus.ACTIVE && (
                  <AppButton
                    title={
                      session.type === SessionType.CHAT
                        ? 'Open Chat'
                        : 'Join Call'
                    }
                    onPress={handleJoinSession}
                    style={styles.primaryButton}
                  />
                )}
                {onSendRemedy && (
                  <TouchableOpacity
                    style={[
                      styles.remedyButton,
                      { borderColor: colors.accentGold },
                    ]}
                    onPress={() => onSendRemedy(session)}>
                    <Icon name="spa" size={18} color={colors.accentGold} />
                    <AppText
                      variant="caption"
                      color={colors.accentGold}
                      style={styles.remedyButtonText}>
                      Send Remedy
                    </AppText>
                  </TouchableOpacity>
                )}
                <AppButton
                  title="Close"
                  variant="outline"
                  onPress={onClose}
                  style={styles.secondaryButton}
                />
              </View>

              {remedies.length > 0 && (
                <View style={styles.remediesSection}>
                  <View style={styles.remediesSectionHeader}>
                    <Icon
                      name="auto-fix-high"
                      size={18}
                      color={colors.primary}
                    />
                    <AppText
                      variant="caption"
                      style={[
                        styles.remediesSectionTitle,
                        { color: colors.text },
                      ]}>
                      Sent Remedies ({remedies.length})
                    </AppText>
                  </View>
                  {remedies.map(remedy => (
                    <View
                      key={remedy.id}
                      style={[
                        styles.remedyCard,
                        {
                          backgroundColor:
                            remedy.type === 'PAID'
                              ? colors.accentGoldLight
                              : colors.surfaceSecondary,
                        },
                      ]}>
                      <View style={styles.remedyCardHeader}>
                        <AppText
                          variant="body2"
                          style={{ color: colors.text, fontWeight: '600' }}
                          numberOfLines={1}>
                          {remedy.title}
                        </AppText>
                        {remedy.type === 'PAID' && remedy.price && (
                          <View
                            style={[
                              styles.remedyPriceBadge,
                              { backgroundColor: colors.accentGold },
                            ]}>
                            <AppText
                              variant="caption"
                              style={{ color: colors.white, fontSize: 10 }}>
                              {remedy.price} coins
                            </AppText>
                          </View>
                        )}
                      </View>
                      <AppText
                        variant="caption"
                        style={{ color: colors.textSecondary }}
                        numberOfLines={2}>
                        {remedy.description}
                      </AppText>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: '95%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    marginLeft: 14,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  typeLabel: {
    marginLeft: 4,
  },
  closeButton: {
    padding: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
    gap: 6,
  },
  statusLabel: {
    fontWeight: '600',
  },
  detailsContainer: {
    maxHeight: 320,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(8, 126, 139, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(8, 126, 139, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {},
  secondaryButton: {
    // flex: 1,
  },
  remedyButton: {
    // flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  remedyButtonText: {
    marginLeft: 6,
    fontWeight: '600',
  },
  remediesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  remediesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  remediesSectionTitle: {
    fontWeight: '600',
  },
  remedyCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  remedyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  remedyPriceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  messagesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  messagesSectionTitle: {
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
  messageTime: {
    marginTop: 4,
    fontSize: 10,
    alignSelf: 'flex-end',
  },
});

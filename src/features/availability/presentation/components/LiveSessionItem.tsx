import React, {useCallback, useRef, useState} from 'react';
import {
  Alert,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {AppText} from '../../../../components/common/AppText';
import {useTheme} from '../../../../hooks/useTheme';
import {useDispatch, useSelector} from 'react-redux';
import {useToast} from '../../../../hooks/useToast';
import {getErrorMessage} from '../../../../utils/helpers';
import {RootState, AppDispatch} from '../../../../store';
import {
  deleteScheduledLiveThunk,
  updateScheduledLiveThunk,
} from '../../../../store/slices/liveSessionSlice';
import {
  LiveSession,
  LiveSessionStatus,
  ScheduleLiveInput,
} from '../../domain/liveTypes';
import {parseLiveTimestamp} from '../../data/liveSessionRepository';
import {liveLog} from '../../data/liveLogger';
import {ScheduleLiveModal} from './ScheduleLiveModal';

interface LiveSessionItemProps {
  session: LiveSession;
  onEndLive?: (session: LiveSession) => void;
  canStartLive?: boolean;
  isStarting?: boolean;
  onStartLive?: (session: LiveSession) => void;
  onRefresh: () => void;
}

const parseEditDate = (value: string | null | undefined): Date | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (/^\d+$/.test(value.trim())) {
    const date = new Date(Number(value.trim()));
    return isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const formatDateTime = (date: Date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const dateLabel = isToday
    ? 'Today'
    : isTomorrow
    ? 'Tomorrow'
    : date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  const timeLabel = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${dateLabel} at ${timeLabel}`;
};

export const LiveSessionItem: React.FC<LiveSessionItemProps> = ({
  session,
  onEndLive,
  canStartLive = false,
  isStarting = false,
  onStartLive,
  onRefresh,
}) => {
  const {theme} = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const {showSuccess, showError} = useToast();

  const updatingLiveId = useSelector(
    (state: RootState) => state.liveSession.updatingLiveId,
  );
  const deletingLiveId = useSelector(
    (state: RootState) => state.liveSession.deletingLiveId,
  );

  const isBusy = updatingLiveId === session.id || deletingLiveId === session.id;

  const updateRef = useRef(false);
  const deleteRef = useRef(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const handleEditPress = () => {
    setIsEditModalVisible(true);
  };

  const handleEditClose = () => {
    setIsEditModalVisible(false);
  };

  const handleUpdate = useCallback(
    async (input: ScheduleLiveInput): Promise<boolean> => {
      if (updateRef.current) {
        return false;
      }
      updateRef.current = true;
      try {
        await dispatch(
          updateScheduledLiveThunk({
            id: session.id,
            title: input.title.trim(),
            scheduledAt: input.scheduledAt,
            scheduledEndAt: input.scheduledEndAt,
          }),
        ).unwrap();
        onRefresh();
        return true;
      } catch (err) {
        showError(getErrorMessage(err), 'Could not update session');
        return false;
      } finally {
        updateRef.current = false;
      }
    },
    [dispatch, session.id, onRefresh, showError],
  );

  const handleDeletePress = useCallback(() => {
    Alert.alert(
      'Delete Live Session',
      `Are you sure you want to delete "${session.title}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (deleteRef.current || !session.id) {
              return;
            }
            deleteRef.current = true;
            try {
              const deleted = await dispatch(
                deleteScheduledLiveThunk(session.id),
              ).unwrap();
              if (deleted === true) {
                onRefresh();
                showSuccess('Live session deleted');
              } else {
                showError(
                  'Could not delete the session. Please try again.',
                  'Delete failed',
                );
              }
            } catch (err) {
              showError(getErrorMessage(err), 'Could not delete session');
            } finally {
              deleteRef.current = false;
            }
          },
        },
      ],
    );
  }, [dispatch, session.id, session.title, onRefresh, showError, showSuccess]);

  const startDate = parseEditDate(session.scheduledAt ?? null);
  const endDate = parseEditDate(session.scheduledEndAt ?? null);

  const getStatusColor = () => {
    switch (session.status) {
      case LiveSessionStatus.SCHEDULED:
        return theme.colors.primary;
      case LiveSessionStatus.LIVE:
        return theme.colors.error;
      case LiveSessionStatus.ENDED:
        return theme.colors.textTertiary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const scheduledDate = parseLiveTimestamp(session.scheduledAt);
  const scheduledEndDate = parseLiveTimestamp(session.scheduledEndAt);

  liveLog('Session item rendered', {
    sessionId: session.id,
    status: session.status,
    isBusy,
  });

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: theme.colors.surfaceSecondary},
      ]}>
      <View style={styles.header}>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor() + '20'},
          ]}>
          <AppText variant="caption" color={getStatusColor()}>
            {session.status}
          </AppText>
        </View>
      </View>

      <AppText variant="h4" color={theme.colors.text} style={styles.title}>
        {session.title}
      </AppText>

      <View style={styles.metaRow}>
        <Icon name="time-outline" size={14} color={theme.colors.textTertiary} />
        <AppText variant="caption" color={theme.colors.textTertiary}>
          {scheduledDate
            ? scheduledEndDate
              ? `${formatDateTime(scheduledDate)} – ${formatDateTime(
                  scheduledEndDate,
                )}`
              : formatDateTime(scheduledDate)
            : 'Time not set'}
        </AppText>
      </View>

      {session.status === LiveSessionStatus.SCHEDULED && (
        <View style={styles.actionButtonsRow}>
          {onStartLive && canStartLive && (
            <TouchableOpacity
              style={
                isStarting
                  ? [styles.actionButton, styles.startButtonDisabled]
                  : [styles.actionButton, styles.startButton]
              }
              onPress={() => onStartLive(session)}
              disabled={isStarting || isBusy}
              activeOpacity={0.7}>
              {isStarting ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <Icon
                  name="radio-button-on"
                  size={16}
                  color={theme.colors.white}
                />
              )}
              <AppText variant="caption" color={theme.colors.white}>
                {isStarting ? 'Starting...' : 'Start Live'}
              </AppText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEditPress}
            disabled={isBusy}
            activeOpacity={0.7}>
            {updatingLiveId === session.id ? (
              <ActivityIndicator size="small" color="#2457A7" />
            ) : (
              <Icon name="create-outline" size={16} color="#2457A7" />
            )}
            <AppText variant="caption" color="#2457A7">
              Edit
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeletePress}
            disabled={isBusy}
            activeOpacity={0.7}>
            {deletingLiveId === session.id ? (
              <ActivityIndicator size="small" color="#B42318" />
            ) : (
              <Icon name="trash-outline" size={16} color="#B42318" />
            )}
            <AppText variant="caption" color="#B42318">
              Delete
            </AppText>
          </TouchableOpacity>
        </View>
      )}

      {onEndLive && session.status === LiveSessionStatus.LIVE && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: theme.colors.error}]}
            onPress={() => onEndLive(session)}
            activeOpacity={0.8}>
            <Icon name="close" size={16} color={theme.colors.white} />
            <AppText variant="caption" color={theme.colors.white}>
              End Live
            </AppText>
          </TouchableOpacity>
        </View>
      )}

      {isEditModalVisible && (
        <ScheduleLiveModal
          visible
          onClose={handleEditClose}
          onSchedule={handleUpdate}
          isSubmitting={updatingLiveId === session.id}
          initialData={{
            title: session.title,
            scheduledAt: startDate,
            scheduledEndAt: endDate,
          }}
          isEdit
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  title: {
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    gap: 6,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 70,
  },
  startButton: {
    backgroundColor: '#16A34A',
  },
  startButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  editButton: {
    backgroundColor: '#E8F1FF',
  },
  deleteButton: {
    backgroundColor: '#FDECEC',
  },
});

export default LiveSessionItem;

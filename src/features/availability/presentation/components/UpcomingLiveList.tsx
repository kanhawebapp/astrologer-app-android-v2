import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {AppText} from '../../../../components/common/AppText';
import {useTheme} from '../../../../hooks/useTheme';
import {useDispatch, useSelector} from 'react-redux';
import {useToast} from '../../../../hooks/useToast';
import {getErrorMessage} from '../../../../utils/helpers';
import {RootState, AppDispatch} from '../../../../store';
import {
  updateScheduledLiveThunk,
  deleteScheduledLiveThunk,
  fetchScheduledLivesThunk,
} from '../../../../store/slices/liveSessionSlice';
import {
  LiveSession,
  LiveSessionStatus,
  ScheduleLiveInput,
} from '../../domain/liveTypes';
import {parseLiveTimestamp} from '../../data/liveSessionRepository';
import {liveLog} from '../../data/liveLogger';
import {LiveSessionItem} from './LiveSessionItem';
import {ScheduleLiveModal} from './ScheduleLiveModal';

interface UpcomingLiveListProps {
  sessions: LiveSession[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  activeLiveId?: string;
  isStarting: boolean;
  onRetry: () => void;
  onSchedulePress: () => void;
  onEndLive: (session: LiveSession) => void;
  onStartLive: (session: LiveSession) => void;
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

export const UpcomingLiveList: React.FC<UpcomingLiveListProps> = ({
  sessions,
  isLoading,
  hasLoaded,
  error,
  activeLiveId,
  isStarting,
  onRetry,
  onSchedulePress: _onSchedulePress,
  onEndLive,
  onStartLive,
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

  const updateRef = useRef(false);
  const deleteRef = useRef(false);

  // Re-read only when the list fetch starts or settles (focus, pull-to-refresh, refetch completion); no timers by design.
  const [evaluatedAt, setEvaluatedAt] = useState(Date.now);
  useEffect(() => {
    setEvaluatedAt(Date.now());
  }, [sessions, isLoading]);

  const startableIds = useMemo(() => {
    const now = evaluatedAt;
    const ids = new Set<string>();
    sessions.forEach(session => {
      const scheduledMs = parseLiveTimestamp(session.scheduledAt)?.getTime();
      const eligible =
        session.status === LiveSessionStatus.SCHEDULED &&
        scheduledMs !== undefined &&
        scheduledMs <= now;
      liveLog('Start eligibility', {
        sessionId: session.id,
        status: session.status,
        scheduledAtRaw: session.scheduledAt,
        scheduledAt:
          scheduledMs !== undefined
            ? new Date(scheduledMs).toISOString()
            : null,
        now: new Date(now).toISOString(),
        eligible,
      });
      if (eligible) {
        ids.add(session.id);
      }
    });
    return ids;
  }, [sessions, evaluatedAt]);

  const [editingSession, setEditingSession] = useState<LiveSession | null>(
    null,
  );

  const isItemBusy = (id: string) =>
    updatingLiveId === id || deletingLiveId === id;

  const handleEditPress = (session: LiveSession) => {
    setEditingSession(session);
  };

  const handleEditClose = () => {
    setEditingSession(null);
  };

  const handleUpdate = async (input: ScheduleLiveInput): Promise<boolean> => {
    if (!editingSession || updateRef.current) {
      return false;
    }
    updateRef.current = true;
    try {
      await dispatch(
        updateScheduledLiveThunk({
          id: editingSession.id,
          title: input.title.trim(),
          scheduledAt: input.scheduledAt,
          scheduledEndAt: input.scheduledEndAt,
        }),
      ).unwrap();
      dispatch(fetchScheduledLivesThunk());
      return true;
    } catch (err) {
      showError(getErrorMessage(err), 'Could not update session');
      return false;
    } finally {
      updateRef.current = false;
    }
  };

  const handleDeletePress = (session: LiveSession) => {
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
                dispatch(fetchScheduledLivesThunk());
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
  };

  const startDate = editingSession
    ? parseEditDate(editingSession.scheduledAt ?? null)
    : null;
  const endDate = editingSession
    ? parseEditDate(editingSession.scheduledEndAt ?? null)
    : null;

  if (error && sessions.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {backgroundColor: theme.colors.surface},
        ]}>
        <View
          style={[
            styles.emptyIcon,
            {backgroundColor: theme.colors.errorLight},
          ]}>
          <Icon
            name="cloud-offline-outline"
            size={24}
            color={theme.colors.error}
          />
        </View>
        <AppText
          variant="body2"
          color={theme.colors.textSecondary}
          style={styles.emptyText}>
          Could not load upcoming lives
        </AppText>
        <AppText
          variant="caption"
          color={theme.colors.textTertiary}
          style={styles.centerText}>
          {error}
        </AppText>
        <TouchableOpacity
          style={[styles.emptyAction, {borderColor: theme.colors.primary}]}
          onPress={onRetry}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <AppText variant="button" color={theme.colors.primary}>
              Retry
            </AppText>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  if (!hasLoaded && sessions.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {backgroundColor: theme.colors.surface},
        ]}>
        <ActivityIndicator color={theme.colors.primary} />
        <AppText
          variant="caption"
          color={theme.colors.textTertiary}
          style={styles.loadingText}>
          Loading upcoming lives...
        </AppText>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {backgroundColor: theme.colors.surface},
        ]}>
        <View
          style={[
            styles.emptyIcon,
            {backgroundColor: theme.colors.surfaceSecondary},
          ]}>
          <Icon
            name="calendar-outline"
            size={24}
            color={theme.colors.textTertiary}
          />
        </View>
        <AppText
          variant="body2"
          color={theme.colors.textSecondary}
          style={styles.emptyText}>
          No upcoming live sessions
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      <View style={styles.header}>
        <Icon name="calendar" size={20} color={theme.colors.primary} />
        <AppText variant="h4" color={theme.colors.text}>
          Upcoming
        </AppText>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={styles.badgeSpacer}
          />
        ) : (
          <View
            style={[
              styles.badge,
              {backgroundColor: theme.colors.primaryLight},
            ]}>
            <AppText variant="caption" color={theme.colors.white}>
              {sessions.length}
            </AppText>
          </View>
        )}
      </View>
      {error && (
        <TouchableOpacity
          style={[
            styles.inlineError,
            {backgroundColor: theme.colors.errorLight},
          ]}
          onPress={onRetry}>
          <AppText variant="caption" color={theme.colors.error}>
            {`Refresh failed: ${error}. Tap to retry.`}
          </AppText>
        </TouchableOpacity>
      )}
      <FlatList
        data={sessions}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.itemWrapper}>
            <LiveSessionItem
              session={item}
              onEndLive={item.id === activeLiveId ? undefined : onEndLive}
              canStartLive={!activeLiveId && startableIds.has(item.id)}
              isStarting={isStarting}
              onStartLive={onStartLive}
            />
            {item.status === LiveSessionStatus.SCHEDULED && (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {backgroundColor: theme.colors.primary},
                  ]}
                  onPress={() => handleEditPress(item)}
                  disabled={isItemBusy(item.id)}
                  activeOpacity={0.8}>
                  <Icon
                    name="create-outline"
                    size={16}
                    color={theme.colors.white}
                  />
                  <AppText variant="caption" color={theme.colors.white}>
                    Edit
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {backgroundColor: theme.colors.error},
                  ]}
                  onPress={() => handleDeletePress(item)}
                  disabled={isItemBusy(item.id)}
                  activeOpacity={0.8}>
                  <Icon
                    name="trash-outline"
                    size={16}
                    color={theme.colors.white}
                  />
                  <AppText variant="caption" color={theme.colors.white}>
                    Delete
                  </AppText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        extraData={[startableIds, updatingLiveId, deletingLiveId]}
        scrollEnabled={false}
      />
      {editingSession && (
        <ScheduleLiveModal
          visible
          onClose={handleEditClose}
          onSchedule={handleUpdate}
          isSubmitting={updatingLiveId === editingSession.id}
          initialData={{
            title: editingSession.title,
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
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  badgeSpacer: {
    marginLeft: 'auto',
  },
  inlineError: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 24,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: {
    marginBottom: 4,
  },
  centerText: {
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 8,
  },
  emptyAction: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  itemWrapper: {
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
});

export default UpcomingLiveList;

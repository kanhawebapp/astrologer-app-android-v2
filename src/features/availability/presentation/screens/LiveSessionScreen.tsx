import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ScreenContainer } from '../../../../components/layout/ScreenContainer';
import { Header } from '../../../../components/layout/Header';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { useLiveSession } from '../hooks/useLiveSession';
import {
  usePermissions,
  PermissionStatus,
} from '../../../../hooks/permissions';
import { LiveStatusCard } from '../components/LiveStatusCard';
import { GoLiveCard } from '../components/GoLiveCard';
import { UpcomingLiveList } from '../components/UpcomingLiveList';
import { LiveStatsCard } from '../components/LiveStatsCard';
import { ScheduleLiveModal } from '../components/ScheduleLiveModal';
import { PermissionModal } from '../components/PermissionModal';
import { ScheduleLiveInput } from '../../domain/liveTypes';

type PermissionModalState = {
  visible: boolean;
  isDenied: boolean;
  isLoading: boolean;
};

export const LiveSessionScreen: React.FC = () => {
  const { theme } = useTheme();
  const { checkPermissions, requestPermissions, openSettings } =
    usePermissions();
  const {
    currentLive,
    scheduledSessions,
    completedSessions,
    isLoading,
    isUpdating,
    isMockData,
    formattedDuration,
    scheduleLive,
    goLiveNow,
    endLive,
    cancelScheduledLive,
    refresh,
  } = useLiveSession();

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [permissionModal, setPermissionModal] = useState<PermissionModalState>({
    visible: false,
    isDenied: false,
    isLoading: false,
  });

  const isPermissionGranted = (status: PermissionStatus) =>
    status === 'granted';

  const handleGoLiveNow = useCallback(async () => {
    setPermissionModal(prev => ({ ...prev, visible: true, isLoading: true }));

    const permissions = await checkPermissions();

    const cameraGranted = isPermissionGranted(permissions.camera);
    const micGranted = isPermissionGranted(permissions.microphone);

    if (cameraGranted && micGranted) {
      setPermissionModal(prev => ({
        ...prev,
        visible: false,
        isLoading: false,
      }));
      goLiveNow();
      return;
    }

    const requested = await requestPermissions();
    const allGranted =
      isPermissionGranted(requested.camera) &&
      isPermissionGranted(requested.microphone);

    if (allGranted) {
      setPermissionModal(prev => ({
        ...prev,
        visible: false,
        isLoading: false,
      }));
      goLiveNow();
    } else {
      const denied =
        !isPermissionGranted(requested.camera) ||
        !isPermissionGranted(requested.microphone);
      setPermissionModal(prev => ({
        ...prev,
        isLoading: false,
        isDenied: denied,
      }));
    }
  }, [checkPermissions, requestPermissions, goLiveNow]);

  const handleRequestPermission = useCallback(async () => {
    setPermissionModal(prev => ({ ...prev, isLoading: true }));

    const requested = await requestPermissions();
    const allGranted =
      isPermissionGranted(requested.camera) &&
      isPermissionGranted(requested.microphone);

    if (allGranted) {
      setPermissionModal(prev => ({
        ...prev,
        visible: false,
        isLoading: false,
      }));
      goLiveNow();
    } else {
      const denied =
        !isPermissionGranted(requested.camera) ||
        !isPermissionGranted(requested.microphone);
      setPermissionModal(prev => ({
        ...prev,
        isLoading: false,
        isDenied: denied,
      }));
    }
  }, [requestPermissions, goLiveNow]);

  const handleOpenSettings = useCallback(() => {
    openSettings();
    setPermissionModal(prev => ({ ...prev, visible: false }));
  }, [openSettings]);

  const handleClosePermissionModal = useCallback(() => {
    setPermissionModal(prev => ({ ...prev, visible: false, isDenied: false }));
  }, []);

  const handleSchedule = (input: ScheduleLiveInput) => {
    scheduleLive(input);
  };

  const handleEndLive = (sessionId: string) => {
    endLive(sessionId);
  };

  const handleCancel = (sessionId: string) => {
    cancelScheduledLive(sessionId);
  };

  const handleStartNow = (sessionId: string) => {
    goLiveNow(sessionId);
  };

  const latestCompletedSession = completedSessions[0];

  const rightComponent = isMockData ? (
    <View
      style={[
        styles.demoBadge,
        { backgroundColor: theme.colors.warningLight },
      ]}>
      <AppText variant="caption" color={theme.colors.warning}>
        Demo
      </AppText>
    </View>
  ) : undefined;

  return (
    <ScreenContainer scrollable={false} withPadding={false}>
      <Header title="Live Sessions" rightComponent={rightComponent} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
          />
        }>
        {currentLive && (
          <LiveStatusCard
            currentLive={currentLive}
            onEndLive={handleEndLive}
            formattedDuration={formattedDuration}
            isLoading={isUpdating}
          />
        )}

        {!currentLive && (
          <GoLiveCard
            onGoLiveNow={handleGoLiveNow}
            onScheduleLive={() => setShowScheduleModal(true)}
            isLoading={isUpdating}
          />
        )}

        <UpcomingLiveList
          sessions={scheduledSessions}
          onCancel={handleCancel}
          onStartNow={handleStartNow}
        />

        {latestCompletedSession && (
          <LiveStatsCard
            stats={latestCompletedSession.stats}
            title={`Last Session: ${latestCompletedSession.title}`}
          />
        )}

        {completedSessions.length > 1 && (
          <View
            style={[
              styles.historySection,
              { backgroundColor: theme.colors.surface },
            ]}>
            <AppText
              variant="h4"
              color={theme.colors.text}
              style={styles.sectionTitle}>
              Previous Sessions
            </AppText>
            {completedSessions.slice(1).map(session => (
              <View key={session.id} style={styles.historyItem}>
                <View style={styles.historyInfo}>
                  <AppText variant="body2" color={theme.colors.text}>
                    {session.title}
                  </AppText>
                  <AppText variant="caption" color={theme.colors.textTertiary}>
                    {new Date(session.scheduledAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </AppText>
                </View>
                <View
                  style={[
                    styles.historyEarnings,
                    { backgroundColor: theme.colors.successLight },
                  ]}>
                  <AppText variant="body2" color={theme.colors.success}>
                    ₹{session.stats.earnings}
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        )}

        <View
          style={[
            styles.bottomPadding,
            { backgroundColor: theme.colors.surface },
          ]}
        />
      </ScrollView>

      <ScheduleLiveModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleSchedule}
      />

      <PermissionModal
        visible={permissionModal.visible}
        onRequestPermission={handleRequestPermission}
        onOpenSettings={handleOpenSettings}
        onClose={handleClosePermissionModal}
        isLoading={permissionModal.isLoading}
        isDenied={permissionModal.isDenied}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  demoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  historySection: {
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 12,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  historyInfo: {
    flex: 1,
  },
  historyEarnings: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bottomPadding: {
    height: 20,
  },
});

export default LiveSessionScreen;

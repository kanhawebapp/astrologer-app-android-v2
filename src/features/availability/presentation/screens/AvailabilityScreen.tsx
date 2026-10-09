import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenContainer } from '../../../../components/layout/ScreenContainer';
import { Header } from '../../../../components/layout/Header';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { useAvailability } from '../hooks/useAvailability';
import { useLiveSession } from '../hooks/useLiveSession';
import { OnlineStatusCard } from '../components/OnlineStatusCard';
import { SessionToggleCard } from '../components/SessionToggleCard';
import { ModeCard } from '../components/ModeCard';
import { SessionLimitCard } from '../components/SessionLimitCard';
import { WorkingHoursCard } from '../components/WorkingHoursCard';
import { InfoBanner } from '../components/InfoBanner';
import { LiveStatusCard } from '../components/LiveStatusCard';
import { GoLiveCard } from '../components/GoLiveCard';
import { UpcomingLiveList } from '../components/UpcomingLiveList';
import { ScheduleLiveModal } from '../components/ScheduleLiveModal';

export const AvailabilityScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    availability,
    isLoading,
    isUpdating,
    isMockData,
    toggleOnline,
    toggleChat,
    toggleCall,
    toggleBusyMode,
    toggleAutoAccept,
    updateMaxSessions,
    updateWorkingHours,
    refresh,
  } = useAvailability();

  const {
    scheduledLives,
    activeLive,
    isLoading: liveLoading,
    hasLoaded: liveHasLoaded,
    listError: liveListError,
    isScheduling,
    isStarting,
    isEnding,
    scheduleLive,
    startLive,
    openBroadcast,
    confirmEndLive,
    refresh: refreshLive,
  } = useLiveSession();

  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const handleRefresh = () => {
    refresh();
    refreshLive();
  };

  return (
    <ScreenContainer scrollable={false} withPadding={false}>
      <Header
        title="Live"
        rightComponent={
          <TouchableOpacity
            style={[
              styles.liveTab,
              { backgroundColor: theme.colors.errorLight },
            ]}
            onPress={() => {}}>
            <Icon name="videocam" size={16} color={theme.colors.error} />
            <AppText variant="caption" color={theme.colors.error}>
              Live
            </AppText>
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || liveLoading}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }>
        {/* <View style={styles.section}>
          <OnlineStatusCard
            availability={availability}
            onToggleOnline={toggleOnline}
            isLoading={isUpdating}
          />
        </View> */}

        <View style={[styles.section, styles.liveSection]}>
          {activeLive ? (
            <LiveStatusCard
              session={activeLive}
              isEnding={isEnding}
              onReturnToLive={openBroadcast}
              onEndLive={session => confirmEndLive(session)}
            />
          ) : (
            <GoLiveCard
              onGoLiveNow={startLive}
              onScheduleLive={() => setShowScheduleModal(true)}
              isLoading={isStarting}
            />
          )}
        </View>

        <View style={styles.section}>
          <UpcomingLiveList
            sessions={scheduledLives}
            isLoading={liveLoading}
            hasLoaded={liveHasLoaded}
            error={liveListError}
            activeLiveId={activeLive?.id}
            onRetry={refreshLive}
            onSchedulePress={() => setShowScheduleModal(true)}
            onEndLive={session => confirmEndLive(session)}
          />
        </View>

        {/* <View style={styles.section}>
          <SessionToggleCard
            availability={availability}
            onToggleChat={toggleChat}
            onToggleCall={toggleCall}
            isLoading={isUpdating}
          />
        </View> */}

        {/* <View style={styles.section}>
          <ModeCard
            availability={availability}
            onToggleBusyMode={toggleBusyMode}
            onToggleAutoAccept={toggleAutoAccept}
            isLoading={isUpdating}
          />
        </View> */}

        {/* <View style={styles.section}>
          <SessionLimitCard
            availability={availability}
            onUpdateMaxSessions={updateMaxSessions}
            isLoading={isUpdating}
          />
        </View> */}

        <View style={styles.section}>
          <WorkingHoursCard
            availability={availability}
            onUpdateWorkingHours={updateWorkingHours}
            isLoading={isUpdating}
          />
        </View>

        {/* <View style={[styles.section, styles.lastSection]}>
          <InfoBanner availability={availability} isMockData={isMockData} />
        </View> */}
      </ScrollView>

      <ScheduleLiveModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={scheduleLive}
        isSubmitting={isScheduling}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  section: {
    marginTop: 8,
  },
  liveSection: {
    marginTop: 4,
  },
  lastSection: {
    marginTop: 16,
  },
  liveTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
});

export default AvailabilityScreen;


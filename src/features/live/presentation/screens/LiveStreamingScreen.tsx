import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useTheme } from '../../../../hooks/useTheme';
import { AppText } from '../../../../components/common/AppText';
import { AppButton } from '../../../../components/common/AppButton';
import { VideoView } from '../components/VideoView';
import { LiveHeader } from '../components/LiveHeader';
import { ChatOverlay } from '../components/ChatOverlay';
import { LikeAnimation } from '../components/LikeAnimation';
import { GiftPopup } from '../components/GiftPopup';
import { RemedyCard } from '../components/RemedyCard';
import { SendRemedyModal } from '../components/SendRemedyModal';
import { LiveControls } from '../components/LiveControls';
import { useLiveStreaming } from '../hooks/useLiveStreaming';
import { LiveStatus } from '../../domain/liveEnums';

interface LiveStreamingScreenProps {
  route?: {
    params?: {
      title?: string;
    };
  };
  navigation?: {
    goBack: () => void;
  };
}

export const LiveStreamingScreen: React.FC<LiveStreamingScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const colors = theme.colors;
  const {
    liveState,
    streamStatus,
    showRemedyModal,
    showGiftPopup,
    showJoinerPopup,
    startLive,
    endLive,
    toggleMute,
    sendRemedy,
    pinMessage,
    setShowRemedyModal,
  } = useLiveStreaming();

  const [selectedRemedy, setSelectedRemedy] = useState<any>(null);

  const isLive = streamStatus === LiveStatus.LIVE;
  const isConnecting = streamStatus === LiveStatus.CONNECTING;

  React.useEffect(() => {
    if (
      liveState.pinnedMessage &&
      Date.now() > liveState.pinnedMessage.expiresAt
    ) {
      setSelectedRemedy(null);
    }
  }, [liveState.pinnedMessage]);

  const handleStartLive = () => {
    Alert.alert('Start Live Session', 'Are you ready to go live?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: () => startLive(),
      },
    ]);
  };

  const handleEndLive = () => {
    Alert.alert(
      'End Live Session',
      'Are you sure you want to end this live session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: () => {
            endLive();
            navigation?.goBack();
          },
        },
      ],
    );
  };

  if (!isLive && !isConnecting) {
    return (
      <SafeAreaView
        style={[
          styles.previewContainer,
          { backgroundColor: colors.cosmicDeep },
        ]}
        edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" />
        <VideoView isLive={false} />
        <View style={styles.previewContent}>
          <View
            style={[styles.previewCard, { backgroundColor: colors.surface }]}>
            <AppText
              variant="h4"
              style={{ color: colors.text, marginBottom: 8 }}>
              Ready to Go Live?
            </AppText>
            <AppText
              variant="body2"
              style={{ color: colors.textSecondary, marginBottom: 24 }}>
              Connect with your audience in real-time
            </AppText>
            <AppButton title="Start Live Session" onPress={handleStartLive} />
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}>
            <AppText style={{ color: colors.white }}>← Back</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.cosmicDeep }]}
      edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <VideoView isLive={isLive} />

      <LiveHeader
        viewerCount={liveState.stats.viewerCount}
        duration={liveState.stats.duration}
        title="Live Astrology Session"
      />

      {showJoinerPopup && (
        <View
          style={[
            styles.joinerPopup,
            { backgroundColor: colors.successLight },
          ]}>
          <AppText variant="caption" style={{ color: colors.success }}>
            🎉 {showJoinerPopup} joined!
          </AppText>
        </View>
      )}

      <ChatOverlay
        messages={liveState.messages}
        pinnedMessage={liveState.pinnedMessage?.message}
      />

      <LikeAnimation
        isActive={isLive}
        count={liveState.likes.length % 3 === 0 ? 1 : 0}
      />

      <GiftPopup gift={showGiftPopup} />

      <LiveControls
        isLive={isLive}
        isMuted={liveState.isMuted}
        onEndLive={handleEndLive}
        onToggleMute={toggleMute}
        onSendRemedy={() => setShowRemedyModal(true)}
      />

      <SendRemedyModal
        visible={showRemedyModal}
        onClose={() => setShowRemedyModal(false)}
        onSend={sendRemedy}
      />

      {selectedRemedy && (
        <View style={styles.remedyOverlay}>
          <RemedyCard remedy={selectedRemedy} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewCard: {
    padding: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  backButton: {
    marginTop: 20,
    padding: 12,
  },
  joinerPopup: {
    position: 'absolute',
    top: 100,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  remedyOverlay: {
    position: 'absolute',
    top: 120,
    right: 16,
    width: 200,
  },
});

export default LiveStreamingScreen;

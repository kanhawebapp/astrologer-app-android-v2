import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {RtcSurfaceView} from 'react-native-agora';
import {AppText} from '../../../../components/common/AppText';
import {useTheme} from '../../../../hooks/useTheme';
import {
  RootNavigationProp,
  RootStackParamList,
} from '../../../../navigation/types';
import {LiveSessionStatus} from '../../domain/liveTypes';
import {useLiveBroadcast} from '../hooks/useLiveBroadcast';
import {BroadcastState} from '../hooks/useAgoraBroadcast';
import {useKeyboardInset} from '../hooks/useKeyboardInset';
import {LiveChatPanel} from '../components/LiveChatPanel';
import {ViewerCountBadge} from '../components/ViewerCountBadge';

const LOCAL_VIDEO_CANVAS = {uid: 0};

const getStatusLabel = (
  state: BroadcastState,
  isJoining: boolean,
  serverStatus?: string,
): string => {
  if (isJoining || state === 'connecting') {
    return 'Connecting...';
  }
  switch (state) {
    case 'live':
      return serverStatus === LiveSessionStatus.LIVE
        ? 'LIVE'
        : `Connected (${serverStatus ?? 'unknown status'})`;
    case 'reconnecting':
      return 'Reconnecting...';
    case 'failed':
      return 'Connection failed';
    default:
      return 'Not broadcasting';
  }
};

export const LiveBroadcastScreen: React.FC = () => {
  const {theme} = useTheme();
  const colors = theme.colors;
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'LiveBroadcast'>>();
  const allowLeaveRef = useRef(false);

  const {
    session,
    broadcastState,
    error,
    permissionDenied,
    hasPreview,
    isLocalVideoReady,
    isJoining,
    isEnding,
    isMicMuted,
    isCameraOff,
    rtcViewerCount,
    formattedDuration,
    toggleMic,
    toggleCamera,
    switchCamera,
    retry,
    openSettings,
    endLive,
    chatCredentials,
    isChatUnavailable,
    chatSenderName,
    refreshChatCredentials,
  } = useLiveBroadcast(route.params.streamId);
  const [chatAudienceCount, setChatAudienceCount] = useState(0);
  const handleChatAudienceCountChange = useCallback((count: number) => {
    setChatAudienceCount(Number.isFinite(count) && count > 0 ? count : 0);
  }, []);
  // Prefer the larger of RTC remote UIDs and chat-room audience. Pure
  // ClientRoleAudience joins do not fire onUserJoined on the host in LIVE_BROADCASTING.
  const viewerCount = Math.max(rtcViewerCount, chatAudienceCount);
  const insets = useSafeAreaInsets();
  const {isKeyboardVisible, keyboardInset, onRootLayout} = useKeyboardInset(
    insets.bottom,
  );

  useEffect(
    () =>
      navigation.addListener('beforeRemove', e => {
        if (allowLeaveRef.current || !session || !hasPreview) {
          return;
        }
        e.preventDefault();
        Alert.alert(
          'Leave broadcast?',
          'Your camera and microphone will stop, but the live session will stay open. You can return to it or end it from the Live tab.',
          [
            {text: 'Stay', style: 'cancel'},
            {
              text: 'Leave',
              style: 'destructive',
              onPress: () => {
                allowLeaveRef.current = true;
                navigation.dispatch(e.data.action);
              },
            },
          ],
        );
      }),
    [navigation, session, hasPreview],
  );

  const handleEndLive = () => {
    endLive(() => {
      allowLeaveRef.current = true;
      navigation.goBack();
    });
  };

  if (!session) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centered,
          {backgroundColor: colors.cosmicDeep},
        ]}
        edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" />
        <AppText variant="body1" color={colors.white} style={styles.centerText}>
          This live session is no longer active.
        </AppText>
        <TouchableOpacity
          style={[styles.pillButton, {backgroundColor: colors.surface}]}
          onPress={() => navigation.goBack()}>
          <AppText variant="button" color={colors.text}>
            Go Back
          </AppText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isOnAir =
    broadcastState === 'live' && session.status === LiveSessionStatus.LIVE;
  const isBusy = isJoining || broadcastState === 'connecting';
  const canRetry =
    !hasPreview && !isBusy && !isEnding && broadcastState !== 'reconnecting';
  const statusLabel = getStatusLabel(broadcastState, isJoining, session.status);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.cosmicDeep}]}
      edges={['top', 'bottom']}
      onLayout={onRootLayout}>
      <StatusBar barStyle="light-content" />

      <View style={styles.videoArea}>
        {hasPreview && isLocalVideoReady && !isCameraOff ? (
          <RtcSurfaceView
            canvas={LOCAL_VIDEO_CANVAS}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.centered]}>
            {isBusy ? (
              <ActivityIndicator size="large" color={colors.white} />
            ) : (
              <Icon
                name={isCameraOff ? 'videocam-off' : 'videocam-outline'}
                size={48}
                color={colors.white}
              />
            )}
          </View>
        )}

        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Back">
            <Icon name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.statusCluster}>
            <View
              style={[
                styles.statusPill,
                isOnAir
                  ? {backgroundColor: colors.error}
                  : styles.statusPillIdle,
              ]}>
              {isOnAir && (
                <View style={[styles.dot, {backgroundColor: colors.white}]} />
              )}
              <AppText variant="caption" color={colors.white}>
                {statusLabel}
              </AppText>
            </View>
            <ViewerCountBadge count={viewerCount} />
            {isOnAir ? (
              <View style={styles.durationPill}>
                <AppText variant="caption" color={colors.white}>
                  {formattedDuration}
                </AppText>
              </View>
            ) : null}
          </View>
          <View style={styles.iconButton} />
        </View>

        <AppText
          variant="h4"
          color={colors.white}
          numberOfLines={2}
          style={styles.title}>
          {session.title}
        </AppText>

        <Pressable
          style={[styles.bottomOverlay, {paddingBottom: keyboardInset}]}
          onPress={Keyboard.dismiss}
          accessible={false}>
          {error && (
            <View
              style={[styles.errorBox, {backgroundColor: colors.errorLight}]}>
              <AppText variant="body2" color={colors.error}>
                {error}
              </AppText>
              <View style={styles.errorActions}>
                {canRetry && (
                  <TouchableOpacity
                    style={[
                      styles.pillButton,
                      {backgroundColor: colors.surface},
                    ]}
                    onPress={retry}>
                    <AppText variant="button" color={colors.text}>
                      Retry
                    </AppText>
                  </TouchableOpacity>
                )}
                {permissionDenied && (
                  <TouchableOpacity
                    style={[
                      styles.pillButton,
                      {backgroundColor: colors.surface},
                    ]}
                    onPress={openSettings}>
                    <AppText variant="button" color={colors.text}>
                      Open Settings
                    </AppText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          <LiveChatPanel
            credentials={chatCredentials}
            isUnavailable={isChatUnavailable}
            isPreparing={isJoining}
            senderName={chatSenderName}
            refreshCredentials={refreshChatCredentials}
            onAudienceCountChange={handleChatAudienceCountChange}
          />
        </Pressable>
      </View>

      <View style={[styles.controls, isKeyboardVisible && styles.hidden]}>
        <TouchableOpacity
          style={[styles.controlButton, !hasPreview && styles.disabled]}
          onPress={toggleMic}
          disabled={!hasPreview}
          accessibilityLabel={
            isMicMuted ? 'Unmute microphone' : 'Mute microphone'
          }>
          <Icon
            name={isMicMuted ? 'mic-off' : 'mic'}
            size={24}
            color={isMicMuted ? colors.error : colors.white}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, !hasPreview && styles.disabled]}
          onPress={toggleCamera}
          disabled={!hasPreview}
          accessibilityLabel={
            isCameraOff ? 'Turn camera on' : 'Turn camera off'
          }>
          <Icon
            name={isCameraOff ? 'videocam-off' : 'videocam'}
            size={24}
            color={isCameraOff ? colors.error : colors.white}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.controlButton,
            (!hasPreview || isCameraOff) && styles.disabled,
          ]}
          onPress={switchCamera}
          disabled={!hasPreview || isCameraOff}
          accessibilityLabel="Switch camera">
          <Icon name="camera-reverse-outline" size={24} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.endButton,
            {backgroundColor: isEnding ? colors.textTertiary : colors.error},
          ]}
          onPress={handleEndLive}
          disabled={isEnding}
          accessibilityLabel="End live">
          {isEnding ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <AppText variant="button" color={colors.white}>
              End Live
            </AppText>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  videoArea: {
    flex: 1,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  statusCluster: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginHorizontal: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    flexShrink: 1,
  },
  statusPillIdle: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  durationPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  title: {
    paddingHorizontal: 16,
    marginTop: 12,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 4,
  },
  bottomOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  errorBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  pillButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  disabled: {
    opacity: 0.4,
  },
  hidden: {
    display: 'none',
  },
  endButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LiveBroadcastScreen;

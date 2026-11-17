import React, {memo} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  RenderModeType,
  RtcSurfaceView,
  VideoSourceType,
} from 'react-native-agora';
import {AppText} from '../../../../components/common/AppText';
import {useTheme} from '../../../../hooks/useTheme';
import {LiveInteractionRequest} from '../../domain/liveInteractionTypes';

interface ActiveLiveInteractionOverlayProps {
  request: LiveInteractionRequest;
  guestName: string;
  guestUid: number | null;
  isGuestVideoOn: boolean;
  onEnd: () => void;
}

export const ActiveLiveInteractionOverlay = memo(
  ({
    request,
    guestName,
    guestUid,
    isGuestVideoOn,
    onEnd,
  }: ActiveLiveInteractionOverlayProps) => {
    const {theme} = useTheme();
    const colors = theme.colors;
    const isVideo = request.interactionType === 'VIDEO';
    const showVideo =
      isVideo && guestUid != null && isGuestVideoOn;

    return (
      <View style={styles.wrap} pointerEvents="box-none">
        <View style={styles.panel}>
          {showVideo ? (
            <RtcSurfaceView
              style={styles.video}
              canvas={{
                uid: guestUid!,
                sourceType: VideoSourceType.VideoSourceRemote,
                renderMode: RenderModeType.RenderModeHidden,
              }}
            />
          ) : (
            <View style={styles.audioFallback}>
              <View
                style={[
                  styles.avatar,
                  {backgroundColor: colors.cosmicLight ?? '#262667'},
                ]}>
                <Icon name="person" size={28} color={colors.white} />
              </View>
              <AppText variant="caption" color="rgba(255,255,255,0.75)">
                {isVideo ? 'Waiting for video…' : 'Audio connected'}
              </AppText>
            </View>
          )}

          <View style={styles.meta}>
            <AppText variant="caption" color="rgba(255,255,255,0.7)">
              {isVideo ? 'Video interaction' : 'Audio interaction'}
            </AppText>
            <AppText
              variant="body2"
              color={colors.white}
              numberOfLines={1}
              style={styles.name}>
              {guestName}
            </AppText>
          </View>

          <TouchableOpacity
            style={[styles.endButton, {backgroundColor: colors.error}]}
            onPress={onEnd}
            accessibilityLabel="End interaction">
            <Icon name="call" size={18} color={colors.white} />
            <AppText variant="caption" color={colors.white}>
              End
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

ActiveLiveInteractionOverlay.displayName = 'ActiveLiveInteractionOverlay';

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 72,
    right: 12,
    zIndex: 30,
  },
  panel: {
    width: 140,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(10,10,30,0.9)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  video: {
    width: 140,
    height: 180,
    backgroundColor: '#000',
  },
  audioFallback: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
  },
  name: {
    marginTop: 2,
  },
  endButton: {
    margin: 8,
    height: 36,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});

export default ActiveLiveInteractionOverlay;

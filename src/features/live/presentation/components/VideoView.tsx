import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';

const { width, height } = Dimensions.get('window');

interface VideoViewProps {
  isLive?: boolean;
}

export const VideoView: React.FC<VideoViewProps> = ({ isLive = false }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.cosmicDeep }]}>
      <View style={styles.videoPlaceholder}>
        <View style={styles.videoContent}>
          <View style={[styles.cameraCircle, { borderColor: colors.primary }]}>
            <View
              style={[
                styles.innerCircle,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            />
          </View>
          {!isLive && (
            <View style={styles.previewText}>
              <View
                style={[
                  styles.previewBadge,
                  { backgroundColor: colors.surfaceSecondary },
                ]}>
                <View
                  style={[
                    styles.badgeDot,
                    { backgroundColor: colors.textTertiary },
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      </View>
      {isLive && (
        <View style={styles.liveIndicator}>
          <View style={[styles.liveBadge, { backgroundColor: colors.error }]}>
            <View style={[styles.pulseRing, { borderColor: colors.error }]} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContent: {
    alignItems: 'center',
  },
  cameraCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  previewText: {
    marginTop: 20,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  liveIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  liveBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pulseRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    top: -6,
    left: -6,
    opacity: 0.5,
  },
});

export default VideoView;

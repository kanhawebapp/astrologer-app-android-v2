import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { AppText } from '../../../../components/common/AppText';

interface LiveHeaderProps {
  viewerCount: number;
  duration: number;
  title?: string;
}

const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const LiveHeader: React.FC<LiveHeaderProps> = ({
  viewerCount,
  duration,
  title = 'Live Session',
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [isPulsing, setIsPulsing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.liveBadge, { backgroundColor: colors.error }]}>
        <View
          style={[
            styles.pulseDot,
            { backgroundColor: colors.white },
            isPulsing && { opacity: 0.5 },
          ]}
        />
        <AppText
          variant="caption"
          style={{ color: colors.white, marginLeft: 4 }}>
          LIVE
        </AppText>
      </View>
      <View
        style={[styles.statsContainer, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
        <View style={styles.statItem}>
          <AppText variant="caption" style={{ color: colors.white }}>
            👁 {viewerCount}
          </AppText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.white }]} />
        <View style={styles.statItem}>
          <AppText variant="caption" style={{ color: colors.white }}>
            ⏱ {formatDuration(duration)}
          </AppText>
        </View>
      </View>
      {title && (
        <View
          style={[
            styles.titleContainer,
            { backgroundColor: 'rgba(0,0,0,0.6)' },
          ]}>
          <AppText
            variant="caption"
            style={{ color: colors.white }}
            numberOfLines={1}>
            {title}
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statItem: {
    paddingHorizontal: 6,
  },
  statDivider: {
    width: 1,
    height: 12,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    maxWidth: 150,
  },
});

export default LiveHeader;

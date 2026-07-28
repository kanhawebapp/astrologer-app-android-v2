import React, { memo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface StatusIndicatorProps {
  isOnline: boolean;
  pulseStyle?: {
    transform: Array<{ scale: Animated.AnimatedInterpolation<number> }>;
  };
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = memo(
  ({ isOnline, pulseStyle }) => {
    if (isOnline) {
      return (
        <View style={styles.orbContainer}>
          {pulseStyle && (
            <Animated.View style={[styles.statusIndicatorGlow, pulseStyle]} />
          )}
          <View style={styles.statusOrb}>
            <View style={styles.statusOrbInner} />
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.statusOrb, styles.statusOrbOffline]}>
        <View style={[styles.statusOrbInner, styles.statusOrbInnerOffline]} />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  orbContainer: {
    position: 'relative',
    marginRight: 14,
  },
  statusIndicatorGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    opacity: 0.25,
    top: -10,
    left: -10,
  },
  statusOrb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOrbOffline: {
    backgroundColor: '#6B7280',
  },
  statusOrbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  statusOrbInnerOffline: {
    backgroundColor: '#E5E7EB',
  },
});

import React, { memo, ReactNode, useMemo } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../../../hooks/useTheme';
import { useTimeTheme } from './hooks/useTimeTheme';
import { borderRadius } from './theme/timeThemeColors';

interface HeaderContainerProps {
  children: ReactNode;
  animatedStyle?: ViewStyle;
}

export const HeaderContainer: React.FC<HeaderContainerProps> = memo(
  ({ children, animatedStyle }) => {
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const timeTheme = useTimeTheme();

    const glassColors = useMemo(() => {
      if (isDark) {
        return [
          'rgba(30, 30, 60, 0.7)',
          'rgba(40, 40, 80, 0.6)',
          'rgba(20, 20, 50, 0.75)',
        ];
      }
      return (
        timeTheme.colors.glassGradient || [
          'rgba(255, 255, 255, 0.75)',
          'rgba(248, 248, 255, 0.65)',
          'rgba(240, 240, 250, 0.7)',
        ]
      );
    }, [isDark, timeTheme.colors.glassGradient]);  

    return (
      <View style={styles.container}> 
        <LinearGradient
          colors={glassColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glassBackground}
          borderRadius={borderRadius.xxl}>
          <View style={styles.glassHighlight} />
        </LinearGradient>
        {isDark && (
          <LinearGradient
            colors={['rgba(139, 133, 255, 0.08)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.accentOverlay}
          />
        )}
        <Animated.View style={[styles.content, animatedStyle]}>
          {children}
        </Animated.View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 1,
  },
  accentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    opacity: 0.5,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

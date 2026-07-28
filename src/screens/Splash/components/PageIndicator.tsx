import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

interface PageIndicatorProps {
  totalPages: number;
  currentPage: number;
  dotAnim: Animated.Value;
}

export const PageIndicator: React.FC<PageIndicatorProps> = ({
  totalPages,
  currentPage,
  dotAnim,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: totalPages }, (_, i) => {
        const isActive = i === currentPage;
        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: isActive
                  ? theme.colors.accentGold
                  : theme.colors.accentGoldLight,
                width: isActive
                  ? Animated.multiply(dotAnim, 10).interpolate({
                      inputRange: [0, 10],
                      outputRange: [8, 28],
                    })
                  : 8,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

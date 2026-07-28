import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';

interface SkeletonLoaderProps {
  type: 'header' | 'card' | 'list';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type }) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  if (type === 'header') {
    return (
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: theme.colors.surface },
        ]}>
        <Animated.View
          style={[
            styles.avatar,
            { opacity, backgroundColor: theme.colors.border },
          ]}
        />
        <View style={styles.headerTextContainer}>
          <Animated.View
            style={[
              styles.textLine,
              { opacity, backgroundColor: theme.colors.border },
            ]}
          />
          <Animated.View
            style={[
              styles.textLineShort,
              { opacity, backgroundColor: theme.colors.border },
            ]}
          />
        </View>
      </View>
    );
  }

  if (type === 'card') {
    return (
      <View
        style={[
          styles.cardContainer,
          { backgroundColor: theme.colors.surface },
        ]}>
        <Animated.View
          style={[
            styles.cardLine,
            { opacity, backgroundColor: theme.colors.border },
          ]}
        />
        <Animated.View
          style={[
            styles.cardLine,
            { opacity, backgroundColor: theme.colors.border },
          ]}
        />
        <Animated.View
          style={[
            styles.cardLineShort,
            { opacity, backgroundColor: theme.colors.border },
          ]}
        />
      </View>
    );
  }

  return (
    <View
      style={[styles.listContainer, { backgroundColor: theme.colors.surface }]}>
      {[1, 2, 3, 4].map(i => (
        <Animated.View
          key={i}
          style={[
            styles.listLine,
            { opacity, backgroundColor: theme.colors.border },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    flexDirection: 'row',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  textLine: {
    height: 16,
    width: '70%',
    borderRadius: 4,
    marginBottom: 8,
  },
  textLineShort: {
    height: 16,
    width: '40%',
    borderRadius: 4,
  },
  cardContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  cardLine: {
    height: 14,
    width: '100%',
    borderRadius: 4,
    marginBottom: 8,
  },
  cardLineShort: {
    height: 14,
    width: '50%',
    borderRadius: 4,
  },
  listContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  listLine: {
    height: 20,
    width: '100%',
    borderRadius: 4,
    marginBottom: 12,
  },
});

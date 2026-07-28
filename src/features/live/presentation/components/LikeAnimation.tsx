import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';

const { width, height } = Dimensions.get('window');

interface LikeAnimationProps {
  isActive: boolean;
  count?: number;
}

const generateHeartStyle = () => {
  const horizontalPosition = Math.random() * (width - 100) + 20;
  const size = Math.random() * 20 + 20;
  const rotation = Math.random() * 30 - 15;
  return {
    left: horizontalPosition,
    fontSize: size,
    transform: [{ rotate: `${rotation}deg` }],
  };
};

const HeartItem: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [heartStyle] = useState(generateHeartStyle());

  useEffect(() => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  }, [animatedValue, onComplete]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [height - 200, 100],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.heart,
        {
          left: heartStyle.left,
          transform: [
            { translateY },
            { rotate: heartStyle.transform[0].rotate },
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 0.2, 1],
                outputRange: [0.5, 1.2, 1],
              }),
            },
          ],
          opacity,
        },
      ]}>
      <View style={[styles.heartShape, { transform: [{ rotate: '-45deg' }] }]}>
        <View
          style={[styles.heartLeft, { backgroundColor: colors.secondary }]}
        />
        <View
          style={[styles.heartRight, { backgroundColor: colors.secondary }]}
        />
      </View>
    </Animated.View>
  );
};

export const LikeAnimation: React.FC<LikeAnimationProps> = ({
  isActive,
  count = 0,
}) => {
  const [hearts, setHearts] = useState<number[]>([]);
  const heartIdRef = useRef(0);

  useEffect(() => {
    if (isActive && count > 0) {
      const newHearts: number[] = [];
      for (let i = 0; i < Math.min(count, 5); i++) {
        newHearts.push(heartIdRef.current++);
      }
      setHearts(prev => [...prev, ...newHearts]);
    }
  }, [isActive, count]);

  const removeHeart = (id: number) => {
    setHearts(prev => prev.filter(heartId => heartId !== id));
  };

  if (!isActive || hearts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {hearts.map(id => (
        <HeartItem key={id} onComplete={() => removeHeart(id)} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 200,
    width: 80,
    height: 300,
    overflow: 'hidden',
  },
  heart: {
    position: 'absolute',
    bottom: 0,
  },
  heartShape: {
    width: 20,
    height: 20,
  },
  heartLeft: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    left: 0,
  },
  heartRight: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    left: 10,
  },
});

export default LikeAnimation;

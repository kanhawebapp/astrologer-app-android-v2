import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { AppText } from '../../../../components/common/AppText';
import { GiftEvent } from '../../domain/types';
import { GiftType } from '../../domain/liveEnums';

const { width } = Dimensions.get('window');

interface GiftPopupProps {
  gift: GiftEvent | null;
}

const getGiftEmoji = (type: GiftType): string => {
  switch (type) {
    case GiftType.COINS:
      return '🪙';
    case GiftType.HEART:
      return '❤️';
    case GiftType.STAR:
      return '⭐';
    case GiftType.DIAMOND:
      return '💎';
    case GiftType.CROWN:
      return '👑';
    case GiftType.ROCKET:
      return '🚀';
    default:
      return '🎁';
  }
};

export const GiftPopup: React.FC<GiftPopupProps> = ({ gift }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (gift) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleValue, {
            toValue: 1,
            friction: 4,
            tension: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2500),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [gift, animatedValue, scaleValue]);

  if (!gift) {
    return null;
  }

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale: scaleValue }],
          opacity: animatedValue,
        },
      ]}>
      <View style={[styles.popup, { backgroundColor: colors.surface }]}>
        <View style={styles.iconContainer}>
          <AppText style={styles.emoji}>{getGiftEmoji(gift.giftType)}</AppText>
        </View>
        <View style={styles.textContainer}>
          <AppText variant="caption" style={{ color: colors.text }}>
            {gift.username}
          </AppText>
          <AppText variant="caption" style={{ color: colors.textSecondary }}>
            sent{' '}
            <AppText
              variant="caption"
              style={{ color: colors.accentGold, fontWeight: '700' }}>
              {gift.amount}{' '}
              {gift.giftType === GiftType.COINS
                ? 'coins'
                : getGiftEmoji(gift.giftType)}
            </AppText>
          </AppText>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 150,
    left: width / 2 - 80,
    zIndex: 20,
  },
  popup: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  textContainer: {
    marginLeft: 8,
  },
});

export default GiftPopup;

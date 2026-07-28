import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { AppText } from '../../../../components/common/AppText';
import { Remedy } from '../../domain/types';
import { RemedyType } from '../../domain/liveEnums';

interface RemedyCardProps {
  remedy: Remedy;
  onPress?: () => void;
}

export const RemedyCard: React.FC<RemedyCardProps> = ({ remedy, onPress }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const isPaid = remedy.type === RemedyType.PAID;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isPaid
            ? colors.accentGoldLight
            : colors.surfaceSecondary,
        },
        isPaid && { borderColor: colors.accentGold, borderWidth: 1 },
      ]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.header}>
        <AppText
          variant="caption"
          style={[
            styles.title,
            { color: isPaid ? colors.accentGold : colors.text },
          ]}
          numberOfLines={1}>
          {remedy.title}
        </AppText>
        {isPaid && remedy.price && (
          <View
            style={[styles.priceBadge, { backgroundColor: colors.accentGold }]}>
            <AppText
              variant="caption"
              style={{ color: colors.white, fontSize: 10 }}>
              {remedy.price} 🪙
            </AppText>
          </View>
        )}
      </View>
      <AppText
        variant="caption"
        style={{ color: colors.textSecondary }}
        numberOfLines={2}>
        {remedy.description}
      </AppText>
      <View style={styles.footer}>
        <AppText
          variant="caption"
          style={{ color: colors.textTertiary, fontSize: 10 }}>
          {isPaid ? '🔒 Premium Remedy' : '🌟 Free Remedy'}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontWeight: '700',
    flex: 1,
  },
  priceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  footer: {
    marginTop: 8,
  },
});

export default RemedyCard;

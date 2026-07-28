import React from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {AppText} from '../../../../components';

interface ReviewActionCardProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  theme: any;
  icon?: string;
}

const ReviewActionCard: React.FC<ReviewActionCardProps> = ({
  title,
  subtitle,
  onPress,
  theme,
  icon = 'chevron-forward',
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={onPress}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border + '40',
          },
        ]}>
        {/* Left Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.colors.primary + '15',
            },
          ]}>
          <Ionicons
            name="analytics-outline"
            size={20}
            color={theme.colors.primary}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <AppText
            variant="body2"
            color={theme.colors.text}
            style={styles.title}>
            {title}
          </AppText>

          {!!subtitle && (
            <AppText
              variant="caption"
              color={theme.colors.textSecondary}
              style={styles.subtitle}>
              {subtitle}
            </AppText>
          )}
        </View>

        {/* Right Arrow */}
        <Ionicons
          name={icon}
          size={18}
          color={theme.colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ReviewActionCard;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 2,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    marginLeft: 14,
  },

  title: {
    fontSize: 15,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 3,
    lineHeight: 18,
  },
});


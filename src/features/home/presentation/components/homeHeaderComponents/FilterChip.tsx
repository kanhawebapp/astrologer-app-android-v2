import React, { memo } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../../hooks';
import { AppText } from '../../../../../components';

interface Props {
  label: string;
  icon?: string;
  selected: boolean;
  scale: Animated.Value;
  onPress: () => void;
}

export const FilterChip = memo(
  ({
    label,
    icon,
    selected,
    scale,
    onPress,
  }: Props) => {
    const { theme } = useTheme();

    return (
      <Animated.View
        style={{
          transform: [{ scale }],
        }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          style={[
            styles.chip,
            {
              backgroundColor: selected
                ? theme.colors.primary
                : theme.colors.surfaceSecondary,
              borderColor: selected
                ? theme.colors.primary
                : theme.colors.border,
            },
          ]}>
          {icon && (
            <Icon
              name={icon}
              size={14}
              color={
                selected
                  ? theme.colors.white
                  : theme.colors.textTertiary
              }
            />
          )}

          <AppText
            variant="caption"
            style={{
              marginLeft: 6,
              color: selected
                ? theme.colors.white
                : theme.colors.textSecondary,
              fontWeight: selected ? '600' : '500',
            }}>
            {label}
          </AppText>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
  },
});
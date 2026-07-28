import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../../../components/common/AppText';
import { useTheme } from '../../../../../../hooks/useTheme';

interface PriceInputProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  minValue: number;
  maxValue: number;
  icon: string;
  color: string;
  error?: string;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  label,
  value,
  onIncrement,
  onDecrement,
  minValue,
  maxValue,
  icon,
  color,
  error,
}) => {
  const { theme } = useTheme();
  const isAtMin = value <= minValue;
  const isAtMax = value >= maxValue;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={18} color={color} />
        </View>
        <View style={styles.labelText}>
          <AppText variant="body1" color={theme.colors.text}>
            {label}
          </AppText>
          <AppText variant="caption" color={theme.colors.textTertiary}>
            ₹{minValue} - ₹{maxValue}/min
          </AppText>
        </View>
      </View>

      <View style={styles.stepperContainer}>
        <TouchableOpacity
          onPress={onDecrement}
          disabled={isAtMin}
          style={[
            styles.stepperButton,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              opacity: isAtMin ? 0.4 : 1,
            },
          ]}
          activeOpacity={0.7}>
          <Icon
            name="remove"
            size={20}
            color={isAtMin ? theme.colors.textTertiary : theme.colors.text}
          />
        </TouchableOpacity>

        <View style={[styles.priceDisplay, { borderColor: color }]}>
          <AppText variant="h4" color={color}>
            ₹{value}
          </AppText>
          <AppText variant="caption" color={theme.colors.textTertiary}>
            /min
          </AppText>
        </View>

        <TouchableOpacity
          onPress={onIncrement}
          disabled={isAtMax}
          style={[
            styles.stepperButton,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              opacity: isAtMax ? 0.4 : 1,
            },
          ]}
          activeOpacity={0.7}>
          <Icon
            name="add"
            size={20}
            color={isAtMax ? theme.colors.textTertiary : theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      {error && (
        <AppText
          variant="caption"
          color={theme.colors.error}
          style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  labelText: {
    flex: 1,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceDisplay: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 100,
  },
  errorText: {
    marginTop: 8,
    marginLeft: 4,
    textAlign: 'center',
  },
});

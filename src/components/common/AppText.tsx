import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { TypographyVariant } from '../../theme/typography';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body1',
  color,
  align,
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const textStyle = StyleSheet.flatten([
    theme.typography[variant],
    { color: color || theme.colors.text },
    align && { textAlign: align },
    style,
  ]);

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

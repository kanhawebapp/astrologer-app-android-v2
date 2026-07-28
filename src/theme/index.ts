import { lightColors, darkColors, ThemeColors } from './colors';
import { typography, TypographyVariant } from './typography';
import { spacing, borderRadius } from './spacing';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  mode: ThemeMode;
}

export const createTheme = (mode: ThemeMode): Theme => ({
  colors: mode === 'dark' ? darkColors : lightColors,
  typography,
  spacing,
  borderRadius,
  mode,
});

export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');

export { lightColors, darkColors, typography, spacing, borderRadius };
export type { ThemeColors, TypographyVariant };

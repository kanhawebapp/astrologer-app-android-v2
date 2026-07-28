import { useMemo } from 'react';
import {
  TimeOfDay,
  timeThemeConfig,
  ThemeColors,
} from '../theme/timeThemeColors';

export interface TimeTheme {
  timeOfDay: TimeOfDay;
  colors: ThemeColors;
  gradientColors: string[];
  greeting: string;
  subtitle: string;
}

const getGreetingByTime = (timeOfDay: TimeOfDay): string => {
  switch (timeOfDay) {
    case 'morning':
      return 'Good Morning';
    case 'afternoon':
      return 'Good Afternoon';
    case 'evening':
      return 'Good Evening';
    case 'night':
      return 'Good Evening';
    default:
      return 'Hello';
  }
};

const getSubtitleByTime = (timeOfDay: TimeOfDay): string => {
  switch (timeOfDay) {
    case 'morning':
      return 'A fresh cosmic start ✨';
    case 'afternoon':
      return 'Your energy is aligned ☀️';
    case 'evening':
      return 'Unwind with cosmic clarity 🌇';
    case 'night':
      return 'The universe speaks tonight 🌙';
    default:
      return 'Welcome!';
  }
};

const determineTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'afternoon';
  }
  if (hour >= 17 && hour < 20) {
    return 'evening';
  }
  return 'night';
};

export const useTimeTheme = (): TimeTheme => {
  const timeOfDay = useMemo(() => determineTimeOfDay(), []);

  const theme = useMemo(() => {
    const colors = timeThemeConfig[timeOfDay];
    return {
      timeOfDay,
      colors,
      gradientColors: colors.gradient,
      greeting: getGreetingByTime(timeOfDay),
      subtitle: getSubtitleByTime(timeOfDay),
    };
  }, [timeOfDay]);

  return theme;
};

export { determineTimeOfDay, getGreetingByTime, getSubtitleByTime };
export type { TimeOfDay };

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ThemeColors {
  gradient: string[];
  glassGradient: string[];
  primaryGradient?: string[];
  secondaryGradient?: string[];
  backgroundElements: BackgroundElements;
  text: TextColors;
  accent: string;
  glow: string;
}

export interface BackgroundElements {
  celestial?: CelestialBody;
  stars?: Star[];
  glow?: boolean;
}

export interface CelestialBody {
  type: 'sun' | 'moon';
  position: { top: number; right: number };
  size: number;
  glowColor: string;
  pulseAnimation?: boolean;
}

export interface Star {
  position: { left: string | number; top: string | number };
  size: number;
  twinkleAnimation?: boolean;
}

export interface TextColors {
  greeting: string;
  subtitle: string;
  date: string;
}

const morningTheme: ThemeColors = {
  gradient: ['#FFB75E', '#ED8F03', '#87CEEB'],
  glassGradient: [
    'rgba(255,183,94,0.15)',
    'rgba(237,143,3,0.12)',
    'rgba(135,206,235,0.08)',
  ],
  primaryGradient: ['#FFB75E', '#ED8F03'],
  secondaryGradient: ['#87CEEB', '#E0F2FE'],
  backgroundElements: {
    celestial: {
      type: 'sun',
      position: { top: -35, right: -25 },
      size: 90,
      glowColor: '#FFD700',
      pulseAnimation: true,
    },
    stars: [],
    glow: true,
  },
  text: {
    greeting: '#9A3412',
    subtitle: '#B45309',
    date: '#92400E',
  },
  accent: '#F59E0B',
  glow: '#FCD34D',
};

const afternoonTheme: ThemeColors = {
  gradient: ['#4FACFE', '#FFFFFF', '#00F2FE'],
  glassGradient: [
    'rgba(79,172,254,0.12)',
    'rgba(255,255,255,0.15)',
    'rgba(0,242,254,0.08)',
  ],
  primaryGradient: ['#4FACFE', '#00F2FE'],
  secondaryGradient: ['#FFFFFF', '#E0F2FE'],
  backgroundElements: {
    stars: [],
  },
  text: {
    greeting: '#1E40AF',
    subtitle: '#1D4ED8',
    date: '#1E3A8A',
  },
  accent: '#0EA5E9',
  glow: '#38BDF8',
};

const eveningTheme: ThemeColors = {
  gradient: ['#FF7E5F', '#FD3A69', '#7F00FF'],
  glassGradient: [
    'rgba(255,126,95,0.12)',
    'rgba(253,58,105,0.1)',
    'rgba(127,0,255,0.08)',
  ],
  primaryGradient: ['#FF7E5F', '#FD3A69'],
  secondaryGradient: ['#7F00FF', '#A855F7'],
  backgroundElements: {
    celestial: {
      type: 'sun',
      position: { top: -25, right: -15 },
      size: 70,
      glowColor: '#FF7E5F',
      pulseAnimation: true,
    },
    stars: [
      {
        position: { left: '20%', top: '15%' },
        size: 2,
        twinkleAnimation: true,
      },
      {
        position: { left: '70%', top: '20%' },
        size: 2,
        twinkleAnimation: true,
      },
    ],
  },
  text: {
    greeting: '#7C2D12',
    subtitle: '#9A3412',
    date: '#7C2D12',
  },
  accent: '#EA580C',
  glow: '#FB923C',
};

const nightTheme: ThemeColors = {
  gradient: ['#141E30', '#243B55', '#000000'],
  glassGradient: [
    'rgba(20,30,48,0.85)',
    'rgba(36,59,85,0.75)',
    'rgba(0,0,0,0.9)',
  ],
  primaryGradient: ['#141E30', '#243B55'],
  secondaryGradient: ['#1A2744', '#0D1520'],
  backgroundElements: {
    stars: [
      {
        position: { left: '12%', top: '8%' },
        size: 3,
        twinkleAnimation: true,
      },
      {
        position: { left: '22%', top: '22%' },
        size: 2,
        twinkleAnimation: true,
      },
      {
        position: { left: '72%', top: '12%' },
        size: 3,
        twinkleAnimation: true,
      },
      {
        position: { left: '82%', top: '28%' },
        size: 2,
        twinkleAnimation: true,
      },
      { position: { left: '48%', top: '3%' }, size: 2, twinkleAnimation: true },
      {
        position: { left: '35%', top: '35%' },
        size: 1.5,
        twinkleAnimation: true,
      },
      {
        position: { left: '65%', top: '38%' },
        size: 1.5,
        twinkleAnimation: true,
      },
    ],
    celestial: {
      type: 'moon',
      position: { top: -30, right: -20 },
      size: 55,
      glowColor: '#FEF3C7',
      pulseAnimation: true,
    },
  },
  text: {
    greeting: '#E0E7FF',
    subtitle: '#C7D2FE',
    date: '#A5B4FC',
  },
  accent: '#8B5CF6',
  glow: '#A78BFA',
};

export const timeThemeConfig: Record<TimeOfDay, ThemeColors> = {
  morning: morningTheme,
  afternoon: afternoonTheme,
  evening: eveningTheme,
  night: nightTheme,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const borderRadius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
};

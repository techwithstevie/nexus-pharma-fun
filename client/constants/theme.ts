export const tokens = {
  color: {
    bg: {
      base: '#050505',
      elevated: '#0A0A0A',
      surface: '#111111',
      surfaceHover: '#161616',
      muted: '#1A1A1A',
      overlay: 'rgba(0,0,0,0.72)',
    },
    border: {
      subtle: '#1F1F1F',
      default: '#2A2A2A',
      strong: '#3A3A3A',
      focus: '#5B8DEF',
    },
    text: {
      primary: '#F5F5F5',
      secondary: '#A1A1AA',
      tertiary: '#71717A',
      inverse: '#050505',
      brand: '#8BB4FF',
    },
    brand: {
      primary: '#5B8DEF',
      primaryHover: '#7AA3F5',
      soft: 'rgba(91, 141, 239, 0.12)',
      border: 'rgba(91, 141, 239, 0.35)',
    },
    accent: {
      teal: '#2DD4BF',
      tealSoft: 'rgba(45, 212, 191, 0.12)',
    },
    status: {
      success: '#34D399',
      successSoft: 'rgba(52, 211, 153, 0.12)',
      warning: '#FBBF24',
      warningSoft: 'rgba(251, 191, 36, 0.12)',
      danger: '#F87171',
      dangerSoft: 'rgba(248, 113, 113, 0.12)',
      info: '#60A5FA',
      infoSoft: 'rgba(96, 165, 250, 0.12)',
      neutral: '#A1A1AA',
      neutralSoft: 'rgba(161, 161, 170, 0.12)',
    },
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  typography: {
    display: 30,
    h1: 24,
    h2: 18,
    h3: 15,
    body: 15,
    bodySmall: 13,
    caption: 11,
    label: 12,
  },
  shadow: {
    glow: {
      shadowColor: '#5B8DEF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 0,
    },
  },
} as const;

// legacy aliases so older imports don't crash
export const Colors = {
  primary: tokens.color.brand.primary,
  primaryLight: tokens.color.brand.primaryHover,
  accent: tokens.color.accent.teal,
  accentLight: tokens.color.accent.tealSoft,
  success: tokens.color.status.success,
  warning: tokens.color.status.warning,
  error: tokens.color.status.danger,
  background: tokens.color.bg.base,
  card: tokens.color.bg.surface,
  text: tokens.color.text.primary,
  textSecondary: tokens.color.text.secondary,
  border: tokens.color.border.default,
  white: '#FFFFFF',
} as const;

export const Spacing = {
  xs: tokens.spacing[1],
  sm: tokens.spacing[2],
  md: tokens.spacing[4],
  lg: tokens.spacing[6],
  xl: tokens.spacing[8],
  xxl: tokens.spacing[12],
} as const;

export const FontSize = {
  xs: tokens.typography.caption,
  sm: tokens.typography.bodySmall,
  md: tokens.typography.body,
  lg: tokens.typography.h3,
  xl: tokens.typography.h2,
  xxl: tokens.typography.h1,
  xxxl: tokens.typography.display,
} as const;

export const Radius = {
  sm: tokens.radius.sm,
  md: tokens.radius.md,
  lg: tokens.radius.lg,
  full: tokens.radius.full,
} as const;
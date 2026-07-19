export const tokens = {
  color: {
    brand: {
      950: '#071B35',
      900: '#0B2748',
      800: '#12385F',
      700: '#1B4F7A',
      600: '#256B9A',
      100: '#E8F1F8',
      50: '#F3F8FC',
    },
    accent: {
      700: '#0E7490',
      600: '#0891B2',
      100: '#CFFAFE',
      50: '#ECFEFF',
    },
    neutral: {
      950: '#0F172A',
      900: '#111827',
      800: '#1F2937',
      700: '#374151',
      600: '#4B5563',
      500: '#6B7280',
      400: '#9CA3AF',
      300: '#D1D5DB',
      200: '#E5E7EB',
      100: '#F3F4F6',
      50: '#F8FAFC',
      0: '#FFFFFF',
    },
    status: {
      success: '#166534',
      successBg: '#DCFCE7',
      warning: '#92400E',
      warningBg: '#FEF3C7',
      danger: '#991B1B',
      dangerBg: '#FEE2E2',
      info: '#1E40AF',
      infoBg: '#DBEAFE',
      pending: '#6B7280',
      pendingBg: '#F3F4F6',
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
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    full: 999,
  },
  typography: {
    display: 28,
    h1: 22,
    h2: 18,
    h3: 16,
    body: 15,
    bodySmall: 13,
    caption: 12,
    label: 13,
  },
  shadow: {
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  },
} as const;

/** @deprecated use tokens — kept for gradual migration */
export const Colors = {
  primary: tokens.color.brand[900],
  primaryLight: tokens.color.brand[700],
  accent: tokens.color.accent[600],
  accentLight: tokens.color.accent[100],
  success: tokens.color.status.success,
  warning: tokens.color.status.warning,
  error: tokens.color.status.danger,
  background: tokens.color.neutral[50],
  card: tokens.color.neutral[0],
  text: tokens.color.neutral[900],
  textSecondary: tokens.color.neutral[500],
  border: tokens.color.neutral[200],
  white: tokens.color.neutral[0],
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
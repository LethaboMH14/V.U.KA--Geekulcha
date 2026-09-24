/**
 * VIGIL design tokens — the Ivory theme from the prototype reference
 * (prototype/src/index.css). Contrast values are the audited ones:
 * secondary text ≥ 4.9:1 on the ivory base.
 *
 * Colour carries meaning: green only for verified/received, amber only in
 * guardian mode, no red on member screens.
 */
export const colors = {
  bgBase: '#F5F3EE',
  bgSurface: '#FFFFFF',
  bgElevated: '#F2EFE9',
  card: 'rgba(255,255,255,0.72)',
  cardSolid: 'rgba(255,255,255,0.92)',

  textTitle: '#1F2328',
  textLabel: '#2B3037',
  textSecondary: '#5B6068',
  textDim: '#636870',
  textMono: '#3A3F47',
  textInverse: '#FFFFFF',

  action: '#1E3A5F',
  actionDim: 'rgba(30,58,95,0.10)',
  actionText: '#FFFFFF',

  greenFill: '#DCFCE7',
  greenText: '#065F46',
  greenBorder: '#86EFAC',

  border: '#ECE8E0',
  borderSubtle: '#F0ECE4',
  borderEmphasis: '#E2DDD2',
  inputBorder: '#6F747D',

  /** Ink-tinted, single light source (never pure black). */
  shadow: '#1E2C46',
} as const;

export const radii = {
  sm: 12,
  md: 20,
  xl: 28,
  pill: 999,
} as const;

export const space = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
} as const;

export const type = {
  hero: {fontSize: 32, fontWeight: '600' as const, letterSpacing: -0.3, color: colors.textTitle},
  title: {fontSize: 22, fontWeight: '600' as const, color: colors.textTitle},
  eyebrow: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 1.1,
    textTransform: 'uppercase' as const,
    color: colors.textDim,
  },
  body: {fontSize: 15, lineHeight: 22, color: colors.textSecondary},
  label: {fontSize: 15, fontWeight: '600' as const, color: colors.textLabel},
  caption: {fontSize: 13, lineHeight: 19, color: colors.textDim},
  mono: {fontFamily: 'monospace', fontSize: 13, color: colors.textMono},
} as const;

/** Minimum touch target (WCAG 2.5.5 / Android guidance). */
export const TOUCH = 48;

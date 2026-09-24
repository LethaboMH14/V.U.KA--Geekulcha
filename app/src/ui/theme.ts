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
  /** Control edges: 3.1:1 on the ivory base (WCAG 1.4.11), so keys hold in daylight. */
  controlEdge: '#8F897E',

  /** Primary pill gradient, top to bottom (one light source). */
  actionTop: '#2A4C78',
  actionBottom: '#1A3252',
  /** Frosted glass: the hero bezel shell, card edge, and the orb on ink. */
  bezelFill: 'rgba(255,255,255,0.5)',
  glassEdge: 'rgba(255,255,255,0.88)',
  orbOnInk: 'rgba(255,255,255,0.16)',
  ghostFill: 'rgba(255,255,255,0.55)',
  /** Android press ripple: identical on every control, both PIN paths. */
  ripple: 'rgba(30,58,95,0.12)',
  rippleOnInk: 'rgba(255,255,255,0.18)',
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

/** IBM Plex, bundled as Android font assets (OFL). On Android a family name is the file name. */
export const fonts = {
  regular: 'IBMPlexSans-Regular',
  medium: 'IBMPlexSans-Medium',
  semibold: 'IBMPlexSans-SemiBold',
  mono: 'IBMPlexMono-Regular',
} as const;

export const type = {
  hero: {fontFamily: fonts.semibold, fontSize: 32, lineHeight: 36, letterSpacing: -0.3, color: colors.textTitle},
  title: {fontFamily: fonts.semibold, fontSize: 22, color: colors.textTitle},
  eyebrow: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase' as const,
    color: colors.textDim,
  },
  body: {fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.textSecondary},
  label: {fontFamily: fonts.semibold, fontSize: 15, color: colors.textLabel},
  caption: {fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textDim},
  mono: {fontFamily: fonts.mono, fontSize: 13, color: colors.textMono},
} as const;

/** Minimum touch target (WCAG 2.5.5 / Android guidance). */
export const TOUCH = 48;

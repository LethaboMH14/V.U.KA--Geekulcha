/**
 * VIGIL design tokens: the Ivory theme of the design prototype
 * (vuka-ui-proto `src/index.css`), ported to React Native.
 *
 * A warm ivory field with three soft colour orbs, calm white glass cards,
 * one deep-ink action colour, IBM Plex. Colour carries meaning: green only for
 * verified or received, amber only in guardian mode, no red on member screens.
 *
 * Secondary text is ≥ 4.9:1 on the ivory base; control edges ≥ 3:1 (WCAG 1.4.11).
 */
const ivory = {
  bgBase: '#F5F3EE',
  bgSurface: '#FFFFFF',
  bgElevated: '#F2EFE9',

  orb1: '#CFE3D6', // sage
  orb2: '#D6E2F2', // soft sky
  orb3: '#F3DCCB', // warm peach

  card: 'rgba(255,255,255,0.74)',
  cardEdge: 'rgba(255,255,255,0.70)',

  textTitle: '#1F2328',
  textLabel: '#2B3037',
  textSecondary: '#5B6068',
  textDim: '#636870',
  textMono: '#3A3F47',
  textInverse: '#FFFFFF',

  action: '#1E3A5F',
  actionTop: '#2A4A73',
  actionBottom: '#1A3354',
  actionDim: 'rgba(30,58,95,0.10)',
  actionLine: 'rgba(30,58,95,0.40)',

  greenFill: '#DCFCE7',
  greenText: '#065F46',
  greenBorder: '#86EFAC',

  amberFill: '#FEF3C7',
  amberText: '#92400E',
  amberStrong: '#B45309',

  border: '#ECE8E0',
  borderSubtle: '#F0ECE4',
  borderEmphasis: '#E2DDD2',
  inputBorder: '#6F747D',
  controlEdge: '#8F897E',

  /** Ink-tinted shadow, one light source from above. */
  shadow: '#1E2C46',
  ripple: 'rgba(30,58,95,0.08)',
  rippleOnAction: 'rgba(255,255,255,0.18)',
} as const;

/**
 * Older names from the previous theme, mapped onto Ivory so every screen keeps
 * compiling while it is ported. New code uses the names above.
 */
export const colors = {
  ...ivory,
  bgRaised: ivory.bgElevated,
  keyFace: ivory.bgElevated,
  keyFaceTop: ivory.bgSurface,
  keyFacePressed: ivory.borderSubtle,
  topLight: 'rgba(255,255,255,0.6)',
  keyHighlight: 'rgba(255,255,255,0.8)',
  hairline: ivory.border,
  shade: ivory.borderEmphasis,
  textBody: ivory.textSecondary,
  unlit: ivory.borderEmphasis,
  cobalt: ivory.action,
  cobaltTop: ivory.actionTop,
  cobaltBottom: ivory.actionBottom,
  cobaltText: ivory.textInverse,
  cobaltInk: ivory.action,
  green: ivory.greenText,
  greenInk: ivory.greenText,
  greenWash: ivory.greenFill,
  bone: ivory.textLabel,
  guardianBase: '#F7F1E6',
  guardianRaised: ivory.amberFill,
  guardianKeyTop: ivory.amberFill,
  amber: ivory.amberStrong,
  amberTop: '#C2651A',
  amberBottom: '#9A4509',
  amberInk: ivory.amberText,
  onAmber: ivory.textInverse,
  rippleOnSignal: ivory.rippleOnAction,
} as const;

export const radii = {
  key: 14,
  sm: 12,
  md: 20,
  panel: 28,
  bezel: 34,
  round: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** IBM Plex, bundled as Android font assets (OFL). On Android the family is the file name. */
export const fonts = {
  regular: 'IBMPlexSans-Regular',
  medium: 'IBMPlexSans-Medium',
  semibold: 'IBMPlexSans-SemiBold',
  bold: 'IBMPlexSans-SemiBold',
  mono: 'IBMPlexMono-Regular',
  monoMedium: 'IBMPlexMono-Regular',
} as const;

export const type = {
  /** The big state word: Plex SemiBold 32. */
  display: {fontFamily: fonts.semibold, fontSize: 32, lineHeight: 36, letterSpacing: -0.3, color: colors.textTitle},
  title: {fontFamily: fonts.semibold, fontSize: 22, lineHeight: 28, color: colors.textTitle},
  /** Plex Medium 11, uppercase, +10% tracking. */
  eyebrow: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
    textTransform: 'uppercase' as const,
    color: colors.textDim,
  },
  body: {fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.textSecondary},
  label: {fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20, color: colors.textLabel},
  caption: {fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textDim},
  /** Times, counts, hashes: measurement, never decoration. */
  readout: {fontFamily: fonts.mono, fontSize: 13, lineHeight: 18, color: colors.textMono},
  clock: {fontFamily: fonts.mono, fontSize: 24, lineHeight: 30, color: colors.textTitle},
} as const;

/** Minimum touch target (Android 48 dp; WCAG 2.5.5). */
export const TOUCH = 48;

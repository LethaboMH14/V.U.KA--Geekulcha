/**
 * VIGIL design tokens: Functional Industrial. A warm graphite body, bone
 * type, and one cobalt signal (the primary key and the listening lamp).
 *
 * Colour carries meaning and nothing else:
 * - cobalt: the one action and the listening lamp, never decoration;
 * - green: received or verified only;
 * - amber: guardian mode only (its own territory, never on member screens);
 * - no red anywhere on member screens.
 *
 * Contrast (computed, WCAG 2.x): textTitle 14.2:1 and textBody 8.3:1 on
 * bgBase; textDim 5.1:1 on bgBase; white on the cobalt key 4.7:1 or more; controlEdge on
 * bgBase meets 3:1 (1.4.11 non-text).
 */
export const colors = {
  bgBase: '#1B1C1E',
  bgRaised: '#232427',
  keyFace: '#2A2C2F',
  keyFaceTop: '#323438',
  keyFacePressed: '#222326',
  /** One light source from above: a hairline highlight on top edges. */
  topLight: 'rgba(255,255,255,0.07)',
  /** The static 1 px machined highlight along a key's top edge. */
  keyHighlight: 'rgba(255,255,255,0.12)',
  hairline: 'rgba(255,255,255,0.06)',
  shade: '#111214',
  controlEdge: '#6E7076',

  textTitle: '#ECEAE4',
  textBody: '#B8B5AD',
  textDim: '#8F8C85',
  /** Unlit lamp and disabled marks: decorative only, never text. */
  unlit: '#46484D',

  cobalt: '#3D6FD6',
  /** Darkened so white type holds 4.7:1 across the whole gradient. */
  cobaltTop: '#3F6FD4',
  cobaltBottom: '#3363C6',
  cobaltText: '#FFFFFF',
  /** Cobalt for text or icons on graphite (6.8:1). */
  cobaltInk: '#7FA3EE',

  /** Received or verified only. */
  green: '#3FA37A',
  greenInk: '#6FCB9F',
  greenWash: 'rgba(63,163,122,0.14)',

  /** Bone lamp: a guardian who accepted. Not a status colour. */
  bone: '#ECEAE4',

  /** Guardian territory. Never used on member screens. */
  guardianBase: '#241F18',
  guardianRaised: '#2E271E',
  guardianKeyTop: '#3A3126',
  amber: '#D98E2B',
  amberTop: '#E39B3A',
  amberBottom: '#C98021',
  amberInk: '#E9A64A',
  onAmber: '#1B1C1E',

  ripple: 'rgba(255,255,255,0.08)',
  rippleOnSignal: 'rgba(255,255,255,0.18)',
} as const;

export const radii = {
  key: 14,
  panel: 18,
  round: 999,
} as const;

/** 8-point grid. */
export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Hanken Grotesk for words, JetBrains Mono for numbers and readouts (both OFL,
 * bundled as Android font assets). On Android a family name is the file name.
 */
export const fonts = {
  regular: 'HankenGrotesk-Regular',
  medium: 'HankenGrotesk-Medium',
  semibold: 'HankenGrotesk-SemiBold',
  bold: 'HankenGrotesk-Bold',
  mono: 'JetBrainsMono-Regular',
  monoMedium: 'JetBrainsMono-Medium',
} as const;

export const type = {
  /** The state word: "Ready", "Journey active". */
  display: {fontFamily: fonts.semibold, fontSize: 44, lineHeight: 48, letterSpacing: -1.2, color: colors.textTitle},
  title: {fontFamily: fonts.semibold, fontSize: 24, lineHeight: 30, letterSpacing: -0.4, color: colors.textTitle},
  body: {fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.textBody},
  label: {fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, color: colors.textTitle},
  caption: {fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textDim},
  /** Readout values: times, counts, build IDs. Measurement, not costume. */
  readout: {fontFamily: fonts.mono, fontSize: 14, lineHeight: 20, color: colors.textBody},
  clock: {fontFamily: fonts.monoMedium, fontSize: 26, lineHeight: 32, letterSpacing: -0.5, color: colors.textTitle},
} as const;

/** Minimum touch target (Android 48 dp; WCAG 2.5.5). */
export const TOUCH = 48;

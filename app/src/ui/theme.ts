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

/** Glass washes and edges on a light field (Ivory, Silver). */
const lightGlass = {
  dark: false,
  wash: 'rgba(255,255,255,0.5)',
  washHero: 'rgba(255,255,255,0.62)',
  edgeLight: 'rgba(255,255,255,0.9)',
  sheen: '#FFFFFF',
  pillFill: '#FBFAF7',
  fieldFill: 'rgba(255,255,255,0.9)',
  blurType: 'light' as 'light' | 'dark',
};

type Palette = {[K in keyof typeof ivory]: string} & {[K in keyof typeof lightGlass]: (typeof lightGlass)[K]};

/** Silver (prototype): cool blue-grey field, graphite action. */
const silver: Palette = {
  ...ivory,
  ...lightGlass,
  bgBase: '#EEF0F3',
  bgElevated: '#E6E9EE',
  orb1: '#DDE3EA',
  orb2: '#E2E6EE',
  orb3: '#E8E4EA',
  action: '#2B2F36',
  actionTop: '#3A3F48',
  actionBottom: '#22252B',
  actionDim: 'rgba(43,47,54,0.10)',
  actionLine: 'rgba(43,47,54,0.40)',
  border: '#E3E6EC',
  borderSubtle: '#EBEDF1',
  borderEmphasis: '#D7DBE2',
};

/** Midnight (prototype night mode): deep navy field, light text, softer blue action. */
const midnight: Palette = {
  ...ivory,
  ...lightGlass,
  dark: true,
  wash: 'rgba(30,38,56,0.55)',
  washHero: 'rgba(26,33,48,0.70)',
  edgeLight: 'rgba(255,255,255,0.14)',
  sheen: '#FFFFFF',
  pillFill: '#1C2432',
  fieldFill: 'rgba(20,27,40,0.9)',
  blurType: 'dark',
  bgBase: '#0E1420',
  bgSurface: '#141B28',
  bgElevated: '#1C2432',
  orb1: '#2F3F6E',
  orb2: '#24476B',
  orb3: '#3A3560',
  card: 'rgba(30,38,56,0.74)',
  cardEdge: 'rgba(255,255,255,0.14)',
  textTitle: '#F5F6F8',
  textLabel: '#D7DBE2',
  textSecondary: '#A8AFBA',
  textDim: '#9AA1AD',
  textMono: '#C5CCD6',
  textInverse: '#FFFFFF',
  action: '#4166A0',
  actionTop: '#4F77B5',
  actionBottom: '#34588F',
  actionDim: 'rgba(65,102,160,0.16)',
  actionLine: 'rgba(157,184,232,0.5)',
  greenFill: '#0D5C3A',
  greenText: '#86EFAC',
  greenBorder: '#22C55E',
  border: 'rgba(255,255,255,0.10)',
  borderSubtle: 'rgba(255,255,255,0.05)',
  borderEmphasis: 'rgba(255,255,255,0.16)',
  inputBorder: '#7D8595',
  controlEdge: '#7D8595',
  shadow: '#000000',
  ripple: 'rgba(255,255,255,0.08)',
};

export type ThemeName = 'ivory' | 'silver' | 'midnight';
export const THEMES: ThemeName[] = ['ivory', 'silver', 'midnight'];

/**
 * The theme is read once at start-up (styles are built from these tokens
 * when the app loads), from a value the native side keeps; a change applies
 * the next time VIGIL opens.
 */
function chosenTheme(): ThemeName {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {NativeModules} = require('react-native');
    const m = NativeModules?.VigilLocation;
    const t = (typeof m?.getConstants === 'function' ? m.getConstants()?.theme : undefined) ?? m?.theme;
    return THEMES.includes(t) ? t : 'ivory';
  } catch {
    return 'ivory';
  }
}
export const THEME: ThemeName = chosenTheme();
const base: Palette = THEME === 'silver' ? silver : THEME === 'midnight' ? midnight : {...ivory, ...lightGlass};

/**
 * Older names from the previous theme, mapped onto the tokens so every screen
 * keeps compiling while it is ported. New code uses the names above.
 */
export const colors = {
  ...base,
  bgRaised: base.bgElevated,
  keyFace: base.bgElevated,
  keyFaceTop: base.bgSurface,
  keyFacePressed: base.borderSubtle,
  topLight: base.dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.6)',
  keyHighlight: base.dark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.8)',
  hairline: base.border,
  shade: base.borderEmphasis,
  textBody: base.textSecondary,
  unlit: base.borderEmphasis,
  cobalt: base.action,
  cobaltTop: base.actionTop,
  cobaltBottom: base.actionBottom,
  cobaltText: base.textInverse,
  cobaltInk: base.action,
  green: base.greenText,
  greenInk: base.greenText,
  greenWash: base.greenFill,
  bone: base.textLabel,
  guardianBase: base.dark ? '#1A1712' : '#F7F1E6',
  guardianRaised: ivory.amberFill,
  guardianKeyTop: ivory.amberFill,
  amber: ivory.amberStrong,
  amberTop: '#C2651A',
  amberBottom: '#9A4509',
  amberInk: ivory.amberText,
  onAmber: ivory.textInverse,
  rippleOnSignal: ivory.rippleOnAction,
  /** Behind a pop-up: dims the screen so the card reads as on top. */
  scrim: base.dark ? 'rgba(0,0,0,0.62)' : 'rgba(31,35,40,0.42)',
  /** The pop-up card: an opaque surface, never glass, so its words never sit on a blur. */
  dialogFill: base.bgSurface,
} as const;

export const radii = {
  key: 14,
  sm: 12,
  md: 20,
  panel: 28,
  /** Pop-ups (Mutarisi's ThemeOverlay.Vuka.Dialog: 28 dp corners). */
  dialog: 28,
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
  /** A pop-up's title: ink, bold, one step under a screen title. */
  dialogTitle: {fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26, color: colors.textTitle},
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

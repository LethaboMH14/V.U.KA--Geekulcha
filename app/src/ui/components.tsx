/**
 * VIGIL UI primitives in the prototype's Ivory glass (vuka-ui-proto): a warm
 * ivory field with three soft colour orbs, calm white glass cards, the hero
 * card in a thin tray, deep-ink pill buttons, IBM Plex.
 *
 * Colour follows theme.ts: one deep-ink action colour, green only for
 * received or verified, amber only in guardian mode. The Journey check and
 * its keypad stay flat and plain: no glass, no motion (V5, T15).
 */
import React, {useEffect, useRef, useState} from 'react';
import {AccessibilityInfo, Animated, Easing, Modal, Pressable, StyleSheet, Text, View, type ViewStyle} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import Svg, {Defs, LinearGradient, Path, RadialGradient, Rect, Stop} from 'react-native-svg';
import {ArrowLeft, ArrowRight, Backspace, CaretRight} from './icons';
import {colors, fonts, radii, space, TOUCH, type} from './theme';

type Tone = 'member' | 'guardian';

export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.resolve(AccessibilityInfo.isReduceMotionEnabled?.())
      .then(v => alive && setReduce(Boolean(v)))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduce);
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);
  return reduce;
}

/**
 * The field behind every screen: ivory with three soft colour orbs (sage, sky,
 * peach). Still, not drifting: VIGIL runs all day, so the only motion it
 * spends battery on is the listening line.
 */
export function Surface({tone = 'member'}: {tone?: Tone}) {
  const base = tone === 'guardian' ? colors.guardianBase : colors.bgBase;
  const orbs = tone === 'guardian' ? [colors.amberFill, '#F3E4CC', colors.orb1] : [colors.orb1, colors.orb2, colors.orb3];
  return (
    <View style={[StyleSheet.absoluteFill, {backgroundColor: base, overflow: 'hidden'}]} pointerEvents="none">
      <View style={[styles.orb, {top: -120, left: -140}]}>
        <Orb color={orbs[0]} opacity={0.65} id="o1" />
      </View>
      <View style={[styles.orb, {top: 180, right: -180}]}>
        <Orb color={orbs[1]} opacity={0.6} id="o2" />
      </View>
      <View style={[styles.orb, {bottom: -160, left: -60}]}>
        <Orb color={orbs[2]} opacity={0.55} id="o3" />
      </View>
    </View>
  );
}

function Orb({color, opacity, id}: {color: string; opacity: number; id: string}) {
  return (
    <Svg width={420} height={420}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.6" stopColor={color} stopOpacity={opacity * 0.45} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={420} height={420} fill={`url(#${id})`} />
    </Svg>
  );
}

/** A soft white sheen along the top of a glass surface: light from above. */
function Sheen({radius}: {radius: number}) {
  const [w, setW] = useState(0);
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, {borderRadius: radius, overflow: 'hidden'}]}
      onLayout={e => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? (
        <Svg width={w} height={90}>
          <Defs>
            <LinearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.sheen} stopOpacity={colors.dark ? 0.1 : 0.55} />
              <Stop offset="1" stopColor={colors.sheen} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect width={w} height={90} fill="url(#sheen)" />
        </Svg>
      ) : null}
    </View>
  );
}

/**
 * A frosted glass card: the orbs behind it are blurred for real, a white
 * wash and a top sheen sit over the blur, a white hairline edge catches the
 * light, and one soft ink shadow lifts it. `hero` sets it in the thin
 * machined tray (the double bezel). Blur falls back to warm white where the
 * phone can't blur.
 */
export function Panel({
  tone = 'member',
  hero,
  style,
  children,
}: {
  tone?: Tone;
  hero?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}) {
  const card = (
    <View style={[styles.card, hero && styles.cardHero, tone === 'guardian' && styles.cardGuardian, style]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glassClip]}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={colors.blurType}
          blurAmount={18}
          overlayColor="transparent"
          reducedTransparencyFallbackColor={colors.pillFill}
        />
        <View style={[StyleSheet.absoluteFill, {backgroundColor: hero ? colors.washHero : colors.wash}]} />
      </View>
      <Sheen radius={radii.panel} />
      {children}
    </View>
  );
  return hero ? <View style={styles.bezel}>{card}</View> : card;
}

/**
 * Press depth: a surface sinks a little and its shadow tightens while it is
 * pressed, then springs back. Every key and row uses it; the PIN keypad does
 * not (it stays still for both PINs, V5).
 */
export function usePressDepth() {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  const to = (x: number) => {
    if (reduce) return v.setValue(0);
    Animated.spring(v, {toValue: x, useNativeDriver: true, speed: 40, bounciness: x ? 0 : 8}).start();
  };
  return {
    style: {
      transform: [
        {scale: v.interpolate({inputRange: [0, 1], outputRange: [1, 0.965]})},
        {translateY: v.interpolate({inputRange: [0, 1], outputRange: [0, 1.5]})},
      ],
    },
    onPressIn: () => to(1),
    onPressOut: () => to(0),
  };
}

/** An icon in a 40 dp glass circle. */
export function GlassIcon({children}: {children: React.ReactNode}) {
  return <View style={styles.glassCircle}>{children}</View>;
}

/** Plex Medium 11, uppercase, tracked: the small label above a state word. */
export function Eyebrow({children, style}: {children: React.ReactNode; style?: object}) {
  return <Text style={[type.eyebrow, style]}>{children}</Text>;
}

type KeyVariant = 'signal' | 'plain' | 'ghost' | 'guardian' | 'guardianPlain';

/** The deep-ink pill's face: a top-to-bottom ink gradient, measured to its size. */
function InkFace({top, bottom, radius}: {top: string; bottom: string; radius: number}) {
  const [size, setSize] = useState({w: 0, h: 0});
  const id = `ink-${top.slice(1)}`;
  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={e => setSize({w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height})}>
      {size.w > 0 ? (
        <Svg width={size.w} height={size.h}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={top} />
              <Stop offset="1" stopColor={bottom} />
            </LinearGradient>
          </Defs>
          <Rect width={size.w} height={size.h} rx={radius} ry={radius} fill={`url(#${id})`} />
        </Svg>
      ) : null}
      <View style={[styles.inkHighlight, {left: radius * 0.6, right: radius * 0.6}]} />
    </View>
  );
}

/**
 * A pill button, 54 dp tall. `signal` is the deep-ink primary with its arrow
 * orb; `plain` is a glass pill; `ghost` is an outline for the quiet choice.
 */
export function Key({
  label,
  onPress,
  variant = 'plain',
  icon,
  arrow,
  accessibilityHint,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: KeyVariant;
  icon?: React.ReactNode;
  /** Trailing arrow in its own small orb (primary actions that move forward). */
  arrow?: boolean;
  accessibilityHint?: string;
  disabled?: boolean;
}) {
  const ink = variant === 'signal' || variant === 'guardian';
  const textColor = ink ? colors.textInverse : variant === 'ghost' ? colors.textSecondary : variant === 'guardianPlain' ? colors.amberText : colors.textTitle;
  const depth = usePressDepth();
  return (
    <Animated.View style={depth.style}>
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{disabled: Boolean(disabled)}}
      disabled={disabled}
      onPress={onPress}
      onPressIn={depth.onPressIn}
      onPressOut={depth.onPressOut}
      android_ripple={{color: ink ? colors.rippleOnAction : colors.ripple, foreground: true}}
      style={[
        styles.pill,
        ink && styles.pillInk,
        variant === 'guardian' && {backgroundColor: colors.amberBottom, shadowColor: colors.amberStrong},
        variant === 'plain' && styles.pillGlass,
        variant === 'ghost' && styles.pillGhost,
        variant === 'guardianPlain' && styles.pillGuardianPlain,
        disabled && {opacity: 0.4},
      ]}>
      {ink ? (
        <InkFace
          top={variant === 'guardian' ? colors.amberTop : colors.actionTop}
          bottom={variant === 'guardian' ? colors.amberBottom : colors.actionBottom}
          radius={27}
        />
      ) : null}
      {icon ? <View>{icon}</View> : null}
      <Text style={[styles.pillText, {color: textColor}]} maxFontSizeMultiplier={1.6}>
        {label}
      </Text>
      {arrow ? (
        <View style={[styles.arrowOrb, !ink && {backgroundColor: colors.actionDim}]}>
          <ArrowRight size={16} weight="bold" color={ink ? colors.textInverse : colors.action} />
        </View>
      ) : null}
    </Pressable>
    </Animated.View>
  );
}

/** A text-only action for the least important choice on a screen. */
export function QuietKey({label, onPress, tone = 'member'}: {label: string; onPress: () => void; tone?: Tone}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={4} style={({pressed}) => [styles.quiet, pressed && {opacity: 0.6}]}>
      <Text style={[type.label, {color: tone === 'guardian' ? colors.amberText : colors.action}]}>{label}</Text>
    </Pressable>
  );
}

/** Kept for older screens: the primary action as a full-width pill with its arrow. */
export function RoundKey({label, onPress}: {label: string; onPress: () => void}) {
  return <Key label={label} onPress={onPress} variant="signal" arrow />;
}

/** Kept for older screens: a centred readout block. */
export function Dial({children}: {children: React.ReactNode}) {
  return <View style={{alignItems: 'center', gap: space.xs}}>{children}</View>;
}

type LampTone = 'signal' | 'green' | 'bone' | 'amber' | 'unlit';
const LAMP: Record<LampTone, string> = {
  signal: colors.action,
  green: colors.greenText,
  bone: colors.textLabel,
  amber: colors.amberStrong,
  unlit: colors.borderEmphasis,
};

/**
 * A 7 dp status dot. `breathing` is for the listening dot alone: a slow
 * 4.8 s cycle, off under reduced motion. The words beside it carry the state.
 */
export function Lamp({tone, breathing, hollow}: {tone: LampTone; breathing?: boolean; hollow?: boolean}) {
  const reduce = useReduceMotion();
  const level = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!breathing || reduce) {
      level.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(level, {toValue: 0.35, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true}),
        Animated.timing(level, {toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathing, reduce, level]);
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[styles.lamp, hollow ? {borderWidth: 1.5, borderColor: colors.controlEdge} : {backgroundColor: LAMP[tone]}, {opacity: level}]}
    />
  );
}

type ChipStatus = 'received' | 'verified' | 'queued' | 'neutral' | 'simulated';
/** A small glass pill with a dot and a word. Green only for a real receipt or verification. */
export function Chip({status, label}: {status: ChipStatus; label: string}) {
  const dot = status === 'received' || status === 'verified' ? colors.greenText : colors.textDim;
  const mono = status === 'simulated';
  return (
    <View style={styles.chip} accessible accessibilityLabel={label}>
      <View style={[styles.chipDot, {backgroundColor: dot}]} />
      <Text style={[styles.chipText, mono && styles.chipMono]}>{label}</Text>
    </View>
  );
}

/** One readout line: a word on the left, a measured value on the right. */
export function Readout({label, value, lamp}: {label: string; value: string; lamp?: React.ReactNode}) {
  const measured = /\d/.test(value);
  return (
    <View style={styles.readout} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={[type.body, {flexShrink: 1}]}>{label}</Text>
      <View style={styles.readoutValue}>
        {lamp}
        <Text style={[measured ? type.readout : type.body, {color: colors.textTitle}]}>{value}</Text>
      </View>
    </View>
  );
}

/** A top bar: a back arrow in a 48 dp target and the screen title. */
/** `center`: the title centred across the bar (Mutarisi's Settings, 012f997). */
export function TopAppBar({title, onBack, tone = 'member', center = false}: {title: string; onBack: () => void; tone?: Tone; center?: boolean}) {
  return (
    <View style={styles.appBar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Navigate up"
        onPress={onBack}
        android_ripple={{color: colors.ripple, borderless: true, radius: 24}}
        style={styles.appBarBack}>
        <View style={[styles.glassCircle, {width: 40, height: 40}]}>
          <ArrowLeft size={20} color={tone === 'guardian' ? colors.amberText : colors.textTitle} />
        </View>
      </Pressable>
      <Text style={[styles.appBarTitle, center && {textAlign: 'center'}]} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
      {center ? <View style={{width: TOUCH}} /> : null}
    </View>
  );
}

/**
 * A pop-up in Mutarisi's style (ThemeOverlay.Vuka.Dialog): an opaque surface
 * card with 28 dp corners over a dimmed screen, an ink bold title, secondary
 * body text, the main action as a pill and the other as a quiet text button.
 * Android back and a tap outside the card both mean the quiet choice.
 */
export function Dialog({
  visible,
  title,
  icon,
  children,
  confirm,
  onConfirm,
  cancel,
  onCancel,
  tone = 'member',
}: {
  visible: boolean;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  confirm: string;
  onConfirm: () => void;
  /** The quiet choice's label; without one only the main action shows (Back and a tap outside still call `onCancel`). */
  cancel?: string;
  onCancel: () => void;
  tone?: Tone;
}) {
  const guardian = tone === 'guardian';
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessible={false} />
        <View style={styles.dialog} accessibilityViewIsModal>
          {icon ? <View style={[styles.dialogIcon, guardian && {backgroundColor: colors.amberFill}]}>{icon}</View> : null}
          <Text style={type.dialogTitle} accessibilityRole="header">
            {title}
          </Text>
          <View style={{marginTop: space.sm}}>{typeof children === 'string' ? <Text style={type.body}>{children}</Text> : children}</View>
          <View style={styles.dialogActions}>
            {cancel ? (
              <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={4} style={({pressed}) => [styles.dialogQuiet, pressed && {opacity: 0.6}]}>
                <Text style={[type.label, {color: colors.textSecondary}]}>{cancel}</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              android_ripple={{color: colors.rippleOnAction, foreground: true}}
              style={[styles.dialogPill, {backgroundColor: guardian ? colors.amberBottom : colors.action}]}>
              <Text style={[styles.pillText, {fontSize: 15, color: colors.textInverse}]} maxFontSizeMultiplier={1.6}>
                {confirm}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function Rule() {
  return <View style={styles.rule} />;
}

/** A list row: label, optional detail, and a caret. 52 dp minimum. */
export function Row({label, detail, onPress, leading}: {label: string; detail?: string; onPress: () => void; leading?: React.ReactNode}) {
  const depth = usePressDepth();
  return (
    <Animated.View style={depth.style}>
    <Pressable
      accessibilityRole="button"
      accessibilityHint={detail}
      onPress={onPress}
      onPressIn={depth.onPressIn}
      onPressOut={depth.onPressOut}
      android_ripple={{color: colors.ripple}}
      style={({pressed}) => [styles.row, pressed && {backgroundColor: colors.actionDim}]}>
      {leading ? <View style={styles.rowLeading}>{leading}</View> : null}
      <View style={{flex: 1}}>
        <Text style={[type.label, {fontFamily: fonts.medium}]}>{label}</Text>
        {detail ? <Text style={[type.caption, {marginTop: 2, color: colors.textSecondary}]}>{detail}</Text> : null}
      </View>
      <CaretRight size={14} color={colors.textDim} />
    </Pressable>
    </Animated.View>
  );
}

/**
 * The listening line: VUKA's signature. A calm waveform in ink at 40% that
 * drifts slowly sideways; nothing flashes or pulses in colour. Never on the
 * Journey check. Still under reduced motion.
 */
export function ListeningLine() {
  const reduce = useReduceMotion();
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(Animated.timing(x, {toValue: -120, duration: 6000, easing: Easing.linear, useNativeDriver: true}));
    loop.start();
    return () => loop.stop();
  }, [reduce, x]);
  const d = 'M0,12 Q15,3 30,12 ' + Array.from({length: 15}, (_, i) => `T${60 + i * 30},12`).join(' ');
  return (
    <View style={styles.line} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={{position: 'absolute', left: 0, top: 0, width: 480, transform: [{translateX: x}]}}>
        <Svg width={480} height={24}>
          <Path d={d} stroke={colors.action} strokeOpacity={0.4} strokeWidth={2} strokeLinecap="round" fill="none" />
        </Svg>
      </Animated.View>
      <Svg width="100%" height={24} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="lineFade" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.bgBase} stopOpacity={1} />
            <Stop offset="0.12" stopColor={colors.bgBase} stopOpacity={0} />
            <Stop offset="0.88" stopColor={colors.bgBase} stopOpacity={0} />
            <Stop offset="1" stopColor={colors.bgBase} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height={24} fill="url(#lineFade)" />
      </Svg>
    </View>
  );
}

/**
 * The live meter: the model's current score for the loudest of the nine
 * target sounds, against that sound's own threshold. It is a model score, not
 * a probability (uncalibrated; ADR-0039, D14), and the label says so.
 */
export function LevelMeter({score, threshold, label}: {score: number; threshold: number; label: string | null}) {
  const w = useRef(new Animated.Value(0)).current;
  const [track, setTrack] = useState(0);
  useEffect(() => {
    Animated.spring(w, {toValue: Math.max(0, Math.min(1, score / 10000)), useNativeDriver: false, speed: 18, bounciness: 0}).start();
  }, [score, w]);
  const pct = (n: number) => Math.round(n / 100);
  return (
    <View
      accessible
      accessibilityLabel={label ? `Loudest target sound ${label}, model score ${pct(score)}, threshold ${pct(threshold)}` : 'No target sound heard'}>
      <View style={styles.meterHead}>
        <Text style={[type.caption, {color: colors.textSecondary, flexShrink: 1}]}>{label ? `Loudest: ${label}` : 'Quiet: no target sound'}</Text>
        {label ? (
          <Text style={type.readout}>
            {pct(score)}
            <Text style={{color: colors.textDim}}> / {pct(threshold)}</Text>
          </Text>
        ) : (
          <Text style={[type.readout, {color: colors.textDim}]}>—</Text>
        )}
      </View>
      <View style={styles.meterTrack} onLayout={e => setTrack(e.nativeEvent.layout.width)}>
        <Animated.View
          style={[styles.meterFill, {width: w.interpolate({inputRange: [0, 1], outputRange: [0, track]})}, score >= threshold && {backgroundColor: colors.action}]}
        />
        {threshold > 0 && track > 0 ? <View style={[styles.meterTick, {left: (track * threshold) / 10000 - 1}]} /> : null}
      </View>
      <Text style={[type.caption, {fontSize: 12, marginTop: space.xs}]}>
        Model score 0–100 against the sound's own threshold (the tick). Not a probability.
      </Text>
    </View>
  );
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

/**
 * PIN keypad: flat and plain, the prototype's Journey check keypad. It knows
 * nothing about which PIN is which: it hands the digits up and resets. Every
 * entry looks the same, so the screen can never reveal a duress PIN (V5, T15).
 * `onComplete` also gets how long the entry took, first key to last (ms): it
 * stays on the phone; only "slower than usual" is ever recorded (CEM-1).
 */
export function PinKeypad({length = 4, onComplete}: {length?: number; onComplete: (pin: string, entryMs: number) => void}) {
  const startedAt = useRef<number | null>(null);
  const [pin, setPin] = useState('');
  const press = (k: string) => {
    if (k === 'del') {
      setPin(p => p.slice(0, -1));
      return;
    }
    const next = (pin + k).slice(0, length);
    if (startedAt.current === null) startedAt.current = Date.now();
    if (next.length === length) {
      const entryMs = Date.now() - startedAt.current;
      startedAt.current = null;
      setPin('');
      onComplete(next, entryMs);
    } else {
      setPin(next);
    }
  };
  return (
    <View style={{width: '100%', maxWidth: 340, alignSelf: 'center'}}>
      <View style={styles.dots} accessible accessibilityLabel={`${pin.length} of ${length} digits entered`} accessibilityLiveRegion="polite">
        {Array.from({length}).map((_, i) => (
          <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
        ))}
      </View>
      <View style={styles.pad}>
        {KEYS.map((k, i) =>
          k ? (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={k === 'del' ? 'Delete' : k}
              onPress={() => press(k)}
              style={({pressed}) => [styles.pinKey, pressed && styles.pinKeyPressed]}>
              {k === 'del' ? (
                <Backspace size={22} color={colors.textSecondary} />
              ) : (
                <Text style={styles.pinText} maxFontSizeMultiplier={1.4}>
                  {k}
                </Text>
              )}
            </Pressable>
          ) : (
            <View key={i} style={styles.pinBlank} importantForAccessibility="no" />
          ),
        )}
      </View>
    </View>
  );
}

const shadow = {
  shadowColor: colors.shadow,
  shadowOpacity: 0.16,
  shadowRadius: 18,
  shadowOffset: {width: 0, height: 10},
  elevation: 4,
};

const styles = StyleSheet.create({
  orb: {position: 'absolute', width: 420, height: 420},
  card: {
    // The blurred backdrop (BlurView) makes the card opaque, so its elevation
    // shadow never shows through it.
    backgroundColor: 'transparent',
    borderRadius: radii.panel,
    borderWidth: 1,
    borderColor: colors.cardEdge,
    padding: 20,
    ...shadow,
  },
  cardHero: {shadowOpacity: 0.22, shadowRadius: 26, elevation: 6},
  glassClip: {borderRadius: radii.panel, overflow: 'hidden'},
  cardGuardian: {borderColor: colors.edgeLight},
  bezel: {
    padding: 6,
    borderRadius: radii.bezel,
    backgroundColor: colors.dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.32)',
    borderWidth: 1,
    borderColor: 'rgba(30,44,70,0.06)',
  },
  glassCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pillFill,
    borderWidth: 1,
    borderColor: colors.edgeLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  pill: {
    minHeight: 54,
    borderRadius: radii.round,
    paddingHorizontal: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    overflow: 'hidden',
  },
  pillInk: {
    // A solid ink base under the gradient, so the pill is never see-through.
    backgroundColor: colors.actionBottom,
    shadowColor: colors.action,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 5,
  },
  pillGlass: {backgroundColor: colors.pillFill, borderWidth: 1, borderColor: colors.edgeLight, ...shadow, elevation: 2},
  pillGhost: {backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.controlEdge},
  pillGuardianPlain: {backgroundColor: colors.amberFill, borderWidth: 1, borderColor: '#F2D48A'},
  pressed: {transform: [{scale: 0.97}]},
  pillText: {fontFamily: fonts.semibold, fontSize: 16},
  arrowOrb: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: -12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inkHighlight: {position: 'absolute', top: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.25)'},
  quiet: {minHeight: TOUCH, justifyContent: 'center', alignItems: 'center', paddingHorizontal: space.md},
  scrim: {flex: 1, backgroundColor: colors.scrim, justifyContent: 'center', padding: space.lg},
  dialog: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    borderRadius: radii.dialog,
    backgroundColor: colors.dialogFill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    ...shadow,
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 12,
  },
  dialogIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.actionDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  dialogActions: {flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg},
  dialogQuiet: {minHeight: TOUCH, justifyContent: 'center', paddingHorizontal: space.md},
  dialogPill: {minHeight: TOUCH, borderRadius: radii.round, paddingHorizontal: 22, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'},
  lamp: {width: 7, height: 7, borderRadius: 4},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingLeft: 9,
    paddingRight: 11,
    borderRadius: radii.round,
    backgroundColor: colors.pillFill,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  chipDot: {width: 6, height: 6, borderRadius: 3},
  chipText: {fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary},
  chipMono: {fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase'},
  appBar: {flexDirection: 'row', alignItems: 'center', minHeight: 60, gap: space.sm, marginLeft: -4},
  appBarBack: {width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center'},
  appBarTitle: {...type.title, flex: 1},
  readout: {minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md},
  readoutValue: {flexDirection: 'row', alignItems: 'center', gap: space.sm},
  rule: {height: 1, backgroundColor: colors.border, marginVertical: space.sm},
  row: {minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: 20, paddingVertical: space.sm},
  rowLeading: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {height: 24, width: '100%', overflow: 'hidden'},
  meterHead: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space.sm, marginBottom: space.sm},
  meterTrack: {height: 8, borderRadius: 4, backgroundColor: colors.borderSubtle, overflow: 'hidden'},
  meterFill: {height: 8, borderRadius: 4, backgroundColor: colors.actionLine},
  meterTick: {position: 'absolute', top: 0, width: 2, height: 8, backgroundColor: colors.textDim},
  dots: {flexDirection: 'row', justifyContent: 'center', gap: 16, height: 16, alignItems: 'center', marginBottom: space.lg},
  dot: {width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: colors.controlEdge},
  dotFilled: {backgroundColor: colors.textLabel, borderColor: colors.textLabel},
  pad: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8},
  pinKey: {
    width: '32%',
    height: 58,
    borderRadius: radii.sm,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.controlEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinKeyPressed: {backgroundColor: colors.borderEmphasis},
  pinBlank: {width: '32%', height: 58},
  pinText: {fontFamily: fonts.regular, fontSize: 22, color: colors.textTitle},
});

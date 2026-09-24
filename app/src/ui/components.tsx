/**
 * VIGIL UI primitives, Functional Industrial: a graphite body lit from above,
 * keys that depress when pressed, 8 dp lamps, and readouts set in mono.
 * Colour follows the rules in theme.ts: one cobalt signal, green only for
 * received or verified, amber only in guardian mode.
 */
import React, {useEffect, useRef, useState} from 'react';
import {AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View, type ViewStyle} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {Backspace, CaretRight} from './icons';
import {colors, fonts, radii, space, TOUCH, type} from './theme';

type Tone = 'member' | 'guardian';

/** The body: a flat graphite field with one soft top light. */
export function Surface({tone = 'member'}: {tone?: Tone}) {
  const base = tone === 'guardian' ? colors.guardianBase : colors.bgBase;
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <LinearGradient id="toplight" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.035" />
          <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={base} />
      <Rect width="100%" height="100%" fill="url(#toplight)" />
    </Svg>
  );
}

/** A raised graphite panel. Tonal elevation only: no drop shadow. */
export function Panel({tone = 'member', style, children}: {tone?: Tone; style?: ViewStyle; children: React.ReactNode}) {
  return (
    <View style={[styles.panel, tone === 'guardian' && {backgroundColor: colors.guardianRaised}, style]}>{children}</View>
  );
}

type KeyVariant = 'signal' | 'plain' | 'guardian' | 'guardianPlain';

const FACE: Record<KeyVariant, {top: string; bottom: string; text: string; ripple: string}> = {
  signal: {top: colors.cobaltTop, bottom: colors.cobaltBottom, text: colors.cobaltText, ripple: colors.rippleOnSignal},
  plain: {top: colors.keyFaceTop, bottom: colors.keyFace, text: colors.textTitle, ripple: colors.ripple},
  guardian: {top: colors.amberTop, bottom: colors.amberBottom, text: colors.onAmber, ripple: colors.ripple},
  guardianPlain: {top: colors.guardianKeyTop, bottom: colors.guardianRaised, text: colors.textTitle, ripple: colors.ripple},
};

/**
 * The machined face of a key. Pressed, the light flips (bottom edge lit) and
 * the key sinks 3%: the same for every key, on every screen, for both PINs.
 */
function KeyFace({variant, pressed, radius}: {variant: KeyVariant; pressed: boolean; radius: number}) {
  const f = FACE[variant];
  const id = `face-${variant}-${pressed ? 'p' : 'r'}`;
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={pressed ? f.bottom : f.top} />
          <Stop offset="1" stopColor={pressed ? f.top : f.bottom} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" rx={radius} ry={radius} fill={`url(#${id})`} />
    </Svg>
  );
}

export function Key({
  label,
  onPress,
  variant = 'plain',
  icon,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  variant?: KeyVariant;
  icon?: React.ReactNode;
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      android_ripple={{color: FACE[variant].ripple, foreground: true}}
      style={({pressed}) => [styles.key, (variant === 'plain' || variant === 'guardianPlain') && styles.keyEdge, pressed && styles.sunk]}>
      {({pressed}) => (
        <>
          <KeyFace variant={variant} pressed={pressed} radius={radii.key} />
          {icon ? <View>{icon}</View> : null}
          <Text style={[styles.keyText, {color: FACE[variant].text}]} maxFontSizeMultiplier={1.6}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

/** A text-only action for the least important choice on a screen. */
export function QuietKey({label, onPress, tone = 'member'}: {label: string; onPress: () => void; tone?: Tone}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={4}
      style={({pressed}) => [styles.quiet, pressed && {opacity: 0.6}]}>
      <Text style={[type.label, {color: tone === 'guardian' ? colors.amberInk : colors.cobaltInk}]}>{label}</Text>
    </Pressable>
  );
}

/** The round signal key on its plinth: the one primary action on Home. */
export function RoundKey({label, onPress}: {label: string; onPress: () => void}) {
  return (
    <View style={styles.plinth}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        android_ripple={{color: colors.rippleOnSignal, borderless: true, radius: 68}}
        style={({pressed}) => [styles.round, pressed && styles.sunk]}>
        {({pressed}) => (
          <>
            <KeyFace variant="signal" pressed={pressed} radius={68} />
            <Text style={styles.roundText} maxFontSizeMultiplier={1.3}>
              {label}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

/** A dial on the same plinth, holding a readout (the journey clock). */
export function Dial({children}: {children: React.ReactNode}) {
  return (
    <View style={styles.plinth}>
      <View style={styles.dial}>{children}</View>
    </View>
  );
}

type LampTone = 'signal' | 'green' | 'bone' | 'amber' | 'unlit';
const LAMP: Record<LampTone, string> = {
  signal: colors.cobalt,
  green: colors.green,
  bone: colors.bone,
  amber: colors.amber,
  unlit: colors.unlit,
};

function useReduceMotion() {
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
 * An 8 dp lamp. `breathing` is used for the listening lamp alone: a slow
 * 4.8 s cycle, off when the system asks for reduced motion. Decorative; the
 * words beside it carry the state.
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
      style={[
        styles.lamp,
        hollow ? {borderWidth: 1.5, borderColor: colors.controlEdge} : {backgroundColor: LAMP[tone]},
        {opacity: level},
      ]}
    />
  );
}

/** One readout line: a word on the left, a measured value on the right. */
export function Readout({label, value, lamp}: {label: string; value: string; lamp?: React.ReactNode}) {
  return (
    <View style={styles.readout} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={[type.body, {color: colors.textBody, flexShrink: 1}]}>{label}</Text>
      <View style={styles.readoutValue}>
        {lamp}
        <Text style={[type.readout, {color: colors.textTitle}]}>{value}</Text>
      </View>
    </View>
  );
}

export function Rule() {
  return <View style={styles.rule} />;
}

/** A settings row: label, optional detail, and a caret. */
export function Row({label, detail, onPress}: {label: string; detail?: string; onPress: () => void}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={detail}
      onPress={onPress}
      android_ripple={{color: colors.ripple}}
      style={({pressed}) => [styles.row, pressed && {backgroundColor: colors.keyFacePressed}]}>
      <View style={{flex: 1}}>
        <Text style={type.label}>{label}</Text>
        {detail ? <Text style={[type.caption, {marginTop: 2}]}>{detail}</Text> : null}
      </View>
      <CaretRight size={18} color={colors.textDim} />
    </Pressable>
  );
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

/**
 * PIN keypad. Deliberately knows nothing about which PIN is which: it hands
 * the digits up and resets. Every entry looks and animates the same, so the
 * screen can never reveal a duress PIN (spec V5, test T15).
 */
export function PinKeypad({length = 4, onComplete}: {length?: number; onComplete: (pin: string) => void}) {
  const [pin, setPin] = useState('');
  const press = (k: string) => {
    if (k === 'del') {
      setPin(p => p.slice(0, -1));
      return;
    }
    const next = (pin + k).slice(0, length);
    if (next.length === length) {
      setPin('');
      onComplete(next);
    } else {
      setPin(next);
    }
  };
  return (
    <View>
      <View
        style={styles.dots}
        accessible
        accessibilityLabel={`${pin.length} of ${length} digits entered`}
        accessibilityLiveRegion="polite">
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
              android_ripple={{color: colors.ripple, foreground: true}}
              style={({pressed}) => [styles.pinKey, pressed && styles.sunk]}>
              {({pressed}) => (
                <>
                  <KeyFace variant="plain" pressed={pressed} radius={radii.key} />
                  {k === 'del' ? (
                    <View>
                      <Backspace size={24} color={colors.textTitle} />
                    </View>
                  ) : (
                    <Text style={styles.pinText} maxFontSizeMultiplier={1.4}>
                      {k}
                    </Text>
                  )}
                </>
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

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.bgRaised,
    borderRadius: radii.panel,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderTopColor: colors.topLight,
    padding: space.md,
  },
  key: {
    minHeight: TOUCH + 8,
    borderRadius: radii.key,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    overflow: 'hidden',
  },
  keyEdge: {borderWidth: 1, borderColor: colors.controlEdge},
  sunk: {transform: [{scale: 0.97}]},
  keyText: {fontFamily: fonts.semibold, fontSize: 17},
  quiet: {minHeight: TOUCH, justifyContent: 'center', alignItems: 'center', paddingHorizontal: space.md},
  plinth: {
    alignSelf: 'center',
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: colors.shade,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  round: {
    width: 136,
    height: 136,
    borderRadius: 68,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
  },
  roundText: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 22,
    color: colors.cobaltText,
    textAlign: 'center',
    paddingHorizontal: space.md,
  },
  dial: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: colors.keyFace,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderTopColor: colors.topLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  lamp: {width: 8, height: 8, borderRadius: 4},
  readout: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  readoutValue: {flexDirection: 'row', alignItems: 'center', gap: space.sm},
  rule: {height: 1, backgroundColor: colors.hairline, marginVertical: space.sm},
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  dots: {flexDirection: 'row', justifyContent: 'center', gap: space.md, marginBottom: space.xl},
  dot: {width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: colors.controlEdge},
  dotFilled: {backgroundColor: colors.textTitle, borderColor: colors.textTitle},
  pad: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, maxWidth: 300, alignSelf: 'center'},
  pinKey: {
    width: 84,
    height: 64,
    borderRadius: radii.key,
    borderWidth: 1,
    borderColor: colors.controlEdge,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pinBlank: {width: 84, height: 64},
  pinText: {fontFamily: fonts.medium, fontSize: 26, color: colors.textTitle},
});

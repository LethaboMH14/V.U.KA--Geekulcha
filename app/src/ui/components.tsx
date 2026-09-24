/**
 * VIGIL UI primitives, rebuilt from the prototype reference for React Native:
 * an ambient light field, a double-bezel hero card, a gradient pill button
 * with a trailing orb, status chips that always pair a mark with a word, and
 * the PIN keypad.
 */
import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View, type ViewStyle} from 'react-native';
import Svg, {Defs, LinearGradient, RadialGradient, Rect, Stop} from 'react-native-svg';
import {Backspace} from 'phosphor-react-native';
import {colors, fonts, radii, space, TOUCH} from './theme';

/** Soft light from one source (top-left), drawn once behind the content. */
export function AmbientField() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id="warm" cx="15%" cy="8%" r="80%" gradientUnits="objectBoundingBox">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="ink" cx="95%" cy="100%" r="75%" gradientUnits="objectBoundingBox">
          <Stop offset="0" stopColor="#1E3A5F" stopOpacity="0.07" />
          <Stop offset="1" stopColor="#1E3A5F" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={colors.bgBase} />
      <Rect width="100%" height="100%" fill="url(#warm)" />
      <Rect width="100%" height="100%" fill="url(#ink)" />
    </Svg>
  );
}

export function Card({hero, style, children}: {hero?: boolean; style?: ViewStyle; children: React.ReactNode}) {
  const inner = <View style={[styles.card, hero && styles.cardHero, style]}>{children}</View>;
  // Double bezel: a thin frosted shell around the hero card.
  return hero ? <View style={styles.bezel}>{inner}</View> : inner;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  trailing,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  trailing?: React.ReactNode;
  accessibilityHint?: string;
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({pressed}) => [
        styles.btn,
        primary ? styles.btnPrimary : styles.btnGhost,
        pressed && {transform: [{scale: 0.98}], opacity: 0.94},
      ]}>
      {primary ? (
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <LinearGradient id="inkfill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#2A4C78" />
              <Stop offset="1" stopColor="#1A3252" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" rx={26} ry={26} fill="url(#inkfill)" />
        </Svg>
      ) : null}
      <Text style={[styles.btnText, {color: primary ? colors.actionText : colors.action}]}>{label}</Text>
      {trailing ? <View style={[styles.orb, !primary && {backgroundColor: colors.actionDim}]}>{trailing}</View> : null}
    </Pressable>
  );
}

export function StatusChip({label, tone}: {label: string; tone: 'received' | 'neutral'}) {
  const received = tone === 'received';
  return (
    <View
      style={[
        styles.chip,
        received
          ? {backgroundColor: colors.greenFill, borderColor: colors.greenBorder}
          : {backgroundColor: colors.bgElevated, borderColor: colors.borderEmphasis},
      ]}>
      <View style={[styles.chipDot, {backgroundColor: received ? colors.greenText : colors.textDim}]} />
      <Text style={{fontFamily: fonts.medium, fontSize: 12, color: received ? colors.greenText : colors.textSecondary}}>
        {label}
      </Text>
    </View>
  );
}

/** Icon in a 40 dp frosted circle. Decorative: hidden from screen readers. */
export function Leaf({children}: {children: React.ReactNode}) {
  return (
    <View style={styles.leaf} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {children}
    </View>
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
              style={({pressed}) => [styles.key, pressed && styles.keyPressed]}>
              {k === 'del' ? (
                <Backspace size={24} color={colors.textTitle} />
              ) : (
                <Text style={styles.keyText}>{k}</Text>
              )}
            </Pressable>
          ) : (
            <View key={i} style={styles.keyBlank} importantForAccessibility="no" />
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bezel: {
    padding: 5,
    borderRadius: radii.xl + 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    padding: space.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 10},
    elevation: 3,
  },
  cardHero: {
    borderRadius: radii.xl,
    backgroundColor: colors.cardSolid,
    shadowOpacity: 0.18,
    elevation: 6,
  },
  btn: {
    minHeight: TOUCH + 4,
    borderRadius: radii.pill,
    paddingLeft: 22,
    paddingRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  btnPrimary: {
    backgroundColor: colors.action,
    shadowColor: colors.shadow,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 5,
  },
  btnGhost: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: colors.controlEdge,
    justifyContent: 'center',
    paddingRight: 22,
  },
  btnText: {fontFamily: fonts.semibold, fontSize: 16},
  orb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipDot: {width: 6, height: 6, borderRadius: 3},
  leaf: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 32},
  dot: {width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: colors.inputBorder},
  dotFilled: {backgroundColor: colors.textTitle, borderColor: colors.textTitle},
  pad: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, maxWidth: 300, alignSelf: 'center'},
  key: {
    width: 76,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.controlEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {backgroundColor: colors.bgElevated},
  keyBlank: {width: 76, height: 64},
  keyText: {fontFamily: fonts.medium, fontSize: 24, color: colors.textTitle},
});

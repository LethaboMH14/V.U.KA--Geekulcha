/**
 * VIGIL UI primitives, rebuilt from the prototype reference for React Native:
 * a double-bezel hero card, pill buttons with a trailing orb, status chips
 * that always pair a mark with a word, and the PIN keypad.
 */
import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View, type ViewStyle} from 'react-native';
import {colors, radii, space, type, TOUCH} from './theme';

export function Card({
  hero,
  style,
  children,
}: {
  hero?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}) {
  const inner = <View style={[styles.card, hero && styles.cardHero, style]}>{children}</View>;
  // Double bezel: a thin outer shell around the hero card.
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
  trailing?: string;
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
        pressed && {transform: [{scale: 0.98}], opacity: 0.92},
      ]}>
      <Text style={[styles.btnText, {color: primary ? colors.actionText : colors.action}]}>{label}</Text>
      {trailing ? (
        <View style={[styles.orb, !primary && {backgroundColor: colors.actionDim}]}>
          <Text style={[styles.orbText, {color: primary ? colors.actionText : colors.action}]}>{trailing}</Text>
        </View>
      ) : null}
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
      <Text style={{fontSize: 12, color: received ? colors.greenText : colors.textSecondary}}>
        {received ? '● ' : '○ '}
        {label}
      </Text>
    </View>
  );
}

export function Leaf({mark}: {mark: string}) {
  return (
    <View style={styles.leaf} accessibilityElementsHidden importantForAccessibility="no">
      <Text style={{fontSize: 16, color: colors.textTitle}}>{mark}</Text>
    </View>
  );
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

/**
 * PIN keypad. Deliberately knows nothing about which PIN is which: it hands
 * the digits up and resets. Every entry looks and animates the same, so the
 * screen can never reveal a duress PIN (spec V5, test T15).
 */
export function PinKeypad({length = 4, onComplete}: {length?: number; onComplete: (pin: string) => void}) {
  const [pin, setPin] = useState('');
  const press = (k: string) => {
    if (k === '⌫') {
      setPin(p => p.slice(0, -1));
      return;
    }
    if (!k) return;
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
      <View style={styles.dots} accessibilityLabel={`${pin.length} of ${length} digits entered`}>
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
              accessibilityLabel={k === '⌫' ? 'Delete' : k}
              onPress={() => press(k)}
              style={({pressed}) => [styles.key, pressed && {backgroundColor: colors.bgElevated}]}>
              <Text style={styles.keyText}>{k}</Text>
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
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
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
  },
  btnPrimary: {
    backgroundColor: colors.action,
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderEmphasis,
    justifyContent: 'center',
    paddingRight: 22,
  },
  btnText: {fontSize: 16, fontWeight: '600'},
  orb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbText: {fontSize: 18, fontWeight: '700'},
  chip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  leaf: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
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
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBlank: {width: 76, height: 64},
  keyText: {fontSize: 24, fontWeight: '500', color: colors.textTitle},
});

export const text = type;

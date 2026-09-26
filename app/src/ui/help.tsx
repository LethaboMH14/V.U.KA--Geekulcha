/**
 * Hold-for-help (Mutarisi's design; ADR-0049, PROPOSED). Holding for 2 s
 * opens the same check-in a detection opens: the normal PIN closes it, the
 * duress PIN raises the silent alarm, and no answer escalates. A tap does
 * nothing (a pocket press must not ask), and letting go early cancels.
 */
import React, {useRef, useState} from 'react';
import {Animated, Easing, Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, fonts, radii, space, type} from './theme';

export const HOLD_MS = 2000;

export function HoldForHelp({onHelp}: {onHelp: () => void}) {
  const fill = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false);

  const start = () => {
    setHolding(true);
    fill.setValue(0);
    Animated.timing(fill, {toValue: 1, duration: HOLD_MS, easing: Easing.linear, useNativeDriver: false}).start();
    timer.current = setTimeout(() => {
      timer.current = null;
      setHolding(false);
      fill.setValue(0);
      onHelp();
    }, HOLD_MS);
  };
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
    fill.stopAnimation();
    fill.setValue(0);
  };

  return (
    <View>
      <Pressable
        onPressIn={start}
        onPressOut={cancel}
        accessibilityRole="button"
        accessibilityLabel="Hold for help"
        accessibilityHint="Hold for two seconds to open a check-in now"
        style={styles.pill}>
        <Animated.View
          style={[styles.fill, {width: fill.interpolate({inputRange: [0, 1], outputRange: ['0%', '100%']})}]}
        />
        <Text style={styles.label}>{holding ? 'Keep holding…' : 'Hold for help'}</Text>
      </Pressable>
      <Text style={[type.caption, {marginTop: space.xs, textAlign: 'center'}]}>
        Opens a check-in now. Your second PIN there alerts your guardians silently.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 56,
    borderRadius: radii.round,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgBase,
    borderWidth: 1.5,
    borderColor: colors.textTitle,
  },
  fill: {position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(30, 58, 95, 0.18)'},
  label: {fontFamily: fonts.semibold, fontSize: 16, color: colors.textTitle},
});

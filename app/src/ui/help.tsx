/**
 * Home's Emergency button (Mutarisi's design, adopted by Lethabo on
 * 2026-09-26; it replaces the 2 s "Hold for help" of ADR-0049, PROPOSED).
 * One tap does two things:
 *
 * 1. While VIGIL is active, it opens the same check-in a detection opens
 *    (`device.help`: signal_detected, sense "manual"). The normal PIN closes
 *    it, the duress PIN raises the silent alarm, and no answer escalates.
 * 2. It opens the phone's dialer with 10111 ready. The member presses call
 *    there: VIGIL never places a call (Android lets no app call an emergency
 *    number itself), so a stray tap cannot call anyone.
 *
 * A burst of taps raises one check-in: the press is claimed once per burst
 * here, and the grader's single prompt slot refuses a second check-in anyway.
 *
 * Trade-off, stated: the hold kept a pocket press from asking. A single tap
 * now can open a check-in, which the normal PIN closes.
 */
import React, {useRef} from 'react';
import {Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import {Phone} from './icons';
import {colors, fonts, radii, space, type} from './theme';

export const EMERGENCY_NUMBER = '10111';
/** Opens the dialer with the number filled in. Never a direct call. */
export const EMERGENCY_URL = `tel:${EMERGENCY_NUMBER}`;
/** Taps closer together than this are one press burst. */
export const BURST_MS = 3000;

/**
 * True when this press starts a new burst. Every press moves the burst on,
 * so hammering the button stays one burst until it is left alone.
 */
export function claimPress(last: {at: number | null}, now: number, burstMs = BURST_MS): boolean {
  const fresh = last.at === null || now - last.at >= burstMs;
  last.at = now;
  return fresh;
}

/**
 * One accepted press: ask for the check-in first (it takes the prompt slot at
 * once), then open the dialer. False if no dialer could be opened.
 */
export async function raiseEmergency(onHelp: () => void, openURL: (url: string) => Promise<unknown> = u => Linking.openURL(u)): Promise<boolean> {
  onHelp();
  try {
    await openURL(EMERGENCY_URL);
    return true;
  } catch {
    return false;
  }
}

/** An outlined 54 dp pill: Emergency (title ink) and Deactivate (action ink). */
export function OutlineKey({
  label,
  onPress,
  tone = 'action',
  icon,
  accessibilityLabel,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  tone?: 'action' | 'title';
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
  const ink = tone === 'title' ? colors.textTitle : colors.action;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      android_ripple={{color: colors.ripple, foreground: true}}
      style={({pressed}) => [styles.pill, {borderColor: ink}, pressed && {opacity: 0.7}]}>
      {icon ? <View>{icon}</View> : null}
      <Text style={[styles.label, {color: ink}]} maxFontSizeMultiplier={1.6}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * The Emergency button and its caption. `listening` only changes what the
 * screen reader is told: without a running session there is no check-in to
 * open, so the tap opens the dialer alone.
 */
export function EmergencyButton({onHelp, listening}: {onHelp: () => void; listening: boolean}) {
  const last = useRef<{at: number | null}>({at: null});
  const press = () => {
    if (!claimPress(last.current, Date.now())) return;
    void raiseEmergency(onHelp);
  };
  return (
    <View>
      <OutlineKey
        label={`Emergency · call ${EMERGENCY_NUMBER}`}
        tone="title"
        icon={<Phone size={18} weight="bold" color={colors.textTitle} />}
        accessibilityLabel={`Emergency, call ${EMERGENCY_NUMBER}`}
        accessibilityHint={
          listening
            ? `Opens a check-in here and your dialer with ${EMERGENCY_NUMBER} ready`
            : `Opens your dialer with ${EMERGENCY_NUMBER} ready`
        }
        onPress={press}
      />
      <Text style={[type.caption, {marginTop: space.xs, textAlign: 'center'}]}>
        Opens your dialer with {EMERGENCY_NUMBER} ready. Press call there.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 54,
    borderRadius: radii.round,
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 26,
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  label: {fontFamily: fonts.semibold, fontSize: 16},
});

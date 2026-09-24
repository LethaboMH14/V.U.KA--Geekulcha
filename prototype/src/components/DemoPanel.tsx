import { useNavigate } from 'react-router-dom'
import { useDemo, type VukaTheme, type VukaRole, type VukaAnchorState } from '@/contexts/DemoContext'
import { useMember, type PINType, type JourneyState } from '@/contexts/MemberContext'
import { useWebDemo, type VerifyResultState } from '@/pages/web/webDemoContext'
import {
  useOnboarding, type CodeState, type SheetCodeState, type GuardiansPreset, type LoadState,
} from '@/contexts/OnboardingContext'

/**
 * Off-phone demo controls — from spec:
 * "State switchers and review toggles sit outside the phone frame, on the canvas,
 *  and never appear on the mirrored demo phone."
 *
 * All controls here are DEMO ONLY and have no member-facing equivalent.
 */
export function DemoPanel() {
  const navigate = useNavigate()
  const { theme, blurEnabled, role, anchorState, setTheme, setBlurEnabled, setRole, setAnchorState } = useDemo()
  const { journeyState, setJourneyState, pinType, setPinType, networkAvailable, setNetworkAvailable } = useMember()
  const {
    verifyState, setVerifyState,
    micDenied, setMicDenied, notifDenied, setNotifDenied, locationDenied, setLocationDenied,
    fullScreenAlertsBlocked, setFullScreenAlertsBlocked,
    recoveryCut, setRecoveryCut,
    guardiansPreset, setGuardiansPreset,
    inviteSheetState, setInviteSheetState,
    enrolState, setEnrolState,
    lateAnswerUpdate, setLateAnswerUpdate,
    settingsLoadState, setSettingsLoadState,
  } = useOnboarding()

  const goMember = (path: string) => { setRole('member'); navigate(path) }
  const goGuardian = (path: string) => { setRole('guardian'); navigate(path) }
  const { verifyResultState, setVerifyResultState, realCheck, setRealCheck } = useWebDemo()

  return (
    <aside
      style={{
        width: 280,
        background: '#1a1d26',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        color: '#c5cee0',
        fontSize: 13,
        alignSelf: 'flex-start',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#f59e0b', textTransform: 'uppercase' }}>
            Demo controls
          </span>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#4e5568' }}>
            SIMULATED
          </span>
        </div>
        <p style={{ fontSize: 11, color: '#4e5568', marginTop: 4 }}>
          Not visible on the member's phone
        </p>
      </div>

      <Divider />

      {/* Preview role — off-phone only. Guardian view never mirrors on the member's phone. */}
      <Section label="Preview role">
        <SegmentedControl
          options={[
            { value: 'member',   label: 'Member' },
            { value: 'guardian', label: 'Guardian' },
          ]}
          value={role}
          onChange={(v) => setRole(v as VukaRole)}
        />
        <p style={{ fontSize: 11, color: '#4e5568', marginTop: 6 }}>
          Guardian mode is the only screen with amber
        </p>
      </Section>

      <Divider />

      {/* Theme */}
      <Section label="Theme">
        <SegmentedControl
          options={[
            { value: 'ivory',    label: 'Ivory' },
            { value: 'silver',   label: 'Silver' },
            { value: 'midnight', label: 'Midnight' },
          ]}
          value={theme}
          onChange={(v) => setTheme(v as VukaTheme)}
        />
        <p style={{ fontSize: 11, color: '#4e5568', marginTop: 6 }}>
          Ivory is the default. Midnight is night mode.
        </p>
      </Section>

      {/* Blur */}
      <Section label="Card blur">
        <Toggle
          label={blurEnabled ? 'On' : 'Off'}
          checked={blurEnabled}
          onChange={setBlurEnabled}
        />
        {!blurEnabled && (
          <p style={{ fontSize: 11, color: '#8892a4', marginTop: 6 }}>
            Solid white-card fallback
          </p>
        )}
      </Section>

      <Divider />

      {/* Journey state */}
      <Section label="Journey state">
        <SegmentedControl
          options={[
            { value: 'disarmed',       label: 'Disarmed' },
            { value: 'armed',          label: 'Armed' },
            { value: 'check_pending',  label: 'Check' },
            { value: 'checking',       label: 'Checking' },
          ]}
          value={journeyState}
          onChange={(v) => setJourneyState(v as JourneyState)}
          cols={2}
        />
      </Section>

      {/* PIN type — duress rule */}
      <Section label="PIN type (internal — member never sees this)">
        <SegmentedControl
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'duress', label: 'Duress' },
          ]}
          value={pinType}
          onChange={(v) => setPinType(v as PINType)}
        />
        <p style={{ fontSize: 11, color: '#4e5568', marginTop: 6 }}>
          Both paths look identical on screen
        </p>
      </Section>

      <p style={{ fontSize: 11, color: '#4e5568', marginTop: -6, marginBottom: 12 }}>
        Journey check: visual intent only. Haptics, request shape and timing parity are checked in the React Native build (T15).
      </p>

      {/* Anchor proof result — all SIMULATED in the prototype */}
      <Section label="Anchor proof (record)">
        <SegmentedControl
          options={[
            { value: 'live',        label: 'Simulated' },
            { value: 'archived',    label: 'Archived' },
            { value: 'unavailable', label: 'Unavail.' },
          ]}
          value={anchorState}
          onChange={(v) => setAnchorState(v as VukaAnchorState)}
        />
        <p style={{ fontSize: 11, color: '#4e5568', marginTop: 6 }}>
          "Live-verified" is reserved for a real mirror-node check
        </p>
      </Section>

      {/* Network */}
      <Section label="Network">
        <Toggle
          label={networkAvailable ? 'Available' : 'Unavailable'}
          checked={networkAvailable}
          onChange={setNetworkAvailable}
        />
      </Section>

      <Divider />

      {/* Verify page result — /verify only (Slice D) */}
      <Section label="Verify result (web)">
        <SegmentedControl
          options={[
            { value: 'live',        label: 'Live' },
            { value: 'archived',    label: 'Archived' },
            { value: 'unavailable', label: 'Unavail.' },
            { value: 'failure',     label: 'Failure' },
          ]}
          value={verifyResultState}
          onChange={(v) => setVerifyResultState(v as VerifyResultState)}
          cols={2}
        />
        <p style={{ fontSize: 11, color: '#4e5568', marginTop: 6 }}>
          "Failure" names entry 17 as the first broken check
        </p>
      </Section>

      <Section label="Real check (web)">
        <Toggle
          label={realCheck ? 'On' : 'Off'}
          checked={realCheck}
          onChange={setRealCheck}
        />
        <p style={{ fontSize: 11, color: '#4e5568', marginTop: 6 }}>
          Only this shows "Live-verified" on /verify — otherwise SIMULATED
        </p>
      </Section>

      <Divider />

      {/* ── Slice C — onboarding, settings, guardian lifecycle ────── */}
      <Section label="Onboarding steps">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavButton label="1 · Welcome" onClick={() => goMember('/welcome')} />
          <NavButton label="2 · Sign in" onClick={() => goMember('/welcome/sign-in')} />
          <NavButton label="3 · Your name" onClick={() => goMember('/welcome/name')} />
          <NavButton label="4 · Phone number" onClick={() => goMember('/welcome/phone')} />
          <NavButton label="5 · Verify code" onClick={() => goMember('/welcome/verify')} />
          <NavButton label="6 · Permissions" onClick={() => goMember('/welcome/permissions')} />
          <NavButton label="7 · Set PINs" onClick={() => goMember('/welcome/pins')} />
          <NavButton label="8 · Invite guardians" onClick={() => goMember('/welcome/guardians')} />
        </div>
      </Section>

      <Section label="Verify-code state">
        <SegmentedControl
          options={[
            { value: 'idle', label: 'Idle' },
            { value: 'wrong', label: 'Wrong' },
            { value: 'expired', label: 'Expired' },
            { value: 'locked', label: 'Locked' },
          ]}
          value={verifyState}
          onChange={(v) => setVerifyState(v as CodeState)}
          cols={2}
        />
      </Section>

      <Section label="Permissions — denial outcomes">
        <Toggle label="Microphone denied" checked={micDenied} onChange={setMicDenied} />
        <Toggle label="Notifications denied" checked={notifDenied} onChange={setNotifDenied} />
        <Toggle label="Location denied" checked={locationDenied} onChange={setLocationDenied} />
        <Toggle label="Full-screen alerts blocked (V4)" checked={fullScreenAlertsBlocked} onChange={setFullScreenAlertsBlocked} />
      </Section>

      <Section label="Recovery code">
        <Toggle label={recoveryCut ? 'Cut — PROPOSED' : 'Available'} checked={recoveryCut} onChange={setRecoveryCut} />
      </Section>

      <Section label="Invite-guardians preset">
        <SegmentedControl
          options={[
            { value: 'empty', label: 'Empty' },
            { value: 'pending', label: 'Pending' },
            { value: 'mixed', label: 'Mixed' },
          ]}
          value={guardiansPreset}
          onChange={(v) => setGuardiansPreset(v as GuardiansPreset)}
        />
        <p style={{ fontSize: 11, color: '#4e5568', marginTop: 6 }}>Re-enter step 8 to reseed the list</p>
      </Section>

      <Section label="Invite-code sheet state">
        <SegmentedControl
          options={[
            { value: 'idle', label: 'Idle' },
            { value: 'expired', label: 'Expired' },
            { value: 'locked', label: 'Locked' },
          ]}
          value={inviteSheetState}
          onChange={(v) => setInviteSheetState(v as SheetCodeState)}
        />
      </Section>

      <Divider />

      <Section label="Settings">
        <NavButton label="Open Settings" onClick={() => goMember('/settings')} />
        <SegmentedControl
          options={[
            { value: 'ready', label: 'Ready' },
            { value: 'loading', label: 'Loading' },
            { value: 'error', label: 'Error' },
          ]}
          value={settingsLoadState}
          onChange={(v) => setSettingsLoadState(v as LoadState)}
        />
      </Section>

      <Section label="Guardian lifecycle">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavButton label="Enrol" onClick={() => goGuardian('/guardian/enrol')} />
          <NavButton label="Standby" onClick={() => goGuardian('/guardian/standby')} />
          <NavButton label="Acknowledged" onClick={() => goGuardian('/guardian/acknowledged')} />
        </div>
        <SegmentedControl
          options={[
            { value: 'idle', label: 'Idle' },
            { value: 'wrong', label: 'Wrong' },
            { value: 'expired', label: 'Expired' },
            { value: 'locked', label: 'Locked' },
          ]}
          value={enrolState}
          onChange={(v) => setEnrolState(v as CodeState)}
          cols={2}
        />
        <Toggle label="Late-answer update" checked={lateAnswerUpdate} onChange={setLateAnswerUpdate} />
      </Section>
    </aside>
  )
}

/* ── Sub-components ────────────────────────────────────────────── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#6a7490', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </p>
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
}

function SegmentedControl({
  options,
  value,
  onChange,
  cols = options.length,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  cols?: number
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 4,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 10,
        padding: 3,
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: '5px 4px',
            borderRadius: 7,
            border: 'none',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 150ms ease-out',
            background: value === opt.value ? '#2a3048' : 'transparent',
            color: value === opt.value ? '#e0e6f0' : '#6a7490',
            boxShadow: value === opt.value ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 13, color: disabled ? '#4e5568' : '#c5cee0' }}>{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          border: 'none',
          background: checked && !disabled ? '#00c896' : '#2a3048',
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : 1,
          transition: 'background 200ms ease-out',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 21 : 3,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#ffffff',
            transition: 'left 200ms ease-out',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </button>
    </div>
  )
}

/** A small off-phone nav link — jumps the mirrored phone to a route. Slice C only. */
function NavButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left',
        minHeight: 30,
        padding: '5px 8px',
        borderRadius: 7,
        border: 'none',
        background: 'rgba(255,255,255,0.04)',
        color: '#c5cee0',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

import { useEffect } from 'react'
import {
  ShieldChevron, Waveform, Microphone, CheckCircle, Users, WifiSlash,
  ArrowRight, DotsThreeCircle,
} from '@phosphor-icons/react'
import { useMember } from '@/contexts/MemberContext'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { StatusChip } from '@/components/ui/StatusChip'
import { ListeningLine } from '@/components/ui/ListeningLine'
import { PinKeypad } from '@/components/ui/PinKeypad'

/** The big recognisable state word — Plex Sans SemiBold 32, no condensed. */
const heroWord: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontWeight: 600,
  fontSize: 32,
  lineHeight: 1.08,
  letterSpacing: '-0.01em',
  color: 'var(--vuka-text-title)',
}

/** Eyebrow — Plex Sans Medium 11, uppercase, +10% tracking. */
const eyebrow: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  color: 'var(--vuka-text-dim)',
  marginBottom: 6,
}

const pageWrap: React.CSSProperties = {
  padding: '24px 24px 28px',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
}

/** Icon in a 40px glass circle with a tiny inner shadow. */
function LeafIcon({ Icon }: { Icon: React.ElementType }) {
  return (
    <span className="glass-circle" style={{ width: 40, height: 40 }}>
      <Icon size={20} color="var(--vuka-text-title)" style={{ opacity: 0.85 }} />
    </span>
  )
}

/**
 * VIGIL member home — a single routed surface that renders by journey state.
 * The state is driven from MemberContext; the off-phone DemoPanel switches it.
 */
export function VigilHome() {
  const { journeyState } = useMember()

  switch (journeyState) {
    case 'check_pending':
    case 'checking':
      return journeyState === 'check_pending' ? <JourneyCheck /> : <CheckedIn />
    case 'armed':
    case 'arming':
      return <JourneyActive />
    default:
      return <HomeDisarmed />
  }
}

/* ── Home / Start journey (disarmed) ──────────────────────────── */

function HomeDisarmed() {
  const { memberName, guardians, setJourneyState } = useMember()
  const accepted = guardians.filter((g) => g.status === 'accepted').length
  const firstName = memberName.split(' ')[0]

  return (
    <div style={pageWrap}>
      <Greeting name={firstName} />

      {/* Hero — ready to start */}
      <GlassCard hero style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <LeafIcon Icon={ShieldChevron} />
          <p style={{ ...eyebrow, marginBottom: 0 }}>VIGIL</p>
        </div>
        <h1 style={heroWord}>Ready</h1>
        <p style={{ fontSize: 15, color: 'var(--vuka-text-secondary)', margin: '10px 0 20px', lineHeight: 1.5 }}>
          VIGIL isn't listening yet. Start a journey and it will listen on this
          phone until you end it.
        </p>
        <Button variant="primary" size="lg" fullWidth
          trailingIcon={<ArrowRight size={16} weight="bold" />}
          onClick={() => setJourneyState('armed')}
        >
          Start journey
        </Button>
      </GlassCard>

      {/* Guardians ready */}
      <GlassCard style={{ padding: 20 }}>
        <RowHeader Icon={Users} title="Guardians ready" />
        <p style={{ fontSize: 15, color: 'var(--vuka-text-label)', marginTop: 10 }}>
          {accepted} accepted · {guardians.length - accepted} pending
        </p>
        <p style={{ fontSize: 13, color: 'var(--vuka-text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
          We recommend at least two guardians who don't live with you.
        </p>
      </GlassCard>

      {/* Honest disclosure — a quiet caption, not a card */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '0 4px' }}>
        <Microphone size={16} color="var(--vuka-text-dim)" style={{ marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: 'var(--vuka-text-dim)', lineHeight: 1.5 }}>
          Discreet, not invisible: Android shows a microphone dot while a journey
          is active.
        </p>
      </div>
    </div>
  )
}

/* ── Journey active (armed) ───────────────────────────────────── */

function JourneyActive() {
  const { guardians, networkAvailable, setJourneyState } = useMember()
  const accepted = guardians.filter((g) => g.status === 'accepted').length

  return (
    <div style={pageWrap}>
      {/* Hero — the signature screen: state word + listening line */}
      <GlassCard hero style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <LeafIcon Icon={Waveform} />
          <p style={{ ...eyebrow, marginBottom: 0 }}>VIGIL · listening</p>
        </div>
        <h1 style={heroWord}>Journey active</h1>

        {/* The listening line — VUKA's visual identity */}
        <div style={{ margin: '16px 0 4px' }}>
          <ListeningLine />
        </div>
        <p style={{ fontSize: 15, color: 'var(--vuka-text-secondary)', marginTop: 8 }}>
          Listening on this phone.
        </p>
      </GlassCard>

      {/* Guardians + server contact — merged into one supporting card */}
      <GlassCard style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <RowHeader Icon={Users} title="Guardians ready" />
          {networkAvailable
            ? <StatusChip status="received" label="Server reached" size="sm" />
            : <StatusChip status="neutral" label="Offline" size="sm" />}
        </div>

        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {guardians.map((g) => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 14, color: 'var(--vuka-text-label)' }}>{g.name}</span>
              <span style={{ fontSize: 13, color: g.status === 'accepted' ? 'var(--vuka-text-secondary)' : 'var(--vuka-text-dim)' }}>
                {g.status === 'accepted' ? 'Ready' : 'Pending'}
              </span>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: 'var(--vuka-border)', margin: '14px 0' }} />

        {networkAvailable ? (
          <p style={{ fontSize: 13, color: 'var(--vuka-text-secondary)', lineHeight: 1.5 }}>
            {accepted} of {guardians.length} would be alerted if you don't answer a
            check. Last server contact <span style={{ fontFamily: 'var(--font-mono)' }}>22:14 SAST</span>.
          </p>
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <WifiSlash size={16} color="var(--vuka-text-dim)" style={{ marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: 'var(--vuka-text-secondary)', lineHeight: 1.5 }}>
              No network. Alerts need data — events wait on this phone and are lost
              if it's wiped before they're sent.
            </p>
          </div>
        )}
      </GlassCard>

      <Button variant="ghost" size="lg" fullWidth onClick={() => setJourneyState('disarmed')}>
        End journey
      </Button>
    </div>
  )
}

/* ── Journey check (flat, plain — one frame for normal & duress) ── */

function JourneyCheck() {
  const { setJourneyState, setRecordFrozen } = useMember()

  const handleComplete = () => {
    // Duress rule: record metadata freezes after ANY PIN entry, normal or duress.
    // This frame never reveals which PIN was entered.
    setRecordFrozen(true)
    setJourneyState('checking')
  }

  return (
    // A solid ivory backdrop covers the soft fields — the check is flat and plain.
    <div
      style={{
        minHeight: '100%',
        background: 'var(--vuka-bg-base)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px 24px 40px',
      }}
    >
      <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--vuka-text-title)', textAlign: 'center' }}>
        Journey check
      </p>
      <p style={{ fontSize: 15, color: 'var(--vuka-text-secondary)', textAlign: 'center', margin: '8px 0 32px' }}>
        Enter your PIN to continue
      </p>

      <PinKeypad onComplete={handleComplete} resetOnComplete />

    </div>
  )
}

/* ── Checked in (one frame) ───────────────────────────────────── */

function CheckedIn() {
  const { setJourneyState } = useMember()

  useEffect(() => {
    const t = setTimeout(() => setJourneyState('armed'), 2600)
    return () => clearTimeout(t)
  }, [setJourneyState])

  return (
    <div
      style={{
        minHeight: '100%',
        background: 'var(--vuka-bg-base)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        padding: '24px 24px 40px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--vuka-green-fill)',
          border: '1px solid var(--vuka-green-border)',
        }}
      >
        <CheckCircle size={40} weight="fill" color="var(--vuka-green-text)" />
      </div>
      <div>
        <h1 style={heroWord}>Checked in</h1>
        <p style={{ fontSize: 15, color: 'var(--vuka-text-secondary)', marginTop: 6 }}>
          Journey continues
        </p>
      </div>
    </div>
  )
}

/* ── Shared bits ──────────────────────────────────────────────── */

function Greeting({ name }: { name: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={eyebrow}>Good evening</p>
        <p style={{ fontSize: 26, fontWeight: 600, color: 'var(--vuka-text-title)', letterSpacing: '-0.01em' }}>
          {name}
        </p>
      </div>
      <DotsThreeCircle size={24} color="var(--vuka-text-dim)" />
    </div>
  )
}

function RowHeader({ Icon, title }: { Icon: React.ElementType; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <LeafIcon Icon={Icon} />
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.01em', color: 'var(--vuka-text-header)' }}>
        {title}
      </span>
    </div>
  )
}

import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CaretLeft, Palette, Drop, ShieldCheck, Trash, Key,
  FileText, Info, ArrowClockwise, WarningCircle,
} from '@phosphor-icons/react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { ListRow } from '@/components/ui/ListRow'
import { StatusChip } from '@/components/ui/StatusChip'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { PinKeypad } from '@/components/ui/PinKeypad'
import { Toast } from '@/components/ui/Toast'
import { useDemo, type VukaTheme } from '@/contexts/DemoContext'
import { useMember } from '@/contexts/MemberContext'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { eyebrow, pageWrap, bodyText, InlineError, NoNetworkNotice } from '@/pages/onboarding/shared'

type PinGate = 'remove-guardian' | 'delete-data' | 'recovery' | null

const THEMES: { value: VukaTheme; label: string }[] = [
  { value: 'ivory', label: 'Ivory' },
  { value: 'silver', label: 'Silver' },
  { value: 'midnight', label: 'Midnight' },
]

/**
 * Settings. Every PIN-gated action shows the same PIN sheet, and the
 * success toast and list state are identical whichever PIN was entered —
 * the duress rule holds here too.
 */
export function Settings() {
  const navigate = useNavigate()
  const { theme, setTheme, blurEnabled, setBlurEnabled, effectiveBlur } = useDemo()
  const { guardians, networkAvailable } = useMember()
  const { settingsLoadState } = useOnboarding()

  const [pinGate, setPinGate] = useState<PinGate>(null)
  const [pinGateTarget, setPinGateTarget] = useState<string | null>(null)
  const [scheduledRemovals, setScheduledRemovals] = useState<Set<string>>(new Set())
  const [dataScheduled, setDataScheduled] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [infoSheet, setInfoSheet] = useState<'privacy' | 'about' | 'recovery-shown' | null>(null)

  const openGate = (gate: PinGate, target?: string) => {
    setPinGate(gate)
    setPinGateTarget(target ?? null)
  }

  const handlePinComplete = () => {
    // Any 4-digit PIN succeeds here — normal and duress look identical.
    // From spec: a duress no-op looks accepted; a duress removal/deletion/
    // recovery shows the same success as a normal one.
    if (pinGate === 'remove-guardian' && pinGateTarget) {
      setScheduledRemovals((s) => new Set(s).add(pinGateTarget))
      setToast('Scheduled: takes effect in 24 hours')
    } else if (pinGate === 'delete-data') {
      setDataScheduled(true)
      setToast('Deletion scheduled: takes effect in 72 hours')
    } else if (pinGate === 'recovery') {
      setInfoSheet('recovery-shown')
      setToast(null)
    }
    setPinGate(null)
    setPinGateTarget(null)
  }

  if (settingsLoadState === 'loading') {
    return (
      <div style={pageWrap}>
        <Header onBack={() => navigate('/')} />
        <GlassCard hero style={{ padding: 20 }}>
          <p style={bodyText}>Loading your settings…</p>
        </GlassCard>
      </div>
    )
  }

  if (settingsLoadState === 'error') {
    return (
      <div style={pageWrap}>
        <Header onBack={() => navigate('/')} />
        <InlineError>Settings couldn't load. Check your connection and try again.</InlineError>
        <Button variant="secondary" size="lg" fullWidth icon={<ArrowClockwise size={18} />}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div style={{ ...pageWrap, position: 'relative' }}>
      <Header onBack={() => navigate('/')} />

      {!networkAvailable && (
        <NoNetworkNotice>No network. Changes here will send once you're back online.</NoNetworkNotice>
      )}

      {/* Appearance */}
      <Section title="Appearance">
        <SubLabel>Theme</SubLabel>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              style={{
                flex: 1, minHeight: 44, borderRadius: 'var(--vuka-radius-sm)',
                border: `1.5px solid ${theme === t.value ? 'var(--vuka-text-title)' : 'var(--vuka-border)'}`,
                background: theme === t.value ? 'var(--vuka-bg-elevated)' : 'transparent',
                fontSize: 13, fontWeight: 600, color: 'var(--vuka-text-label)', cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <ListRow
          leading={<Drop size={18} />}
          label="Card blur"
          sublabel={effectiveBlur ? 'On. Turn it off for a plainer, faster screen.' : 'Off. Cards use a solid background.'}
          trailing={effectiveBlur ? undefined : <StatusChip status="neutral" label="Off" size="sm" />}
          onClick={effectiveBlur ? () => setBlurEnabled(false) : undefined}
        />
      </Section>

      {/* Guardians */}
      <Section title="Guardians">
        {guardians.map((g) => {
          const scheduled = scheduledRemovals.has(g.id)
          return (
            <ListRow
              key={g.id}
              leading={<ShieldCheck size={18} />}
              label={g.name}
              sublabel={scheduled ? 'Scheduled: takes effect in 24 hours' : g.phone}
              trailing={
                scheduled
                  ? <StatusChip status="neutral" label="Scheduled" size="sm" />
                  : <span style={{ fontSize: 13, color: 'var(--vuka-text-dim)' }}>Remove</span>
              }
              onClick={scheduled ? undefined : () => openGate('remove-guardian', g.id)}
            />
          )
        })}
      </Section>

      {/* Privacy & data */}
      <Section title="Privacy & data">
        <ListRow leading={<FileText size={18} />} label="Privacy notice" chevron onClick={() => setInfoSheet('privacy')} />
        <ListRow leading={<Info size={18} />} label="About the record" chevron onClick={() => setInfoSheet('about')} />
        <ListRow leading={<Key size={18} />} label="Recovery" sublabel="View your 10-word recovery code" chevron onClick={() => openGate('recovery')} />
        {dataScheduled ? (
          <ListRow
            leading={<Trash size={18} />}
            label="Delete my data"
            sublabel="Scheduled: takes effect in 72 hours"
            trailing={<StatusChip status="neutral" label="Scheduled" size="sm" />}
          />
        ) : (
          <ListRow leading={<Trash size={18} />} label="Delete my data" danger chevron onClick={() => openGate('delete-data')} />
        )}
      </Section>

      {/* OPEN placeholder — decision pending */}
      <GlassCard style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <WarningCircle size={16} color="var(--vuka-text-dim)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--vuka-text-label)' }}>After the delay, under duress</span>
              <StatusChip status="simulated" label="OPEN" size="sm" />
            </div>
            <p style={{ fontSize: 12, color: 'var(--vuka-text-dim)', lineHeight: 1.5 }}>
              What a removed guardian or deleted data looks like once the 24-hour or
              72-hour delay ends is not decided yet — see P3.L8.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* PIN sheet — identical for normal and duress */}
      {pinGate && (
        <Overlay onClose={() => setPinGate(null)}>
          <BottomSheet title="Enter your PIN" onClose={() => setPinGate(null)}>
            <p style={{ fontSize: 14, color: 'var(--vuka-text-secondary)', marginBottom: 20 }}>
              Confirm it's you to continue.
            </p>
            <PinKeypad onComplete={handlePinComplete} />
          </BottomSheet>
        </Overlay>
      )}

      {/* Info sheets */}
      {infoSheet && (
        <Overlay onClose={() => setInfoSheet(null)}>
          <BottomSheet
            title={infoSheet === 'privacy' ? 'Privacy notice' : infoSheet === 'about' ? 'About the record' : 'Your recovery code'}
            onClose={() => setInfoSheet(null)}
          >
            <InfoSheetBody kind={infoSheet} />
          </BottomSheet>
        </Overlay>
      )}

      {toast && <Toast kind="success" message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}

function InfoSheetBody({ kind }: { kind: 'privacy' | 'about' | 'recovery-shown' }) {
  if (kind === 'privacy') {
    return (
      <p style={{ fontSize: 14, color: 'var(--vuka-text-secondary)', lineHeight: 1.6 }}>
        We keep what a journey needs to work: your name, your guardians, and the events
        VIGIL records while a journey is armed. We never sell your data, and only your
        guardians see an alert — and only when you don't answer a check.
      </p>
    )
  }
  if (kind === 'about') {
    return (
      <p style={{ fontSize: 14, color: 'var(--vuka-text-secondary)', lineHeight: 1.6 }}>
        Your record proves when each entry was made, not what happened. Only a 33-byte
        fingerprint of each entry goes on the public ledger — never your name, your
        location, or anything a stranger could read.
      </p>
    )
  }
  return (
    <p style={{ fontSize: 14, color: 'var(--vuka-text-secondary)', lineHeight: 1.6 }}>
      Your recovery code was shown once, during setup. If you wrote it down, keep it
      somewhere safe — it's the only way back into your account if you lose this phone.
    </p>
  )
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button
        onClick={onBack}
        aria-label="Back"
        style={{
          width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'none', border: '1px solid var(--vuka-border)',
          cursor: 'pointer', color: 'var(--vuka-text-secondary)', flexShrink: 0,
        }}
      >
        <CaretLeft size={18} />
      </button>
      <div>
        <p style={{ ...eyebrow, marginBottom: 2 }}>VUKA</p>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--vuka-text-title)', letterSpacing: '-0.01em', margin: 0 }}>Settings</h1>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <GlassCard style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Palette size={16} color="var(--vuka-text-dim)" style={{ display: title === 'Appearance' ? 'block' : 'none' }} />
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--vuka-text-header)' }}>{title}</p>
      </div>
      {children}
    </GlassCard>
  )
}

function SubLabel({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 12, color: 'var(--vuka-text-dim)', marginBottom: 8 }}>{children}</p>
}

function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: '100%' }}>{children}</div>
    </div>
  )
}

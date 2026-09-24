import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ArrowRight, Eye } from '@phosphor-icons/react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { StatusChip } from '@/components/ui/StatusChip'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useMember } from '@/contexts/MemberContext'
import { useOnboarding, type GuardiansPreset } from '@/contexts/OnboardingContext'
import { StepHeader, pageWrap, bodyText, eyebrow, InlineError, NoNetworkNotice, CodeBoxes, QrBlock, CircleIcon } from './shared'

interface DemoGuardian { id: string; name: string; status: 'pending' | 'accepted' }

const PRESETS: Record<GuardiansPreset, DemoGuardian[]> = {
  empty: [],
  pending: [{ id: 'g1', name: 'Sipho Ndlovu', status: 'pending' }],
  mixed: [
    { id: 'g1', name: 'Sipho Ndlovu', status: 'accepted' },
    { id: 'g2', name: 'Nomsa Khumalo', status: 'pending' },
  ],
}

/** Onboarding step 8 — Invite guardians. Finishing lands on Home. */
export function InviteGuardians() {
  const navigate = useNavigate()
  const { memberName } = useMember()
  const { guardiansPreset, inviteSheetState } = useOnboarding()
  const [guardians, setGuardians] = useState<DemoGuardian[]>(() => PRESETS[guardiansPreset])
  const [showInvite, setShowInvite] = useState(false)

  const accepted = guardians.filter((g) => g.status === 'accepted').length

  const finishInvite = () => {
    const next = guardians.length + 1
    const names = ['Sipho Ndlovu', 'Nomsa Khumalo', 'Bongani Sithole']
    setGuardians((g) => [...g, { id: `g${next}`, name: names[g.length % names.length], status: 'pending' }])
    setShowInvite(false)
  }

  return (
    <div style={{ ...pageWrap, position: 'relative' }}>
      <StepHeader title="Invite guardians" step={8} totalSteps={8} onBack={() => navigate('/welcome/pins')} />

      <GlassCard hero style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <CircleIcon Icon={Users} />
          <p style={{ ...eyebrow, marginBottom: 0 }}>Guardians</p>
        </div>
        <p style={bodyText}>
          We recommend at least two guardians who don't live with you.
        </p>
      </GlassCard>

      <GlassCard style={{ padding: 20 }}>
        {guardians.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--vuka-text-secondary)', lineHeight: 1.5, padding: '4px 0' }}>
            No guardians yet. Invite someone you trust to get started.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {guardians.map((g, i) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < guardians.length - 1 ? '1px solid var(--vuka-border-subtle)' : 'none' }}>
                <span style={{ fontSize: 15, color: 'var(--vuka-text-label)' }}>{g.name}</span>
                <StatusChip status={g.status === 'accepted' ? 'received' : 'neutral'} label={g.status === 'accepted' ? 'Accepted' : 'Pending'} size="sm" />
              </div>
            ))}
            <p style={{ fontSize: 12, color: 'var(--vuka-text-dim)', marginTop: 8 }}>
              {accepted} accepted · {guardians.length - accepted} pending
            </p>
          </div>
        )}
      </GlassCard>

      <button
        onClick={() => setShowInvite(true)}
        className="glass-pill vuka-btn"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          minHeight: 52, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600,
          color: 'var(--vuka-text-title)', fontFamily: 'var(--font-sans)',
        }}
      >
        Invite a guardian
      </button>

      {/* What your guardians will see */}
      <GlassCard style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Eye size={16} color="var(--vuka-text-secondary)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--vuka-text-header)' }}>What your guardians will see</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--vuka-text-secondary)', lineHeight: 1.5 }}>
          A guardian only hears from VIGIL if you don't answer a Journey check, or if you use your duress PIN. They'll see your name, why you were alerted, and a location fix if one was shared — never your day-to-day movement.
        </p>
      </GlassCard>

      <div style={{ flex: 1 }} />
      <Button variant="primary" size="lg" fullWidth
        trailingIcon={<ArrowRight size={16} weight="bold" />}
        onClick={() => navigate('/')}
      >
        Finish setup
      </Button>

      {showInvite && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.45)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowInvite(false) }}
        >
          <div style={{ width: '100%' }}>
            <BottomSheet title="Invite a guardian" onClose={() => setShowInvite(false)}>
              <InviteContent
                state={inviteSheetState}
                memberName={memberName}
                onDone={finishInvite}
              />
            </BottomSheet>
          </div>
        </div>
      )}
    </div>
  )
}

function InviteContent({
  state, memberName, onDone,
}: {
  state: 'idle' | 'expired' | 'locked'
  memberName: string
  onDone: () => void
}) {
  const { networkAvailable } = useMember()

  if (state === 'expired') {
    return (
      <>
        <InlineError>This invite code expired after 10 minutes. Generate a new one.</InlineError>
        <div style={{ height: 16 }} />
        <Button variant="primary" fullWidth onClick={onDone}>Generate a new code</Button>
      </>
    )
  }

  if (state === 'locked') {
    return <InlineError>Too many wrong attempts. This code is locked. Generate a new one from Settings.</InlineError>
  }

  return (
    <>
      <p style={{ fontSize: 14, color: 'var(--vuka-text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
        Share this code, or have them scan the QR block. Valid for 10 minutes, single use, 5 attempts.
      </p>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <CodeBoxes length={6} value="482915" />
        <QrBlock size={120} />
      </div>
      <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--vuka-text-dim)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
        SIMULATED — not a real invite link
      </p>
      {!networkAvailable && <NoNetworkNotice>No network. Guardians can't accept this invite until you're back online.</NoNetworkNotice>}
      <div style={{ height: 12 }} />
      <Button variant="primary" fullWidth disabled={!networkAvailable} onClick={onDone}>
        Done — {memberName.split(' ')[0]} sent the invite
      </Button>
    </>
  )
}

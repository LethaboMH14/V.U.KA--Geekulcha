import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldChevron, Bell, ClockCounterClockwise, SignOut } from '@phosphor-icons/react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { StatusChip } from '@/components/ui/StatusChip'
import { Toast } from '@/components/ui/Toast'
import { useDemo } from '@/contexts/DemoContext'
import { useMember } from '@/contexts/MemberContext'
import { eyebrow, heroWord, pageWrap, bodyText, CircleIcon } from '@/pages/onboarding/shared'

/** Guardian standby — who you protect, whether alerts are on, and the last test alert. */
export function Standby() {
  const navigate = useNavigate()
  const { setRole } = useDemo()
  const { memberName } = useMember()
  const [alertsOn, setAlertsOn] = useState(true)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const leave = () => {
    setConfirmLeave(false)
    setRole('member')
    navigate('/welcome')
  }

  return (
    <div style={{ ...pageWrap, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShieldChevron size={20} weight="fill" color="var(--vuka-text-secondary)" />
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--vuka-text-header)' }}>
          Guardian
        </span>
      </div>

      <GlassCard hero style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <CircleIcon Icon={ShieldChevron} />
          <p style={{ ...eyebrow, marginBottom: 0 }}>Who you protect</p>
        </div>
        <p style={heroWord}>{memberName}</p>
        <p style={{ ...bodyText, marginTop: 8 }}>
          You'll hear from VIGIL only if they don't answer a check, or if they use
          their duress PIN.
        </p>
      </GlassCard>

      <GlassCard style={{ padding: 20 }}>
        <button
          onClick={() => setAlertsOn((v) => !v)}
          style={{
            width: '100%', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={18} color="var(--vuka-text-secondary)" />
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--vuka-text-label)' }}>Alerts</span>
          </div>
          <StatusChip status="neutral" label={alertsOn ? 'On' : 'Off'} size="sm" />
        </button>

        <div style={{ height: 1, background: 'var(--vuka-border)', margin: '16px 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <ClockCounterClockwise size={18} color="var(--vuka-text-secondary)" />
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--vuka-text-label)' }}>Last test alert</span>
        </div>
        <p style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--vuka-text-secondary)', marginBottom: 14 }}>
          2026-09-18 · 19:02 SAST
        </p>
        <Button variant="secondary" fullWidth onClick={() => setToast('Test alert sent')}>
          Send a test alert
        </Button>
      </GlassCard>

      <div style={{ flex: 1 }} />

      <Button variant="ghost" size="lg" fullWidth icon={<SignOut size={18} />} onClick={() => setConfirmLeave(true)}>
        Leave as guardian
      </Button>

      {confirmLeave && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.45)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmLeave(false) }}
        >
          <div style={{ width: '100%' }}>
            <BottomSheet title="Leave as guardian" onClose={() => setConfirmLeave(false)}>
              <p style={{ fontSize: 14, color: 'var(--vuka-text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                {memberName.split(' ')[0]} will no longer be able to alert you. You can be invited again later.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button variant="primary" fullWidth onClick={leave}>Leave as guardian</Button>
                <Button variant="ghost" fullWidth onClick={() => setConfirmLeave(false)}>Cancel</Button>
              </div>
            </BottomSheet>
          </div>
        </div>
      )}

      {toast && <Toast kind="success" message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}

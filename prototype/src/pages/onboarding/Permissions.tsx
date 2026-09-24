import { useNavigate } from 'react-router-dom'
import { Microphone, Bell, MapPinLine, Gear } from '@phosphor-icons/react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { StatusChip } from '@/components/ui/StatusChip'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { StepHeader, pageWrap, bodyText, InlineError } from './shared'

/** Onboarding step 6 — Permissions. Microphone, notifications, location (optional). */
export function Permissions() {
  const navigate = useNavigate()
  const {
    micDenied, notifDenied, locationDenied, fullScreenAlertsBlocked,
  } = useOnboarding()

  const canArm = !micDenied && !notifDenied

  return (
    <div style={pageWrap}>
      <StepHeader title="Permissions" step={6} onBack={() => navigate('/welcome/verify')} />

      <GlassCard hero style={{ padding: 20 }}>
        <p style={bodyText}>VIGIL needs a few permissions to listen and to reach you.</p>
      </GlassCard>

      <GlassCard style={{ padding: 20 }}>
        <PermissionRow
          Icon={Microphone}
          title="Microphone"
          reason="To listen for distress sounds while a journey is armed."
          denied={micDenied}
          deniedNote="VIGIL can't arm without this."
        />
        <Divider />
        <PermissionRow
          Icon={Bell}
          title="Notifications"
          reason="To show the Journey check and the active-journey notice."
          denied={notifDenied}
          deniedNote="VIGIL can't arm without this."
        />
        <Divider />
        <PermissionRow
          Icon={MapPinLine}
          title="Location"
          reason="Optional — shares a fix with guardians if you don't answer a check."
          denied={locationDenied}
          deniedNote="Arming still works, without a location fix."
          optional
        />
      </GlassCard>

      {!canArm && (
        <InlineError>
          Open Settings on this phone and allow microphone and notifications to continue.
        </InlineError>
      )}

      {fullScreenAlertsBlocked && (
        <p style={{ fontSize: 12, color: 'var(--vuka-text-dim)', lineHeight: 1.5, padding: '0 4px' }}>
          Full-screen alerts aren't allowed on this phone. Your Journey check will arrive as a high-priority notification instead.
        </p>
      )}

      <div style={{ flex: 1 }} />

      {canArm ? (
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/welcome/pins')}>
          Continue
        </Button>
      ) : (
        <Button variant="secondary" size="lg" fullWidth icon={<Gear size={18} />}>
          Open settings
        </Button>
      )}
    </div>
  )
}

function PermissionRow({
  Icon, title, reason, denied, deniedNote, optional = false,
}: {
  Icon: React.ElementType
  title: string
  reason: string
  denied: boolean
  deniedNote: string
  optional?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0' }}>
      <span className="glass-circle" style={{ width: 40, height: 40, flexShrink: 0 }}>
        <Icon size={20} color="var(--vuka-text-title)" style={{ opacity: 0.85 }} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--vuka-text-header)' }}>
            {title}{optional && <span style={{ fontWeight: 400, color: 'var(--vuka-text-dim)' }}> · optional</span>}
          </span>
          <StatusChip status="neutral" label={denied ? 'Not allowed' : 'Allowed'} size="sm" />
        </div>
        <p style={{ fontSize: 13, color: 'var(--vuka-text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
          {denied ? deniedNote : reason}
        </p>
      </div>
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--vuka-border-subtle)' }} />
}

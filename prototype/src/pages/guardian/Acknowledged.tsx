import { useNavigate } from 'react-router-dom'
import { SealCheck, PhoneX } from '@phosphor-icons/react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { TimelineItem } from '@/components/ui/TimelineItem'
import { useMember } from '@/contexts/MemberContext'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { eyebrow, heroWord, pageWrap } from '@/pages/onboarding/shared'

/**
 * Guardian — Acknowledged. After a response is recorded, this is the
 * incident timeline as the guardian sees it. The alert is never withdrawn;
 * "Call them" stays locked until stand-down or closure.
 */
export function Acknowledged() {
  const navigate = useNavigate()
  const { memberName } = useMember()
  const { lateAnswerUpdate } = useOnboarding()

  return (
    <div style={pageWrap}>
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        <div
          style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--vuka-green-fill)', border: '1px solid var(--vuka-green-border)',
          }}
        >
          <SealCheck size={32} weight="fill" color="var(--vuka-green-text)" />
        </div>
        <p style={heroWord}>Response recorded</p>
        <p style={{ fontSize: 15, color: 'var(--vuka-text-secondary)', marginTop: 6 }}>
          Signed on this device
        </p>
      </div>

      <GlassCard style={{ padding: 20 }}>
        <p style={eyebrow}>Timeline · {memberName}</p>
        <div style={{ marginTop: 12 }}>
          <TimelineItem kind="journey_started" label="Alert received" time="22:14" chipStatus="received" />
          <TimelineItem kind="sound_detected" label="You opened the alert" time="22:15" />
          <TimelineItem kind="check_answered" label="I called 10111" time="22:16" monoDetail="self-reported" chipStatus="received" />
          {lateAnswerUpdate ? (
            <TimelineItem kind="journey_ended" label="A late normal PIN answered the check" time="22:24" tag="(late) answered" isLast />
          ) : (
            <TimelineItem kind="journey_ended" label="Waiting on stand-down or closure" time="—" isLast />
          )}
        </div>
      </GlassCard>

      <div style={{ flex: 1 }} />

      <Button variant="ghost" size="lg" fullWidth disabled icon={<PhoneX size={18} />}>
        Call them
      </Button>
      <p style={{ fontSize: 12, color: 'var(--vuka-text-dim)', textAlign: 'center', lineHeight: 1.5 }}>
        Unlocks after stand-down or when the incident closes. The alert is never withdrawn.
      </p>

      <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/guardian/standby')}>
        Back to standby
      </Button>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { ShieldChevron, Microphone, ArrowRight, UsersThree } from '@phosphor-icons/react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { useDemo } from '@/contexts/DemoContext'
import { heroWord, eyebrow, pageWrap, bodyText, CircleIcon } from './shared'

/**
 * Onboarding step 1 — Welcome. What VIGIL does in three short lines, plus
 * the discreet-not-invisible disclosure that stays with VIGIL everywhere.
 */
export function Welcome() {
  const navigate = useNavigate()
  const { setRole } = useDemo()

  return (
    <div style={pageWrap}>
      <div style={{ paddingTop: 12, textAlign: 'center' }}>
        <p style={{ ...eyebrow, textAlign: 'center' }}>VUKA</p>
        <p style={{ fontSize: 15, color: 'var(--vuka-text-secondary)' }}>
          You are not alone. You don't have to ask.
        </p>
      </div>

      <GlassCard hero style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <CircleIcon Icon={ShieldChevron} />
          <p style={{ ...eyebrow, marginBottom: 0 }}>VIGIL</p>
        </div>
        <h1 style={heroWord}>What VIGIL does</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '14px 0 0' }}>
          <p style={bodyText}>It listens on this phone while a journey is armed — never in the background otherwise.</p>
          <p style={bodyText}>A distress sound shows a quiet Journey check, not an alarm.</p>
          <p style={bodyText}>Your guardians only hear from VIGIL if you don't answer, or if you use your duress PIN.</p>
        </div>
      </GlassCard>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '0 4px' }}>
        <Microphone size={16} color="var(--vuka-text-dim)" style={{ marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: 'var(--vuka-text-dim)', lineHeight: 1.5 }}>
          Discreet, not invisible: Android shows a microphone dot while VIGIL is listening.
        </p>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button variant="primary" size="lg" fullWidth
          trailingIcon={<ArrowRight size={16} weight="bold" />}
          onClick={() => navigate('/welcome/sign-in')}
        >
          Get started
        </Button>
        <Button variant="ghost" size="lg" fullWidth
          icon={<UsersThree size={18} />}
          onClick={() => { setRole('guardian'); navigate('/guardian/enrol') }}
        >
          I'm a guardian
        </Button>
      </div>
    </div>
  )
}

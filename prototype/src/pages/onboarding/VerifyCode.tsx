import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { useMember } from '@/contexts/MemberContext'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { StepHeader, pageWrap, bodyText, InlineError, NoNetworkNotice, CodeBoxes } from './shared'

const RESEND_SECONDS = 45

/**
 * Onboarding step 5 — Verify code. Six one-digit boxes in Plex Mono.
 * `verifyState` is set from DemoPanel so wrong/expired/locked are all
 * reachable without typing a real code.
 */
export function VerifyCode() {
  const navigate = useNavigate()
  const { networkAvailable } = useMember()
  const { verifyState, setVerifyState } = useOnboarding()
  const [value, setValue] = useState('')
  const [seconds, setSeconds] = useState(RESEND_SECONDS)
  const [attemptsLeft, setAttemptsLeft] = useState(5)

  useEffect(() => {
    if (verifyState === 'locked') return
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [verifyState])

  const disabled = verifyState === 'locked'

  const handleDigit = (key: string) => {
    if (disabled) return
    if (key === '⌫') {
      setValue((v) => v.slice(0, -1))
      return
    }
    if (value.length >= 6) return
    const next = value + key
    setValue(next)
    if (next.length === 6) {
      if (verifyState === 'wrong') {
        setAttemptsLeft((a) => Math.max(0, a - 1))
        setTimeout(() => setValue(''), 500)
        return
      }
      if (verifyState === 'expired') return
      navigate('/welcome/permissions')
    }
  }

  const minutes = Math.floor(seconds / 60)
  const secs = String(seconds % 60).padStart(2, '0')

  return (
    <div style={pageWrap}>
      <StepHeader title="Verify code" step={5} onBack={() => navigate('/welcome/phone')} />

      <GlassCard hero style={{ padding: 20 }}>
        <p style={bodyText}>Enter the 6-digit code we sent by SMS.</p>
      </GlassCard>

      <div style={{ padding: '8px 0' }}>
        <CodeBoxes length={6} value={value} disabled={disabled} />
      </div>

      {verifyState === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
              <button
                key={i}
                onClick={() => handleDigit(k)}
                disabled={k === ''}
                aria-hidden={k === '' || undefined}
                tabIndex={k === '' ? -1 : undefined}
                className="pin-key-press"
                style={{
                  height: 52, borderRadius: 'var(--vuka-radius-sm)',
                  background: k === '' ? 'transparent' : 'var(--vuka-bg-elevated)',
                  border: k === '' ? 'none' : '1px solid var(--vuka-border)',
                  color: 'var(--vuka-text-title)', fontSize: 18, fontFamily: 'var(--font-sans)',
                  cursor: k === '' ? 'default' : 'pointer',
                }}
              >
                {k}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--vuka-text-secondary)', textAlign: 'center' }}>
            {seconds > 0 ? `Resend in ${minutes}:${secs}` : 'Didn\'t get it? Resend the code.'}
          </p>
        </div>
      )}

      {verifyState === 'wrong' && (
        <InlineError>
          {attemptsLeft > 0
            ? `That code isn't right. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left.`
            : 'That code isn\'t right. Try again in 15 minutes.'}
        </InlineError>
      )}

      {verifyState === 'expired' && (
        <InlineError>This code has expired. Request a new one.</InlineError>
      )}

      {verifyState === 'locked' && (
        <InlineError>Too many attempts. Try again in 15 minutes.</InlineError>
      )}

      {!networkAvailable && (
        <NoNetworkNotice>No network. We can't verify the code right now.</NoNetworkNotice>
      )}

      <div style={{ flex: 1 }} />

      {verifyState !== 'idle' && (
        <Button variant="secondary" size="lg" fullWidth disabled={disabled} onClick={() => { setVerifyState('idle'); setValue(''); setSeconds(RESEND_SECONDS) }}>
          Resend code
        </Button>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckSquare, Square, QrCode, Keyboard } from '@phosphor-icons/react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { useOnboarding } from '@/contexts/OnboardingContext'
import {
  StepHeader, pageWrap, bodyText, eyebrow, InlineError, CodeBoxes, ScannerFrame,
} from '@/pages/onboarding/shared'

type Stage = 'code' | 'consent'
type Method = 'code' | 'scan'

/**
 * Guardian enrolment: enter the 6-digit invite code (or scan it), then an
 * explicit consent step. Guardian responses and token updates are signed
 * on the guardian's own device — not shown here, annotated only.
 */
export function Enrol() {
  const navigate = useNavigate()
  const { enrolState } = useOnboarding()
  const [stage, setStage] = useState<Stage>('code')
  const [method, setMethod] = useState<Method>('code')
  const [value, setValue] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(5)
  const [understood, setUnderstood] = useState(false)

  const disabled = enrolState === 'locked'

  const handleDigit = (key: string) => {
    if (disabled) return
    if (key === '⌫') { setValue((v) => v.slice(0, -1)); return }
    if (value.length >= 6) return
    const next = value + key
    setValue(next)
    if (next.length === 6) {
      if (enrolState === 'wrong') {
        setAttemptsLeft((a) => Math.max(0, a - 1))
        setTimeout(() => setValue(''), 500)
        return
      }
      if (enrolState === 'expired') return
      setStage('consent')
    }
  }

  if (stage === 'consent') {
    return (
      <div style={pageWrap}>
        <StepHeader title="Before you continue" step={2} totalSteps={2} onBack={() => setStage('code')} />

        <GlassCard hero style={{ padding: 20 }}>
          <p style={{ ...eyebrow, marginBottom: 6 }}>What is recorded about you</p>
          <p style={bodyText}>
            When you open an alert, and how you respond. Nothing else about you is
            recorded as a guardian.
          </p>
        </GlassCard>

        <button
          onClick={() => setUnderstood((v) => !v)}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, background: 'none', border: 'none',
            cursor: 'pointer', padding: '10px 4px', minHeight: 48, textAlign: 'left',
          }}
        >
          {understood ? <CheckSquare size={22} color="var(--vuka-text-title)" weight="fill" style={{ flexShrink: 0, marginTop: 1 }} /> : <Square size={22} color="var(--vuka-text-secondary)" style={{ flexShrink: 0, marginTop: 1 }} />}
          <span style={{ fontSize: 14, color: 'var(--vuka-text-label)', lineHeight: 1.5 }}>
            I understand what's recorded about me as a guardian.
          </span>
        </button>

        {/* Annotation only — responses and token updates are signed on the guardian's
            own device, never on the member's or on the server. */}

        <div style={{ flex: 1 }} />
        <Button variant="primary" size="lg" fullWidth disabled={!understood} onClick={() => navigate('/guardian/standby')}>
          I understand
        </Button>
      </div>
    )
  }

  return (
    <div style={pageWrap}>
      <StepHeader title="Join as a guardian" step={1} totalSteps={2} onBack={() => navigate('/welcome')} />

      <GlassCard hero style={{ padding: 20 }}>
        <p style={bodyText}>Enter the invite code someone shared with you, or scan it.</p>
      </GlassCard>

      <div style={{ display: 'flex', gap: 8 }}>
        <MethodTab active={method === 'code'} onClick={() => setMethod('code')} Icon={Keyboard} label="Enter code" />
        <MethodTab active={method === 'scan'} onClick={() => setMethod('scan')} Icon={QrCode} label="Scan QR" />
      </div>

      {method === 'scan' ? (
        <ScannerFrame />
      ) : (
        <>
          <div style={{ padding: '8px 0' }}>
            <CodeBoxes length={6} value={value} disabled={disabled} />
          </div>
          {enrolState === 'idle' && (
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
          )}
        </>
      )}

      {enrolState === 'wrong' && (
        <InlineError>
          {attemptsLeft > 0
            ? `That code isn't right. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left.`
            : "That code isn't right. Try again in 15 minutes."}
        </InlineError>
      )}
      {enrolState === 'expired' && <InlineError>This invite code has expired. Ask for a new one.</InlineError>}
      {enrolState === 'locked' && <InlineError>Too many attempts. Try again in 15 minutes.</InlineError>}
    </div>
  )
}

function MethodTab({ active, onClick, Icon, label }: { active: boolean; onClick: () => void; Icon: React.ElementType; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        borderRadius: 'var(--vuka-radius-sm)', border: `1.5px solid ${active ? 'var(--vuka-text-title)' : 'var(--vuka-border)'}`,
        background: active ? 'var(--vuka-bg-elevated)' : 'transparent', color: 'var(--vuka-text-label)',
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
      }}
    >
      <Icon size={16} />
      {label}
    </button>
  )
}

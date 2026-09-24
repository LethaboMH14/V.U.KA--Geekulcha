import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, ShieldWarning, CheckSquare, Square } from '@phosphor-icons/react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { StatusChip } from '@/components/ui/StatusChip'
import { PinKeypad } from '@/components/ui/PinKeypad'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { StepHeader, pageWrap, bodyText, eyebrow, InlineError, CircleIcon } from './shared'

type Stage = 'normal1' | 'normal2' | 'duress1' | 'duress2' | 'recovery'

const RECOVERY_WORDS = [
  'thandi', 'harbour', 'sipho', 'quiet', 'lantern',
  'nomsa', 'anchor', 'vigil', 'karoo', 'ember',
]

/** Onboarding step 7 — Set PINs, then the recovery code. */
export function SetPins() {
  const navigate = useNavigate()
  const { recoveryCut } = useOnboarding()
  const [stage, setStage] = useState<Stage>('normal1')
  const [normalPin, setNormalPin] = useState('')
  const [duressPin, setDuressPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [written, setWritten] = useState(false)

  const handleComplete = (pin: string) => {
    setError(null)
    if (stage === 'normal1') {
      setNormalPin(pin)
      setStage('normal2')
      return
    }
    if (stage === 'normal2') {
      if (pin !== normalPin) {
        setError('Those two PINs didn\'t match. Start again.')
        setStage('normal1')
        setNormalPin('')
        return
      }
      setStage('duress1')
      return
    }
    if (stage === 'duress1') {
      if (pin === normalPin) {
        setError('Your duress PIN must be different from your normal PIN.')
        return
      }
      setDuressPin(pin)
      setStage('duress2')
      return
    }
    if (stage === 'duress2') {
      if (pin !== duressPin) {
        setError('Those two PINs didn\'t match. Start again.')
        setStage('duress1')
        setDuressPin('')
        return
      }
      setStage('recovery')
    }
  }

  const stageInfo: Record<Exclude<Stage, 'recovery'>, { title: string; body: string }> = {
    normal1: { title: 'Set your normal PIN', body: 'Enter a 4-digit PIN. You\'ll use this for every ordinary Journey check.' },
    normal2: { title: 'Confirm your normal PIN', body: 'Enter it again to confirm.' },
    duress1: {
      title: 'Set your duress PIN',
      body: 'Your duress PIN works exactly like your normal PIN on screen. Behind the scenes it quietly alerts your guardians.',
    },
    duress2: { title: 'Confirm your duress PIN', body: 'Enter it again to confirm.' },
  }

  if (stage === 'recovery') {
    return (
      <div style={pageWrap}>
        <StepHeader title="Recovery code" step={7} onBack={() => setStage('duress2')} />

        <GlassCard hero style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <CircleIcon Icon={Lock} />
            <p style={{ ...eyebrow, marginBottom: 0 }}>Shown once</p>
          </div>
          <p style={bodyText}>
            {recoveryCut
              ? 'Write these ten words down and keep them somewhere safe. They\'re the only way back into your account if you lose this phone.'
              : 'Write these ten words down and keep them somewhere safe. They\'re the only way back into your account if you lose this phone.'}
          </p>
        </GlassCard>

        {recoveryCut ? (
          <GlassCard style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ShieldWarning size={18} color="var(--vuka-text-secondary)" />
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--vuka-text-header)' }}>Recovery codes</span>
              <StatusChip status="simulated" label="PROPOSED" size="sm" />
            </div>
            <p style={{ fontSize: 13, color: 'var(--vuka-text-secondary)', lineHeight: 1.5 }}>
              Recovery codes aren't available in this build. You can add one later from Settings.
            </p>
          </GlassCard>
        ) : (
          <GlassCard style={{ padding: 20 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: 15,
                color: 'var(--vuka-text-title)',
              }}
            >
              {RECOVERY_WORDS.map((w, i) => (
                <div key={w} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--vuka-text-dim)', width: 18 }}>{i + 1}.</span>
                  {w}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {!recoveryCut && (
          <button
            onClick={() => setWritten((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none',
              cursor: 'pointer', padding: '10px 4px', minHeight: 48, textAlign: 'left',
            }}
          >
            {written ? <CheckSquare size={22} color="var(--vuka-text-title)" weight="fill" /> : <Square size={22} color="var(--vuka-text-secondary)" />}
            <span style={{ fontSize: 14, color: 'var(--vuka-text-label)' }}>I've written it down</span>
          </button>
        )}

        <div style={{ flex: 1 }} />
        <Button
          variant="primary" size="lg" fullWidth
          disabled={!recoveryCut && !written}
          onClick={() => navigate('/welcome/guardians')}
        >
          Continue
        </Button>
      </div>
    )
  }

  const info = stageInfo[stage]

  return (
    <div style={pageWrap}>
      <StepHeader title="Set your PINs" step={7} onBack={() => navigate('/welcome/permissions')} />

      <GlassCard hero style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <CircleIcon Icon={Lock} />
          <p style={{ ...eyebrow, marginBottom: 0 }}>{info.title}</p>
        </div>
        <p style={bodyText}>{info.body}</p>
      </GlassCard>

      {error && <InlineError>{error}</InlineError>}

      <div style={{ padding: '8px 0' }}>
        <PinKeypad key={stage} onComplete={handleComplete} resetOnComplete={false} />
      </div>
    </div>
  )
}

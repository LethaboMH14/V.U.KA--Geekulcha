import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { StepHeader, pageWrap, bodyText, labelText, InlineError } from './shared'

const fieldStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%',
  minHeight: 52,
  padding: '0 14px',
  borderRadius: 'var(--vuka-radius-sm)',
  background: 'var(--vuka-bg-elevated)',
  border: `1.5px solid ${hasError ? 'var(--vuka-text-title)' : 'var(--vuka-border)'}`,
  fontSize: 16,
  fontFamily: 'var(--font-sans)',
  color: 'var(--vuka-text-title)',
})

/** Onboarding step 3 — Your name. Prefilled when Google was used. */
export function YourName() {
  const navigate = useNavigate()
  const { googleUsed, firstName, surname, setName } = useOnboarding()
  const [first, setFirst] = useState(firstName)
  const [last, setLast] = useState(surname)
  const [touched, setTouched] = useState(false)

  const error = touched && (first.trim() === '' || last.trim() === '')

  const handleContinue = () => {
    if (first.trim() === '' || last.trim() === '') {
      setTouched(true)
      return
    }
    setName(first.trim(), last.trim())
    navigate('/welcome/phone')
  }

  return (
    <div style={pageWrap}>
      <StepHeader title="Your name" step={3} onBack={() => navigate('/welcome/sign-in')} />

      <GlassCard hero style={{ padding: 20 }}>
        <p style={bodyText}>
          {googleUsed
            ? "We've filled this in from your Google account. Change it if you'd rather guardians see something else."
            : "Guardians see this name on an alert."}
        </p>
      </GlassCard>

      <GlassCard style={{ padding: 20 }}>
        <form onSubmit={(e) => { e.preventDefault(); handleContinue() }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="first-name" style={labelText}>First name</label>
              <input
                id="first-name"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                placeholder="Thandi"
                style={fieldStyle(error && first.trim() === '')}
              />
            </div>
            <div>
              <label htmlFor="surname" style={labelText}>Surname</label>
              <input
                id="surname"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                placeholder="Dlamini"
                style={fieldStyle(error && last.trim() === '')}
              />
            </div>
            {error && <InlineError>Enter both your first name and surname.</InlineError>}
          </div>
        </form>
      </GlassCard>

      <div style={{ flex: 1 }} />
      <Button variant="primary" size="lg" fullWidth onClick={handleContinue}>
        Continue
      </Button>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMember } from '@/contexts/MemberContext'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { StepHeader, pageWrap, bodyText, labelText, InlineError, NoNetworkNotice } from './shared'

/** Onboarding step 4 — Phone number. A +27 country chip, then the number field. */
export function PhoneNumber() {
  const navigate = useNavigate()
  const { networkAvailable } = useMember()
  const [digits, setDigits] = useState('')
  const [touched, setTouched] = useState(false)

  // South African mobile numbers: 9 digits after the country code, not starting with 0.
  const isValid = /^[1-9][0-9]{8}$/.test(digits)
  const showError = touched && !isValid

  const handleSend = () => {
    if (!isValid) {
      setTouched(true)
      return
    }
    navigate('/welcome/verify')
  }

  return (
    <div style={pageWrap}>
      <StepHeader title="Phone number" step={4} onBack={() => navigate('/welcome/name')} />

      <GlassCard hero style={{ padding: 20 }}>
        <p style={bodyText}>We'll text a code to check it's really you.</p>
      </GlassCard>

      <GlassCard style={{ padding: 20 }}>
        <label htmlFor="phone" style={labelText}>Mobile number</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <span
            className="glass-pill"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: 52, padding: '0 14px', fontSize: 16, fontWeight: 500,
              color: 'var(--vuka-text-title)', flexShrink: 0,
            }}
          >
            +27
          </span>
          <input
            id="phone"
            inputMode="numeric"
            value={digits}
            onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').slice(0, 9))}
            placeholder="82 555 0101"
            style={{
              flex: 1,
              minHeight: 52,
              padding: '0 14px',
              borderRadius: 'var(--vuka-radius-sm)',
              background: 'var(--vuka-bg-elevated)',
              border: `1.5px solid ${showError ? 'var(--vuka-text-title)' : 'var(--vuka-border)'}`,
              fontSize: 16,
              fontFamily: 'var(--font-mono)',
              color: 'var(--vuka-text-title)',
              minWidth: 0,
            }}
          />
        </div>
        {showError && (
          <div style={{ marginTop: 12 }}>
            <InlineError>Enter a valid South African mobile number — 9 digits, not starting with 0.</InlineError>
          </div>
        )}
        <p style={{ fontSize: 12, color: 'var(--vuka-text-dim)', marginTop: 12, lineHeight: 1.5 }}>
          One account per number. South African SIMs are RICA-registered.
        </p>
      </GlassCard>

      {!networkAvailable && (
        <NoNetworkNotice>No network. We'll send the code once you're back online.</NoNetworkNotice>
      )}

      <div style={{ flex: 1 }} />
      <Button variant="primary" size="lg" fullWidth disabled={!networkAvailable} onClick={handleSend}>
        Send code
      </Button>
    </div>
  )
}

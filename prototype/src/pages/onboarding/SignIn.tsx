import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, CheckCircle } from '@phosphor-icons/react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { StepHeader, pageWrap, bodyText, GoogleMark } from './shared'

/**
 * Onboarding step 2 — Sign in.
 * "Continue with Google" is a PROPOSED integration: the account chooser is
 * SIMULATED, listing a single account. Phone-number sign-in is the real path.
 */
export function SignIn() {
  const navigate = useNavigate()
  const { setGoogleUsed, setName } = useOnboarding()
  const [showChooser, setShowChooser] = useState(false)

  const chooseAccount = () => {
    setGoogleUsed(true)
    setName('Thandi', 'Dlamini')
    setShowChooser(false)
    navigate('/welcome/name')
  }

  return (
    <div style={{ ...pageWrap, position: 'relative' }}>
      <StepHeader title="Sign in" step={2} onBack={() => navigate('/welcome')} />

      <GlassCard hero style={{ padding: 20 }}>
        <p style={bodyText}>
          Sign in to set up your profile. Guardians see the name you choose next.
        </p>
      </GlassCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        {/* PROPOSED integration — Google sign-in is not yet wired to a real identity provider */}
        <button
          onClick={() => setShowChooser(true)}
          className="glass-pill vuka-btn"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            minHeight: 54, border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 500,
            color: 'var(--vuka-text-title)', fontFamily: 'var(--font-sans)',
          }}
        >
          <GoogleMark size={18} />
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--vuka-border)' }} />
          <span style={{ fontSize: 12, color: 'var(--vuka-text-dim)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--vuka-border)' }} />
        </div>

        <Button variant="secondary" size="lg" fullWidth
          icon={<Phone size={18} />}
          onClick={() => navigate('/welcome/name')}
        >
          Use your phone number instead
        </Button>
      </div>

      <p style={{ fontSize: 12, color: 'var(--vuka-text-dim)', lineHeight: 1.5, marginTop: 6 }}>
        We use your name and email to set up your profile. We never see your Google password.
      </p>

      {showChooser && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.45)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowChooser(false) }}
        >
          <div style={{ width: '100%' }}>
            <BottomSheet title="Choose an account" onClose={() => setShowChooser(false)}>
              <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--vuka-text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                SIMULATED chooser
              </p>
              <button
                onClick={chooseAccount}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', minHeight: 52,
                }}
              >
                <span className="glass-circle" style={{ width: 40, height: 40 }}>
                  <CheckCircle size={18} color="var(--vuka-text-title)" style={{ opacity: 0.6 }} />
                </span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--vuka-text-label)' }}>Thandi Dlamini</p>
                  <p style={{ fontSize: 13, color: 'var(--vuka-text-secondary)' }}>thandi.dlamini@example.co.za</p>
                </div>
              </button>
            </BottomSheet>
          </div>
        </div>
      )}
    </div>
  )
}

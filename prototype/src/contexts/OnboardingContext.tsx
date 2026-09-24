import { createContext, useContext, useState, type ReactNode } from 'react'

/**
 * Slice C — demo-only flow state for onboarding, settings and the guardian
 * lifecycle. Separate from DemoContext/MemberContext (owned by other slices):
 * this file exists so DemoPanel can jump straight to a named state (wrong
 * code, expired, locked out, a denial outcome) without any control ever
 * rendering inside the phone frame itself.
 */

export type CodeState = 'idle' | 'wrong' | 'expired' | 'locked'
export type SheetCodeState = 'idle' | 'expired' | 'locked'
export type GuardiansPreset = 'empty' | 'pending' | 'mixed'
export type LoadState = 'ready' | 'loading' | 'error'

interface OnboardingState {
  /** Carried from the SIMULATED Google chooser into "Your name" */
  googleUsed: boolean
  setGoogleUsed: (v: boolean) => void
  firstName: string
  surname: string
  setName: (first: string, surname: string) => void

  /** Verify-code screen (step 5) */
  verifyState: CodeState
  setVerifyState: (s: CodeState) => void

  /** Permissions screen (step 6) — per-permission denial outcomes */
  micDenied: boolean
  setMicDenied: (v: boolean) => void
  notifDenied: boolean
  setNotifDenied: (v: boolean) => void
  locationDenied: boolean
  setLocationDenied: (v: boolean) => void
  fullScreenAlertsBlocked: boolean
  setFullScreenAlertsBlocked: (v: boolean) => void

  /** Set PINs screen (step 7) — recovery code availability */
  recoveryCut: boolean
  setRecoveryCut: (v: boolean) => void

  /** Invite guardians (step 8) */
  guardiansPreset: GuardiansPreset
  setGuardiansPreset: (p: GuardiansPreset) => void
  inviteSheetState: SheetCodeState
  setInviteSheetState: (s: SheetCodeState) => void

  /** Guardian enrolment — wrong, expired and locked-out states */
  enrolState: CodeState
  setEnrolState: (s: CodeState) => void

  /** Guardian acknowledged — a late normal-PIN update to the timeline */
  lateAnswerUpdate: boolean
  setLateAnswerUpdate: (v: boolean) => void

  /** Settings screen loading/error demo states */
  settingsLoadState: LoadState
  setSettingsLoadState: (s: LoadState) => void
}

const OnboardingContext = createContext<OnboardingState | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [googleUsed, setGoogleUsed] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [verifyState, setVerifyState] = useState<CodeState>('idle')
  const [micDenied, setMicDenied] = useState(false)
  const [notifDenied, setNotifDenied] = useState(false)
  const [locationDenied, setLocationDenied] = useState(false)
  const [fullScreenAlertsBlocked, setFullScreenAlertsBlocked] = useState(false)
  const [recoveryCut, setRecoveryCut] = useState(false)
  const [guardiansPreset, setGuardiansPreset] = useState<GuardiansPreset>('empty')
  const [inviteSheetState, setInviteSheetState] = useState<SheetCodeState>('idle')
  const [enrolState, setEnrolState] = useState<CodeState>('idle')
  const [lateAnswerUpdate, setLateAnswerUpdate] = useState(false)
  const [settingsLoadState, setSettingsLoadState] = useState<LoadState>('ready')

  const setName = (first: string, sur: string) => {
    setFirstName(first)
    setSurname(sur)
  }

  return (
    <OnboardingContext.Provider
      value={{
        googleUsed, setGoogleUsed,
        firstName, surname, setName,
        verifyState, setVerifyState,
        micDenied, setMicDenied,
        notifDenied, setNotifDenied,
        locationDenied, setLocationDenied,
        fullScreenAlertsBlocked, setFullScreenAlertsBlocked,
        recoveryCut, setRecoveryCut,
        guardiansPreset, setGuardiansPreset,
        inviteSheetState, setInviteSheetState,
        enrolState, setEnrolState,
        lateAnswerUpdate, setLateAnswerUpdate,
        settingsLoadState, setSettingsLoadState,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}

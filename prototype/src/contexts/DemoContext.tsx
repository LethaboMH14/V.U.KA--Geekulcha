import { createContext, useContext, useState, type ReactNode } from 'react'

export type VukaTheme = 'ivory' | 'silver' | 'midnight'
/** Which role's phone is being previewed. Off-phone switch only. */
export type VukaRole = 'member' | 'guardian'
/** Anchor proof result — off-phone demo switcher (all SIMULATED in the prototype) */
export type VukaAnchorState = 'live' | 'archived' | 'unavailable'

interface DemoState {
  theme: VukaTheme
  blurEnabled: boolean
  role: VukaRole
  anchorState: VukaAnchorState
  setTheme: (t: VukaTheme) => void
  setBlurEnabled: (v: boolean) => void
  setRole: (r: VukaRole) => void
  setAnchorState: (s: VukaAnchorState) => void
  /** Effective blur: false when the user disabled it */
  effectiveBlur: boolean
}

const DemoContext = createContext<DemoState | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<VukaTheme>('ivory')
  const [blurEnabled, setBlurEnabled] = useState(true)
  const [role, setRole] = useState<VukaRole>('member')
  const [anchorState, setAnchorState] = useState<VukaAnchorState>('live')

  const effectiveBlur = blurEnabled

  return (
    <DemoContext.Provider value={{ theme, blurEnabled, role, anchorState, setTheme, setBlurEnabled, setRole, setAnchorState, effectiveBlur }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}

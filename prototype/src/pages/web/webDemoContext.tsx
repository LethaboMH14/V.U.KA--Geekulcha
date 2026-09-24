import { createContext, useContext, useState, type ReactNode } from 'react'

/** Result state for the /verify page result card — off-phone demo switcher only. */
export type VerifyResultState = 'live' | 'archived' | 'unavailable' | 'failure'

interface WebDemoState {
  verifyResultState: VerifyResultState
  setVerifyResultState: (s: VerifyResultState) => void
  /**
   * Gates the "Live-verified" wording on /verify. Off by default, so the
   * prototype always reads as a SIMULATED result — from spec: "Live-verified"
   * is reserved for a real mirror-node check.
   */
  realCheck: boolean
  setRealCheck: (v: boolean) => void
}

const WebDemoContext = createContext<WebDemoState | null>(null)

/**
 * Demo state for Slice D's web pages only (/verify, /panel, /stage).
 * Kept separate from DemoContext so this slice's controls stay additive.
 */
export function WebDemoProvider({ children }: { children: ReactNode }) {
  const [verifyResultState, setVerifyResultState] = useState<VerifyResultState>('live')
  const [realCheck, setRealCheck] = useState(false)

  return (
    <WebDemoContext.Provider
      value={{ verifyResultState, setVerifyResultState, realCheck, setRealCheck }}
    >
      {children}
    </WebDemoContext.Provider>
  )
}

export function useWebDemo() {
  const ctx = useContext(WebDemoContext)
  if (!ctx) throw new Error('useWebDemo must be used within WebDemoProvider')
  return ctx
}

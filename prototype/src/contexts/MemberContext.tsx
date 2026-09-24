import { createContext, useContext, useState, type ReactNode } from 'react'

export type JourneyState =
  | 'disarmed'
  | 'arming'
  | 'armed'
  | 'check_pending'
  | 'checking'
  | 'ending'

/** Never shown on any member-facing screen — only read by DemoPanel */
export type PINType = 'normal' | 'duress'

export interface Guardian {
  id: string
  name: string
  phone: string
  status: 'pending' | 'accepted'
}

interface MemberState {
  memberName: string
  journeyState: JourneyState
  guardians: Guardian[]
  /**
   * Internal PIN type — set via DemoPanel only.
   * The member's UI never reveals which type was entered.
   */
  pinType: PINType
  /**
   * Record updates freeze for 6 h after any PIN entry (normal or duress).
   * Both paths look identical — see duress rule.
   */
  recordFrozen: boolean
  networkAvailable: boolean
  setJourneyState: (s: JourneyState) => void
  setPinType: (p: PINType) => void
  setRecordFrozen: (v: boolean) => void
  setNetworkAvailable: (v: boolean) => void
}

const MemberContext = createContext<MemberState | null>(null)

export function MemberProvider({ children }: { children: ReactNode }) {
  const [journeyState, setJourneyState] = useState<JourneyState>('disarmed')
  const [pinType, setPinType] = useState<PINType>('normal')
  const [recordFrozen, setRecordFrozen] = useState(false)
  const [networkAvailable, setNetworkAvailable] = useState(true)

  return (
    <MemberContext.Provider value={{
      memberName: 'Thandi Dlamini',
      journeyState,
      guardians: [
        { id: 'g1', name: 'Sipho Ndlovu',   phone: '+27 82 555 0101', status: 'accepted' },
        { id: 'g2', name: 'Nomsa Khumalo',  phone: '+27 71 555 0202', status: 'accepted' },
        { id: 'g3', name: 'Bongani Sithole', phone: '+27 64 555 0303', status: 'pending' },
      ],
      pinType,
      recordFrozen,
      networkAvailable,
      setJourneyState,
      setPinType,
      setRecordFrozen,
      setNetworkAvailable,
    }}>
      {children}
    </MemberContext.Provider>
  )
}

export function useMember() {
  const ctx = useContext(MemberContext)
  if (!ctx) throw new Error('useMember must be used within MemberProvider')
  return ctx
}

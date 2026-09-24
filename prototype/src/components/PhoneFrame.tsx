import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useDemo } from '@/contexts/DemoContext'
import { useMember } from '@/contexts/MemberContext'
import { StatusBar } from './StatusBar'
import { BottomNav } from './BottomNav'
import { SoftFields } from './backgrounds/SoftFields'

interface PhoneFrameProps {
  children: ReactNode
  /** Guardian mode has no member VIGIL/ANCHOR tabs */
  hideNav?: boolean
}

/**
 * Android phone chrome + inner screen.
 * Theme and mode data-attributes are set on the inner screen element
 * so CSS variable overrides apply scoped to the phone content.
 *
 * DemoPanel controls live outside this component — from spec:
 * "No review controls on the phone."
 */
export function PhoneFrame({ children, hideNav = false }: PhoneFrameProps) {
  const { journeyState } = useMember()
  const { pathname } = useLocation()
  const inSetup = pathname.startsWith('/welcome') || pathname.startsWith('/guardian')
  const { theme } = useDemo()

  return (
    <div
      style={{
        /* Outer chrome — dark shell */
        width: 390,
        flexShrink: 0,
        background: 'linear-gradient(160deg, #1a1e2e 0%, #0d1018 100%)',
        borderRadius: 52,
        border: '2px solid #1e2535',
        boxShadow: [
          '0 32px 80px rgba(0,0,0,0.55)',
          '0 0 0 1px rgba(255,255,255,0.05) inset',
          '2px 0 8px rgba(0,0,0,0.3)',
        ].join(', '),
        padding: '12px 8px 10px',
        position: 'relative',
      }}
    >
      {/* Side buttons — visual chrome only */}
      <SideButton side="right" top={120} height={56} label="Power" />
      <SideButton side="left"  top={100} height={36} label="Vol up" />
      <SideButton side="left"  top={148} height={36} label="Vol down" />

      {/* Screen area */}
      <div
        data-theme={theme === 'ivory' ? undefined : theme}
        style={{
          borderRadius: 44,
          overflow: 'hidden',
          height: 820,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--vuka-bg-base)',
          position: 'relative',
        }}
      >
        {/* Background — soft blurred colour fields, clipped inside screen */}
        <SoftFields />

        {/* Film grain — 1.5% monochrome over the whole background */}
        <div className="film-grain" aria-hidden />

        {/* Status bar */}
        <StatusBar />

        {/* Scrollable page content */}
        <main
          className="screen-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {children}
        </main>

        {/* Bottom nav */}
        {!hideNav && !inSetup && journeyState !== 'check_pending' && journeyState !== 'checking' && <BottomNav />}

        {/* Home indicator */}
        <div
          style={{
            height: 8,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--vuka-bg-surface)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 120,
              height: 3,
              borderRadius: 2,
              background: 'var(--vuka-border-emphasis)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

function SideButton({
  side,
  top,
  height,
}: {
  side: 'left' | 'right'
  top: number
  height: number
  label: string
}) {
  const isLeft = side === 'left'
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top,
        [isLeft ? 'left' : 'right']: -5,
        width: 4,
        height,
        background: '#1e2535',
        borderRadius: isLeft ? '3px 0 0 3px' : '0 3px 3px 0',
        boxShadow: isLeft
          ? '-1px 0 3px rgba(0,0,0,0.4)'
          : '1px 0 3px rgba(0,0,0,0.4)',
      }}
    />
  )
}

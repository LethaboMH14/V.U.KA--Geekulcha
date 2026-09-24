import type { ReactNode, CSSProperties } from 'react'
import { useDemo } from '@/contexts/DemoContext'

interface GlassCardProps {
  elevation?: 1 | 2 | 3
  /** Kept for API compatibility — all cards now share one calm surface. */
  hero?: boolean
  children: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

/**
 * One calm surface: white card at 80%, blur 20, a single soft shadow and a
 * hairline border. No inner highlights, no glow — from the calm rebuild.
 */
export function GlassCard({
  elevation = 1,
  hero = false,
  children,
  className = '',
  style,
  onClick,
}: GlassCardProps) {
  const { effectiveBlur } = useDemo()
  const base = hero ? 'glass-hero' : `glass-${elevation}`
  const cls = effectiveBlur ? base : `${base}-solid`

  const card = (
    <div className={`${cls} ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  )
  return hero ? <div className="bezel">{card}</div> : card
}

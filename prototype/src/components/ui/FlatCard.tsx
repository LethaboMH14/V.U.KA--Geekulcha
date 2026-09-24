import type { ReactNode, CSSProperties } from 'react'

interface FlatCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * Flat card — used for Journey check.
 * From spec: flat, no glow, no elevated glass, no background art, no countdown.
 */
export function FlatCard({ children, className = '', style }: FlatCardProps) {
  return (
    <div className={`flat-card ${className}`} style={style}>
      {children}
    </div>
  )
}

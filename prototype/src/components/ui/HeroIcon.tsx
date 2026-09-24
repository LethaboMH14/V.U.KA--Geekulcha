import type { ElementType } from 'react'

interface HeroIconProps {
  Icon: ElementType
  /** Icon colour — defaults to the primary action (indigo). Green reserved for verified. */
  color?: string
  /** 'lg' hero cards = 48/28; 'md' card headers = 44/24 */
  size?: 'lg' | 'md'
}

/**
 * A Phosphor Duotone icon inside a glass circle.
 * Hero cards use 28px in a 48px circle; card headers use 24px in a 44px circle.
 */
export function HeroIcon({ Icon, color = 'var(--vuka-action)', size = 'lg' }: HeroIconProps) {
  const box = size === 'lg' ? 48 : 44
  const icon = size === 'lg' ? 28 : 24
  return (
    <div
      style={{
        width: box,
        height: box,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid var(--vuka-border-emphasis)',
        boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.16)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <Icon size={icon} weight="duotone" color={color} />
    </div>
  )
}

import type { ReactNode, CSSProperties } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps {
  variant?: ButtonVariant
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  fullWidth?: boolean
  size?: 'md' | 'lg'
  style?: CSSProperties
  className?: string
  icon?: ReactNode
  /** Trailing icon, nested in its own small orb */
  trailingIcon?: ReactNode
}

const variants: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: 'linear-gradient(to bottom, #2A4A73, #1A3354)',
    color: '#ffffff',
    border: 'none',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.18), 0 12px 24px -8px rgba(30,58,95,0.5)',
  },
  secondary: {
    background: 'var(--vuka-card-sheen), var(--vuka-card-bg)',
    color: 'var(--vuka-text-title)',
    border: '1px solid rgba(255,255,255,0.6)',
    boxShadow: 'var(--vuka-card-edge), var(--vuka-shadow)',
    backdropFilter: 'blur(24px) saturate(170%)',
    WebkitBackdropFilter: 'blur(24px) saturate(170%)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--vuka-text-secondary)',
    border: '1px solid var(--vuka-border)',
    boxShadow: 'none',
  },
}

/**
 * Touch target min 48 px — from spec.
 * Transitions: 200 ms ease-out — from spec.
 */
export function Button({
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  size = 'md',
  style,
  className = '',
  icon,
  trailingIcon,
}: ButtonProps) {
  const height = 54
  const fontSize = 16

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: height,
        padding: `0 ${size === 'lg' ? 28 : 22}px`,
        width: fullWidth ? '100%' : undefined,
        borderRadius: 999,
        fontSize,
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        WebkitTapHighlightColor: 'transparent',
        ...variants[variant],
        ...style,
      }}
      className={`vuka-btn ${className}`}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
      {trailingIcon && <span className="btn-orb" aria-hidden>{trailingIcon}</span>}
    </button>
  )
}

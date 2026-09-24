import type { ReactNode } from 'react'
import { CaretRight } from '@phosphor-icons/react'

interface ListRowProps {
  label: string
  sublabel?: string
  leading?: ReactNode
  trailing?: ReactNode
  chevron?: boolean
  onClick?: () => void
  danger?: boolean
}

/**
 * Generic list row — 48 px minimum touch target.
 */
export function ListRow({
  label,
  sublabel,
  leading,
  trailing,
  chevron = false,
  onClick,
  danger = false,
}: ListRowProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0',
        background: 'none',
        border: 'none',
        borderBottom: '1px solid var(--vuka-border-subtle)',
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {leading && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--vuka-bg-elevated)',
            border: '1px solid var(--vuka-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: 'var(--vuka-text-secondary)',
          }}
        >
          {leading}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: danger ? 'var(--vuka-text-title)' : 'var(--vuka-text-label)',
            marginBottom: sublabel ? 2 : 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </p>
        {sublabel && (
          <p style={{ fontSize: 12, color: 'var(--vuka-text-secondary)', lineHeight: 1.4 }}>
            {sublabel}
          </p>
        )}
      </div>
      {trailing && (
        <span style={{ fontSize: 13, color: 'var(--vuka-text-secondary)', flexShrink: 0 }}>
          {trailing}
        </span>
      )}
      {chevron && (
        <CaretRight size={14} color="var(--vuka-text-dim)" style={{ flexShrink: 0 }} />
      )}
    </button>
  )
}

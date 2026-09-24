import type { ReactNode } from 'react'
import { X } from '@phosphor-icons/react'
import { GlassCard } from './GlassCard'

interface BottomSheetProps {
  title: string
  children: ReactNode
  onClose?: () => void
  /** For gallery display — renders inline, not as overlay */
  inline?: boolean
}

export function BottomSheet({ title, children, onClose, inline = false }: BottomSheetProps) {
  const content = (
    <GlassCard
      elevation={3}
      style={{
        borderRadius: inline ? 'var(--vuka-radius-lg)' : '24px 24px 0 0',
        padding: '8px 20px 24px',
      }}
    >
      {/* Handle bar */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, paddingBottom: 12 }}>
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: 'var(--vuka-border-emphasis)',
          }}
        />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--vuka-text-title)' }}>{title}</h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'var(--vuka-bg-elevated)',
              border: '1px solid var(--vuka-border)',
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--vuka-text-secondary)',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {children}
    </GlassCard>
  )

  if (inline) return content

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      }}
    >
      {content}
    </div>
  )
}

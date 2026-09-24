import { useState, useEffect } from 'react'
import { CheckCircle, Info, X } from '@phosphor-icons/react'

type ToastKind = 'success' | 'info'

interface ToastProps {
  kind?: ToastKind
  message: string
  duration?: number
  onDismiss?: () => void
}

const icons: Record<ToastKind, React.ElementType> = {
  success: CheckCircle,
  info: Info,
}

const colors: Record<ToastKind, string> = {
  success: 'var(--vuka-green-text)',
  info: 'var(--vuka-action)',
}

export function Toast({ kind = 'info', message, duration = 3000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true)
  const Icon = icons[kind]
  const color = colors[kind]

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      onDismiss?.()
    }, duration)
    return () => clearTimeout(t)
  }, [duration, onDismiss])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 96,
        left: 16,
        right: 16,
        background: 'var(--vuka-glass-solid-3)',
        border: '1px solid var(--vuka-border-emphasis)',
        borderRadius: 'var(--vuka-radius-sm)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: 'var(--vuka-shadow-2)',
        zIndex: 100,
        animation: 'slideUp 200ms ease-out',
      }}
    >
      <Icon size={18} weight="fill" color={color} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--vuka-text-label)', lineHeight: 1.4 }}>
        {message}
      </span>
      <button
        onClick={() => { setVisible(false); onDismiss?.() }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--vuka-text-dim)' }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

/** Inline static demo — not interactive, for gallery display */
export function ToastDemo() {
  return (
    <div
      style={{
        background: 'var(--vuka-glass-solid-2)',
        border: '1px solid var(--vuka-border-emphasis)',
        borderRadius: 'var(--vuka-radius-sm)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: 'var(--vuka-shadow-1)',
      }}
    >
      <CheckCircle size={18} weight="fill" color="var(--vuka-green-text)" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--vuka-text-label)' }}>
        Checked in · Journey continues
      </span>
      <X size={14} color="var(--vuka-text-dim)" />
    </div>
  )
}

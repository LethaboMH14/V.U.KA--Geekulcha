import { useState, useCallback } from 'react'
import { Backspace } from '@phosphor-icons/react'

interface PinKeypadProps {
  /** Called when exactly 4 digits are entered */
  onComplete: (pin: string) => void
  /** Reset after completing — keeps keypad ready for next entry */
  resetOnComplete?: boolean
}

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

/**
 * Journey check keypad — flat, plain, no decorative treatment.
 * From spec: one frame serves both normal and duress PIN.
 * Touch targets: each key ≥48px.
 */
export function PinKeypad({ onComplete, resetOnComplete = true }: PinKeypadProps) {
  const [digits, setDigits] = useState<string[]>([])

  const handleKey = useCallback((key: string) => {
    if (key === '⌫') {
      setDigits(prev => prev.slice(0, -1))
      return
    }
    if (key === '') return

    setDigits(prev => {
      const next = [...prev, key]
      if (next.length === 4) {
        onComplete(next.join(''))
        if (resetOnComplete) return []
      }
      return next
    })
  }, [onComplete, resetOnComplete])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {/* PIN dots */}
      <div style={{ display: 'flex', gap: 16, height: 16, alignItems: 'center' }}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: digits[i] !== undefined
                ? 'var(--vuka-text-label)'
                : 'transparent',
              border: '1.5px solid var(--vuka-border-emphasis)',
              transition: 'background 100ms ease-out',
            }}
          />
        ))}
      </div>

      {/* Keypad grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          width: '100%',
        }}
      >
        {KEYS.map((key, idx) => {
          const isEmpty = key === ''
          const isBack = key === '⌫'
          return (
            <button
              key={idx}
              onClick={() => handleKey(key)}
              disabled={isEmpty}
              aria-hidden={isEmpty || undefined}
              tabIndex={isEmpty ? -1 : undefined}
              className="pin-key-press"
              style={{
                height: 56,
                borderRadius: 'var(--vuka-radius-sm)',
                background: isEmpty ? 'transparent' : 'var(--vuka-bg-elevated)',
                border: isEmpty ? 'none' : '1px solid var(--vuka-border)',
                color: isBack ? 'var(--vuka-text-secondary)' : 'var(--vuka-text-title)',
                fontSize: isBack ? 14 : 20,
                fontWeight: 400,
                fontFamily: 'var(--font-sans)',
                cursor: isEmpty ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {isBack ? <Backspace size={20} /> : key}
            </button>
          )
        })}
      </div>
    </div>
  )
}

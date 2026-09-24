import type { CSSProperties, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretLeft, WarningCircle, WifiSlash } from '@phosphor-icons/react'

/** Hero status word — Plex Sans SemiBold 32, matches VigilHome/MyRecord. */
export const heroWord: CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontWeight: 600,
  fontSize: 32,
  lineHeight: 1.08,
  letterSpacing: '-0.01em',
  color: 'var(--vuka-text-title)',
}

/** Eyebrow — Plex Sans Medium 11, uppercase, +10% tracking. */
export const eyebrow: CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  color: 'var(--vuka-text-dim)',
  marginBottom: 6,
}

export const pageWrap: CSSProperties = {
  padding: '24px 24px 28px',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  minHeight: '100%',
}

export const bodyText: CSSProperties = {
  fontSize: 15,
  color: 'var(--vuka-text-secondary)',
  lineHeight: 1.5,
}

export const labelText: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--vuka-text-label)',
  marginBottom: 6,
  display: 'block',
}

/** Back chevron + step title, shared by every onboarding step after Welcome. */
export function StepHeader({
  title,
  step,
  totalSteps = 8,
  onBack,
}: {
  title: string
  step: number
  totalSteps?: number
  onBack?: () => void
}) {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button
        onClick={onBack ?? (() => navigate(-1))}
        aria-label="Back"
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: '1px solid var(--vuka-border)',
          cursor: 'pointer',
          flexShrink: 0,
          color: 'var(--vuka-text-secondary)',
        }}
      >
        <CaretLeft size={18} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ ...eyebrow, marginBottom: 2 }}>Step {step} of {totalSteps}</p>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--vuka-text-title)', letterSpacing: '-0.01em' }}>
          {title}
        </h1>
      </div>
    </div>
  )
}

/**
 * Inline form error — from slice-common: never a red border. An ink outline
 * plus a message with an icon.
 */
export function InlineError({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start',
        padding: '10px 12px',
        borderRadius: 'var(--vuka-radius-sm)',
        border: '1.5px solid var(--vuka-text-title)',
        background: 'var(--vuka-bg-elevated)',
      }}
    >
      <WarningCircle size={16} color="var(--vuka-text-title)" style={{ marginTop: 1, flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: 'var(--vuka-text-label)', lineHeight: 1.5 }}>{children}</span>
    </div>
  )
}

/** No-network caption — matches the pattern used on Journey active. */
export function NoNetworkNotice({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '0 4px' }}>
      <WifiSlash size={16} color="var(--vuka-text-dim)" style={{ marginTop: 2, flexShrink: 0 }} />
      <p style={{ fontSize: 13, color: 'var(--vuka-text-dim)', lineHeight: 1.5 }}>{children}</p>
    </div>
  )
}

/** A generic, simplified "G" mark — SIMULATED sign-in, drawn inline. */
export function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.55-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97l3.05 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
    </svg>
  )
}

/** A plain SIMULATED QR block — grid squares, no real encoding. */
export function QrBlock({ size = 148 }: { size?: number }) {
  const cells = 9
  const cellSize = size / cells
  // Deterministic pseudo-pattern so it renders consistently between builds.
  const pattern = [
    1,1,1,0,1,0,1,1,1,
    1,0,1,0,0,0,1,0,1,
    1,0,1,1,0,1,1,0,1,
    0,0,0,1,1,0,0,0,0,
    1,1,0,0,1,0,1,1,0,
    0,0,1,0,1,1,0,0,1,
    1,0,1,1,0,1,1,0,1,
    1,0,1,0,0,0,1,0,1,
    1,1,1,0,1,0,1,1,1,
  ]
  return (
    <div
      style={{
        width: size,
        height: size,
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid var(--vuka-border)',
        padding: 8,
        display: 'grid',
        gridTemplateColumns: `repeat(${cells}, 1fr)`,
        gridTemplateRows: `repeat(${cells}, 1fr)`,
      }}
      aria-hidden
    >
      {pattern.map((on, i) => (
        <div key={i} style={{ background: on ? '#1f2328' : 'transparent', width: cellSize - 8 / cells, height: cellSize - 8 / cells }} />
      ))}
    </div>
  )
}

/** A camera viewfinder placeholder for the SIMULATED QR scanner. */
export function ScannerFrame() {
  const corner: CSSProperties = {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: 'var(--vuka-text-title)',
  }
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 200,
        borderRadius: 'var(--vuka-radius-md)',
        background: 'var(--vuka-bg-elevated)',
        border: '1px solid var(--vuka-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ position: 'relative', width: 140, height: 140 }} aria-hidden>
        <div style={{ ...corner, top: 0, left: 0, borderTop: '3px solid', borderLeft: '3px solid', borderTopLeftRadius: 8 }} />
        <div style={{ ...corner, top: 0, right: 0, borderTop: '3px solid', borderRight: '3px solid', borderTopRightRadius: 8 }} />
        <div style={{ ...corner, bottom: 0, left: 0, borderBottom: '3px solid', borderLeft: '3px solid', borderBottomLeftRadius: 8 }} />
        <div style={{ ...corner, bottom: 0, right: 0, borderBottom: '3px solid', borderRight: '3px solid', borderBottomRightRadius: 8 }} />
      </div>
      <p style={{ position: 'absolute', bottom: 12, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--vuka-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        SIMULATED camera
      </p>
    </div>
  )
}

/** 6-digit code input row, Plex Mono, one box per digit. */
export function CodeBoxes({
  length,
  value,
  disabled = false,
}: {
  length: number
  value: string
  disabled?: boolean
}) {
  return (
    <div role="group" aria-label={`Code, ${value.length} of ${length} digits entered`} style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 42,
            height: 52,
            borderRadius: 'var(--vuka-radius-sm)',
            background: 'var(--vuka-bg-elevated)',
            border: `1.5px solid ${value[i] ? 'var(--vuka-text-title)' : 'var(--vuka-input-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 20,
            fontWeight: 500,
            color: disabled ? 'var(--vuka-text-dim)' : 'var(--vuka-text-title)',
          }}
        >
          {value[i] ?? ''}
        </div>
      ))}
    </div>
  )
}

/** Icon in a 40px glass circle — matches VigilHome's LeafIcon. */
export function CircleIcon({ Icon }: { Icon: React.ElementType }) {
  return (
    <span className="glass-circle" style={{ width: 40, height: 40 }}>
      <Icon size={20} color="var(--vuka-text-title)" style={{ opacity: 0.85 }} />
    </span>
  )
}

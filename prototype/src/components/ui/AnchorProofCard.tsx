import type { ReactNode } from 'react'
import { TestTube, Archive, WifiSlash, CheckCircle } from '@phosphor-icons/react'
import { GlassCard } from './GlassCard'
import { StatusChip } from './StatusChip'

export type AnchorState = 'live' | 'archived' | 'unavailable'

interface AnchorProofCardProps {
  state: AnchorState
  rootHash?: string
  /** Hedera message sequence number (not the sound score) */
  sequence?: number
  timestamp?: string
  /** All results are SIMULATED in the prototype — from spec */
  simulated?: boolean
  /** Render the contents without the outer card (for embedding). */
  bare?: boolean
}

/**
 * The prototype never claims "Live-verified" — that is reserved for a real
 * mirror-node check. Under simulation every result reads as
 * "SIMULATED result · testnet" in neutral grey, with no warning icon.
 */
export function AnchorProofCard({
  state,
  rootHash = 'a3f8…c219',
  sequence = 4121,
  timestamp = '2026-09-23 · 08:14 SAST',
  simulated = true,
  bare = false,
}: AnchorProofCardProps) {
  let Icon: React.ElementType
  let label: string
  let sublabel: string
  let color: string

  if (simulated) {
    Icon = state === 'archived' ? Archive : state === 'unavailable' ? WifiSlash : TestTube
    label =
      state === 'archived'
        ? 'Archived: not independent'
        : state === 'unavailable'
        ? 'Unavailable'
        : 'SIMULATED result · testnet'
    sublabel =
      state === 'archived'
        ? 'Snapshot check — see About'
        : state === 'unavailable'
        ? 'Check again when online'
        : 'No independent mirror-node check in this prototype'
    color = 'var(--vuka-text-secondary)'
  } else {
    // Real result — only here can green "Live-verified" appear.
    Icon = state === 'archived' ? Archive : state === 'unavailable' ? WifiSlash : CheckCircle
    label =
      state === 'archived'
        ? 'Archived: not independent'
        : state === 'unavailable'
        ? 'Unavailable'
        : 'Live-verified · testnet'
    sublabel =
      state === 'archived'
        ? 'Snapshot check — see About'
        : state === 'unavailable'
        ? 'Check again when online'
        : 'Mirror-node check passed'
    color = state === 'live' ? 'var(--vuka-green-text)' : 'var(--vuka-text-secondary)'
  }

  const inner = (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={18} weight="fill" color={color} />
          <span style={{ fontSize: 13, fontWeight: 600, color }}>
            {label}
          </span>
        </div>
        {simulated && <StatusChip status="simulated" size="sm" />}
      </div>

      <p style={{ fontSize: 12, color: 'var(--vuka-text-secondary)', marginBottom: 14 }}>
        {sublabel}
      </p>

      {/* Mono data */}
      <div
        style={{
          background: 'var(--vuka-bg-base)',
          borderRadius: 'var(--vuka-radius-sm)',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          border: '1px solid var(--vuka-border-subtle)',
        }}
      >
        <Row label="Root hash" value={rootHash} />
        <Row label="Sequence" value={`#${sequence.toLocaleString()}`} />
        <Row label="Recorded" value={timestamp} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <ActionLink>Verify independently</ActionLink>
        <ActionLink muted>Download my record</ActionLink>
      </div>
    </>
  )

  if (bare) return inner

  return (
    <GlassCard elevation={2} style={{ padding: 20 }}>
      {inner}
    </GlassCard>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--vuka-text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--vuka-text-label)', textAlign: 'right' }}>
        {value}
      </span>
    </div>
  )
}

function ActionLink({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <button
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        fontSize: 12,
        fontWeight: 500,
        color: muted ? 'var(--vuka-text-secondary)' : 'var(--vuka-action)',
        cursor: 'pointer',
        textDecoration: 'underline',
        textDecorationColor: muted ? 'var(--vuka-border)' : 'var(--vuka-action-dim)',
        textUnderlineOffset: 3,
      }}
    >
      {children}
    </button>
  )
}

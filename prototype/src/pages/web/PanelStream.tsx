import { useEffect, useState } from 'react'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { useMember } from '@/contexts/MemberContext'
import { StatusChip } from '@/components/ui/StatusChip'
import { chunkHex, fakeHash } from './format'

interface PanelRow {
  id: number
  time: string
  chainIndex: number
  hash: string
  isSim: boolean
  kind?: string
  reason?: string
  receipt: 'received' | 'queued'
  anchored: 'yes' | 'pending'
}

const SIM_KINDS: { kind: string; reason: (duress: boolean) => string }[] = [
  { kind: 'journey_started', reason: () => 'Journey started' },
  { kind: 'check_answered', reason: (duress) => (duress ? 'Duress PIN entered' : 'Journey check answered') },
  { kind: 'anchor_written', reason: () => 'Anchor record written' },
]

function formatClock(secondsFromStart: number): string {
  const base = 8 * 3600 + 14 * 60 // 08:14 SAST start
  const total = base + secondsFromStart
  const h = Math.floor(total / 3600) % 24
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

function makeRow(index: number, offline: boolean, duress: boolean): PanelRow {
  const isSim = index % 4 === 0
  const simDef = isSim ? SIM_KINDS[Math.floor(index / 4) % SIM_KINDS.length] : undefined
  return {
    id: index,
    time: formatClock(index * 7),
    chainIndex: 4000 + index,
    hash: fakeHash(index + 1),
    isSim,
    kind: simDef?.kind,
    reason: simDef ? simDef.reason(duress) : undefined,
    receipt: offline ? 'queued' : 'received',
    anchored: offline ? 'pending' : index % 5 === 0 ? 'pending' : 'yes',
  }
}

function seedRows(count: number): PanelRow[] {
  const rows: PanelRow[] = []
  for (let i = count; i >= 1; i--) rows.push(makeRow(i, false, false))
  return rows
}

interface PanelStreamProps {
  /** Smaller footprint for embedding beside the phone on /stage. */
  compact?: boolean
}

/**
 * The live demo panel stream — a dense, crt.sh-style table of opaque hashes.
 * Rows arrive on a timer. Event kind and reason are shown only for sim_
 * subjects (SIMULATED); real-subject rows show opaque hashes only.
 * Shared between /panel and /stage.
 */
export function PanelStream({ compact = false }: PanelStreamProps) {
  const { networkAvailable, pinType } = useMember()
  const [rows, setRows] = useState<PanelRow[]>(() => seedRows(compact ? 7 : 14))
  const [tick, setTick] = useState(0)
  const [outboxBacklog, setOutboxBacklog] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2600)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (tick === 0) return
    const nextIndex = rows[0].id + 1
    const row = makeRow(nextIndex, !networkAvailable, pinType === 'duress')
    setRows((prev) => [row, ...prev].slice(0, compact ? 14 : 40))
    setOutboxBacklog((b) => (networkAvailable ? Math.max(0, b - 2) : b + 1))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  const lastAnchor = rows.find((r) => r.anchored === 'yes')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', minHeight: 0 }}>
      {!compact && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
          }}
        >
          <StatTile label="Last anchor" value={lastAnchor ? lastAnchor.time : '—'} />
          <StatTile label="Anchor queue depth" value={String(rows.filter((r) => r.anchored === 'pending').length)} />
          <StatTile label="Pending deadlines" value={String(rows.filter((r) => r.receipt === 'queued').length)} />
          <StatTile label="Outbox backlog" value={String(outboxBacklog)} warn={outboxBacklog > 0} />
        </div>
      )}

      {!networkAvailable && (
        <p style={{ fontSize: 12, color: 'var(--vuka-text-secondary)', margin: 0 }}>
          No network. Events queue on the device outbox until it reconnects.
        </p>
      )}

      <div
        role="table"
        aria-label="Anchor event stream"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          border: '1px solid var(--vuka-border)',
          borderRadius: 'var(--vuka-radius-sm)',
          background: 'var(--vuka-bg-surface)',
        }}
      >
        <style>{`
          @keyframes vukaPanelRowEnter {
            from { opacity: 0; transform: translateY(-6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .vuka-panel-row { animation: vukaPanelRowEnter 320ms var(--vuka-spring) both; }
        `}</style>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: compact ? 11 : 12 }}>
          <thead>
            <tr style={{ position: 'sticky', top: 0, background: 'var(--vuka-bg-elevated)', zIndex: 1 }}>
              <Th>Time</Th>
              <Th>Chain #</Th>
              <Th>Entry hash</Th>
              <Th>Event</Th>
              <Th>Receipt</Th>
              <Th>Anchored</Th>
              <Th>HashScan</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="vuka-panel-row" style={{ borderTop: '1px solid var(--vuka-border-subtle)' }}>
                <Td mono>{row.time}</Td>
                <Td mono>#{row.chainIndex}</Td>
                <Td mono>{chunkHex(row.hash.slice(0, compact ? 12 : 20))}…</Td>
                <Td>
                  {row.isSim ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: 'var(--vuka-text-label)' }}>{row.reason}</span>
                      <StatusChip status="simulated" size="sm" />
                    </span>
                  ) : (
                    <span style={{ color: 'var(--vuka-text-dim)' }}>—</span>
                  )}
                </Td>
                <Td>
                  <StatusChip status={row.receipt === 'received' ? 'received' : 'queued'} size="sm" />
                </Td>
                <Td>
                  <span style={{ color: row.anchored === 'yes' ? 'var(--vuka-green-text)' : 'var(--vuka-text-dim)' }}>
                    {row.anchored === 'yes' ? 'Yes' : 'Pending'}
                  </span>
                </Td>
                <Td>
                  <a
                    href="#"
                    aria-disabled="true"
                    onClick={(e) => e.preventDefault()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      color: 'var(--vuka-link)',
                      minHeight: 44,
                      textDecoration: 'underline',
                      textUnderlineOffset: 3,
                      fontSize: compact ? 11 : 12,
                    }}
                  >
                    HashScan <ArrowSquareOut size={12} />
                  </a>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatTile({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div
      style={{
        border: '1px solid var(--vuka-border)',
        borderRadius: 'var(--vuka-radius-sm)',
        padding: '10px 12px',
        background: 'var(--vuka-bg-surface)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <p style={{ fontSize: 11, color: 'var(--vuka-text-secondary)', margin: 0 }}>{label}</p>
        <StatusChip status="simulated" size="sm" />
      </div>
      <p
        style={{
          fontSize: 18,
          fontFamily: 'var(--font-mono)',
          color: warn ? 'var(--vuka-text-title)' : 'var(--vuka-text-label)',
          margin: '4px 0 0',
        }}
      >
        {value}
      </p>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '8px 10px',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'var(--vuka-text-secondary)',
      }}
    >
      {children}
    </th>
  )
}

function Td({ children, mono = false }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td
      style={{
        padding: '7px 10px',
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        color: 'var(--vuka-text-label)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </td>
  )
}

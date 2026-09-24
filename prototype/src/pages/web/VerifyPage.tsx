import { useRef, useState, type CSSProperties, type DragEvent } from 'react'
import {
  UploadSimple,
  TestTube,
  Archive,
  WifiSlash,
  CheckCircle,
  XCircle,
  CircleDashed,
  ArrowSquareOut,
} from '@phosphor-icons/react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { StatusChip } from '@/components/ui/StatusChip'
import { useWebDemo, type VerifyResultState } from './webDemoContext'
import { WebShell } from './WebShell'
import { chunkHex, fakeHash } from './format'

type Phase = 'empty' | 'checking' | 'result'

const FAILURE_INDEX = 17
const FAILURE_CHECK = 'hash'

const eyebrow: CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  color: 'var(--vuka-text-dim)',
  marginBottom: 6,
}

const heroWord: CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontWeight: 600,
  fontSize: 34,
  lineHeight: 1.1,
  letterSpacing: '-0.01em',
  color: 'var(--vuka-text-title)',
  margin: 0,
}

const cardEyebrow: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--vuka-text-header)',
  margin: '0 0 4px',
}

/**
 * /verify — a stranger or insurer checks a VUKA record. Runs entirely in
 * this page: the whole point is that anyone can check a record without an
 * account or a request to VUKA. Proves *when*, never *what happened*.
 */
export function VerifyPage() {
  const { verifyResultState, realCheck } = useWebDemo()
  const [phase, setPhase] = useState<Phase>('empty')
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<number | null>(null)

  const startChecking = (name: string) => {
    setFileName(name)
    setPhase('checking')
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setPhase('result'), 550)
  }

  const reset = () => {
    setPhase('empty')
    setFileName(null)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    startChecking(file ? file.name : 'sample-record.json')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) startChecking(file.name)
    e.target.value = ''
  }

  return (
    <WebShell defaultTheme="ivory" maxWidth={1280}>
      <section aria-labelledby="verify-heading" style={{ maxWidth: 640 }}>
        <p style={eyebrow}>ANCHOR</p>
        <h1 id="verify-heading" style={heroWord}>
          Check a VUKA record yourself
        </h1>
        <p style={{ fontSize: 16, color: 'var(--vuka-text-secondary)', lineHeight: 1.6, marginTop: 12 }}>
          This proves <strong style={{ color: 'var(--vuka-text-label)' }}>when</strong> each entry was
          recorded and that nothing was changed since. It does not prove what happened.
        </p>
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 300px',
          gap: 28,
          marginTop: 32,
          alignItems: 'start',
        }}
      >
        {/* Main column — the verification flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <GlassCard hero style={{ padding: 24 }}>
            <div
              role="button"
              tabIndex={0}
              aria-label="Drop a record file here, or press Enter to choose one"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              style={{
                border: `1.5px dashed ${isDragOver ? 'var(--vuka-action)' : 'var(--vuka-border-emphasis)'}`,
                borderRadius: 'var(--vuka-radius-sm)',
                padding: '32px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 10,
                cursor: 'pointer',
                background: isDragOver ? 'var(--vuka-action-dim)' : 'transparent',
                transition: 'background var(--vuka-ease), border-color var(--vuka-ease)',
              }}
            >
              <span className="glass-circle" style={{ width: 48, height: 48 }}>
                <UploadSimple size={22} color="var(--vuka-text-title)" style={{ opacity: 0.85 }} />
              </span>
              <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--vuka-text-label)', margin: 0 }}>
                Drag a record file here, or click to choose one
              </p>
              <p style={{ fontSize: 13, color: 'var(--vuka-text-dim)', margin: 0 }}>Only .json record files</p>
              <label htmlFor="vuka-record-file" className="sr-only">
                VUKA record file (.json)
              </label>
              <input
                id="vuka-record-file"
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <Button variant="secondary" onClick={() => startChecking('sample-record.json')}>
                Use the sample record
              </Button>
              <StatusChip status="simulated" size="sm" label="Loads a SIMULATED sample" />
            </div>

            {phase !== 'empty' && (
              <div
                aria-live="polite"
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '1px solid var(--vuka-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--vuka-text-secondary)' }}>
                  {phase === 'checking' ? 'Checking record…' : `Loaded: ${fileName}`}
                </span>
                {phase === 'result' && (
                  <button
                    onClick={reset}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--vuka-action)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textUnderlineOffset: 3,
                    }}
                  >
                    Check another record
                  </button>
                )}
              </div>
            )}
          </GlassCard>

          {phase === 'result' && (
            <>
              <ResultCard state={verifyResultState} realCheck={realCheck} />
              <ProofPathCard state={verifyResultState} />
              <WhatWasCheckedCard state={verifyResultState} />
            </>
          )}
        </div>

        {/* Side column — offset for an asymmetric, editorial feel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 56 }}>
          <InsurerViewCard />
        </div>
      </div>

      <footer style={{ marginTop: 48, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--vuka-text-dim)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          Runs in your browser. Nothing is uploaded.
          <StatusChip status="simulated" size="sm" label="PROPOSED" />
        </p>
      </footer>
    </WebShell>
  )
}

/* ── Result card ──────────────────────────────────────────────── */

function ResultCard({ state, realCheck }: { state: VerifyResultState; realCheck: boolean }) {
  if (state === 'failure') {
    return (
      <GlassCard style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <XCircle size={20} weight="fill" color="var(--vuka-text-title)" />
          <p style={{ ...cardEyebrow, margin: 0 }}>Entry {FAILURE_INDEX} doesn't match</p>
        </div>
        <p style={{ fontSize: 15, color: 'var(--vuka-text-label)', lineHeight: 1.5, margin: 0 }}>
          Everything from entry {FAILURE_INDEX} on can't be trusted.
        </p>
        <p style={{ fontSize: 13, color: 'var(--vuka-text-secondary)', marginTop: 10 }}>
          Failed check: <span style={{ fontFamily: 'var(--font-mono)' }}>{FAILURE_CHECK}</span>
        </p>
      </GlassCard>
    )
  }

  const simulated = !realCheck || state !== 'live'
  const config: Record<Exclude<VerifyResultState, 'failure'>, { Icon: React.ElementType; label: string; sub: string; color: string }> = {
    live: simulated
      ? { Icon: TestTube, label: 'SIMULATED result · testnet', sub: 'No independent mirror-node check in this prototype', color: 'var(--vuka-text-secondary)' }
      : { Icon: CheckCircle, label: 'Live-verified · testnet', sub: 'Mirror-node check passed', color: 'var(--vuka-green-text)' },
    archived: { Icon: Archive, label: 'Archived: not independent', sub: 'Checked against a saved snapshot, not a live mirror node', color: 'var(--vuka-text-secondary)' },
    unavailable: { Icon: WifiSlash, label: 'Unavailable', sub: 'Check again when the mirror node is reachable', color: 'var(--vuka-text-secondary)' },
  }
  const { Icon, label, sub, color } = config[state]

  return (
    <GlassCard style={{ padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon size={20} weight="fill" color={color} />
          <p style={{ fontSize: 15, fontWeight: 600, color, margin: 0 }}>{label}</p>
        </div>
        {simulated && <StatusChip status="simulated" size="sm" />}
      </div>
      <p style={{ fontSize: 13, color: 'var(--vuka-text-secondary)', margin: 0 }}>{sub}</p>
    </GlassCard>
  )
}

/* ── Proof path + Hedera details ─────────────────────────────── */

function ProofPathCard({ state }: { state: VerifyResultState }) {
  const siblings = [0, 1, 2, 3, 4].map((i) => fakeHash(100 + i, 24))

  return (
    <GlassCard style={{ padding: 22 }}>
      <p style={cardEyebrow}>Proof path</p>
      <p style={{ fontSize: 13, color: 'var(--vuka-text-secondary)', margin: '0 0 12px' }}>
        Sibling hashes from this entry's leaf up to the anchored root.
      </p>
      <div
        style={{
          background: 'var(--vuka-bg-base)',
          borderRadius: 'var(--vuka-radius-sm)',
          border: '1px solid var(--vuka-border-subtle)',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {siblings.map((hash, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--vuka-text-secondary)', flexShrink: 0 }}>Sibling {i + 1}</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--vuka-text-label)', textAlign: 'right' }}>
              {chunkHex(hash)}
            </span>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--vuka-border)', margin: '16px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <HederaRow label="Topic" value="0.0.6412108" />
        <HederaRow label="Sequence" value="#4,121" />
        <HederaRow label="Consensus timestamp" value="2026-09-23T08:14:02.441Z" />
        <HederaRow
          label="Network"
          value={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              testnet <StatusChip status="simulated" size="sm" label="TESTNET" />
            </span>
          }
        />
      </div>

      <a
        href="#"
        aria-disabled="true"
        onClick={(e) => e.preventDefault()}
        style={{
          marginTop: 14,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--vuka-action)',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
        }}
      >
        View on HashScan <ArrowSquareOut size={13} />
        <StatusChip status="simulated" size="sm" />
      </a>

      {state === 'unavailable' && (
        <p style={{ fontSize: 12, color: 'var(--vuka-text-dim)', marginTop: 10 }}>
          The mirror node couldn't be reached to confirm this path just now.
        </p>
      )}
    </GlassCard>
  )
}

function HederaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--vuka-text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--vuka-text-label)' }}>{value}</span>
    </div>
  )
}

/* ── What was checked ────────────────────────────────────────── */

function WhatWasCheckedCard({ state }: { state: VerifyResultState }) {
  const failed = state === 'failure'
  const unavailable = state === 'unavailable'

  const rows: { label: string; status: 'pass' | 'fail' | 'unavailable' }[] = [
    { label: 'Hashes recomputed', status: failed ? 'fail' : 'pass' },
    { label: 'Chain links', status: failed ? 'fail' : 'pass' },
    { label: 'Device signatures', status: 'pass' },
    { label: 'Anchor message matches the root', status: failed ? 'fail' : unavailable ? 'unavailable' : 'pass' },
  ]

  return (
    <GlassCard style={{ padding: 22 }}>
      <p style={cardEyebrow}>What was checked</p>
      <div style={{ marginTop: 8 }}>
        {rows.map((row) => (
          <CheckRow key={row.label} {...row} />
        ))}
      </div>
    </GlassCard>
  )
}

function CheckRow({ label, status }: { label: string; status: 'pass' | 'fail' | 'unavailable' }) {
  const Icon = status === 'pass' ? CheckCircle : status === 'fail' ? XCircle : CircleDashed
  const color = status === 'pass' ? 'var(--vuka-green-text)' : 'var(--vuka-text-secondary)'
  const word = status === 'pass' ? 'Passed' : status === 'fail' ? 'Didn’t match' : 'Unavailable'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '9px 0',
        borderBottom: '1px solid var(--vuka-border-subtle)',
      }}
    >
      <span style={{ fontSize: 14, color: 'var(--vuka-text-label)' }}>{label}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color }}>
        <Icon size={16} weight={status === 'pass' ? 'fill' : status === 'fail' ? 'fill' : 'regular'} />
        {word}
      </span>
    </div>
  )
}

/* ── Insurer view (concept) ──────────────────────────────────── */

function InsurerViewCard() {
  return (
    <GlassCard style={{ padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <p style={{ ...cardEyebrow, margin: 0 }}>Insurer view</p>
        <StatusChip status="simulated" size="sm" label="DESIGNED, NOT BUILT" />
      </div>
      <p style={{ fontSize: 13, color: 'var(--vuka-text-secondary)', lineHeight: 1.5, margin: '4px 0 14px' }}>
        A member-granted, incident-only package. No numeric score — plain words only.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <InsurerRow label="Tier" value="Tier 2 · verify recommended" />
        <InsurerRow label="Corroboration" value="E1 — one corroborating signal" />
        <InsurerRow label="Reasons" value="Scream-like sound, then a journey check answered late" />
        <InsurerRow label="Guardians notified" value="Guardian A" />
      </div>
    </GlassCard>
  )
}

function InsurerRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--vuka-text-dim)', margin: '0 0 3px' }}>
        {label}
      </p>
      <p style={{ fontSize: 13, color: 'var(--vuka-text-label)', lineHeight: 1.5, margin: 0 }}>{value}</p>
    </div>
  )
}

import { useState, type CSSProperties } from 'react'
import { Lock, CaretRight } from '@phosphor-icons/react'
import { useMember } from '@/contexts/MemberContext'
import { useDemo } from '@/contexts/DemoContext'
import { GlassCard } from '@/components/ui/GlassCard'
import { TimelineItem } from '@/components/ui/TimelineItem'
import { AnchorProofCard } from '@/components/ui/AnchorProofCard'

const heroWord: CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontWeight: 600,
  fontSize: 32,
  lineHeight: 1.08,
  letterSpacing: '-0.01em',
  color: 'var(--vuka-text-title)',
}

const eyebrow: CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  color: 'var(--vuka-text-dim)',
  marginBottom: 6,
}

/**
 * ANCHOR · My Record — the member's own tamper-evident timeline.
 * The record card is the ivory page itself: timeline sits in one white card;
 * proof details live in a second card, collapsed by default. The record
 * freezes for 6 h after ANY PIN entry and never reveals what is held back.
 */
export function MyRecord() {
  const { recordFrozen } = useMember()
  const { anchorState } = useDemo()
  const [proofOpen, setProofOpen] = useState(false)

  return (
    <div style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Hero */}
      <GlassCard hero style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span className="glass-circle" style={{ width: 40, height: 40 }}>
            <Lock size={20} color="var(--vuka-text-title)" style={{ opacity: 0.85 }} />
          </span>
          <p style={{ ...eyebrow, marginBottom: 0 }}>ANCHOR</p>
        </div>
        <h1 style={heroWord}>My record</h1>
        <p style={{ fontSize: 15, color: 'var(--vuka-text-secondary)', margin: '10px 0 0', lineHeight: 1.5 }}>
          Only 33-byte fingerprints go on the public ledger. No personal data is
          written on chain.
        </p>
      </GlassCard>

      {/* Timeline — one white card */}
      <GlassCard style={{ padding: 20 }}>
        <p style={eyebrow}>Timeline</p>
        <div style={{ marginTop: 12 }}>
          <TimelineItem
            kind="journey_started"
            label="Journey started"
            time="07:42"
            chipStatus="received"
          />
          <TimelineItem
            kind="sound_detected"
            label="Scream-like sound · uncalibrated"
            time="08:06"
            monoDetail={
              <>
                score 8 120 bp · uncalibrated
                <br />
                location fix · ±15 m · 2 min old
              </>
            }
          />
          <TimelineItem
            kind="check_answered"
            label="Journey check answered"
            time="08:07"
            chipStatus="received"
          />
          <TimelineItem
            kind="anchor_written"
            label="Anchor record written"
            time="08:07"
            monoDetail="seq #4121 · a3f8b2…c219"
            chipStatus="simulated"
            isLast
          />
        </div>

        {/* Evidence line — the one serif line */}
        <p
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--vuka-border)',
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 15,
            lineHeight: 1.5,
            color: 'var(--vuka-text-secondary)',
          }}
        >
          This record proves when each entry was made, not what happened.
        </p>
      </GlassCard>

      {/* Proof details — second card, collapsed by default */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <button
          onClick={() => setProofOpen((v) => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: 20,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--vuka-text-header)' }}>
            Proof details
          </span>
          <CaretRight
            size={18}
            color="var(--vuka-text-dim)"
            style={{ transform: proofOpen ? 'rotate(90deg)' : 'none', transition: 'transform var(--vuka-ease)' }}
          />
        </button>
        {proofOpen && (
          <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--vuka-border)' }}>
            <div style={{ height: 16 }} />
            <AnchorProofCard state={anchorState} simulated bare />
          </div>
        )}
      </GlassCard>

      <p style={{ fontSize: 12, color: 'var(--vuka-text-dim)', textAlign: 'center', lineHeight: 1.5 }}>
        {recordFrozen
          ? 'Download my record is unavailable right now. Try again later.'
          : 'Verify independently or download your record any time.'}
      </p>
    </div>
  )
}

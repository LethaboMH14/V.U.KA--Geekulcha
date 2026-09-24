import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { FlatCard } from '@/components/ui/FlatCard'
import { StatusChip } from '@/components/ui/StatusChip'
import { Button } from '@/components/ui/Button'
import { TimelineItem } from '@/components/ui/TimelineItem'
import { PinKeypad } from '@/components/ui/PinKeypad'
import { AnchorProofCard } from '@/components/ui/AnchorProofCard'
import { ReasonRow } from '@/components/ui/ReasonRow'
import { ListRow } from '@/components/ui/ListRow'
import { ToastDemo } from '@/components/ui/Toast'
import { BottomSheet } from '@/components/ui/BottomSheet'
import {
  ShieldChevron, Lock, Gear, User, Bell, Trash, MapPin,
  Eye, EyeSlash, CaretRight,
} from '@phosphor-icons/react'

export function ComponentGallery() {
  const [pinResult, setPinResult] = useState<string | null>(null)
  const [showSheet, setShowSheet] = useState(false)

  return (
    <div
      style={{
        padding: '20px 16px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
      }}
    >
      {/* ── Header ────────────────────────────────────── */}
      <div>
        <div style={{ marginBottom: 6 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--vuka-text-title)',
              letterSpacing: '-0.02em',
            }}
          >
            VUKA
          </h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--vuka-text-secondary)' }}>
          Tokens & Components · Night Contour × Midnight
        </p>
      </div>

      {/* ── Typography ───────────────────────────────── */}
      <Section title="Typography">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <TypeRow size={22} weight={700} label="Screen title · SemiBold 22" />
          <TypeRow size={17} weight={600} label="Section heading · SemiBold 17" />
          <TypeRow size={16} weight={500} label="Body copy · Medium 16 — Thandi's journey is active." />
          <TypeRow size={14} weight={400} label="Label · Regular 14 — Last server contact 22:14" secondary />
          <TypeRow size={14} weight={400} mono label="Mono readable 14 — a3f8b2…c219 · score 8 120 bp" />
          <TypeRow size={12} weight={400} mono label="Mono decorative 12 — seq 004 · uncalibrated" secondary />
        </div>
      </Section>

      {/* ── Colour semantics ─────────────────────────── */}
      <Section title="Colour semantics">
        <ColourRow
          fill="var(--vuka-green-fill)"
          textColor="var(--vuka-green-text)"
          border="var(--vuka-green-border)"
          label="Verified / Received only"
          rule="Deep forest green — nothing else uses green"
        />
        <ColourRow
          fill="var(--vuka-amber-fill)"
          textColor="var(--vuka-amber-text)"
          border="var(--vuka-amber-text)"
          label="Guardian mode only"
          rule="Amber — one urgent colour, guardian screens only"
        />
        <ColourRow
          fill="var(--vuka-action-dim)"
          textColor="var(--vuka-action)"
          border="var(--vuka-action)"
          label="Primary action"
          rule="Jade teal — interactive affordances"
        />
        <ColourRow
          fill="var(--vuka-bg-elevated)"
          textColor="var(--vuka-text-secondary)"
          border="var(--vuka-border)"
          label="Neutral / Pending"
          rule="Cool grey-blue — no red, no warning orange on member screens"
        />
      </Section>

      {/* ── Status chips ─────────────────────────────── */}
      <Section title="Status chips">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <StatusChip status="verified" />
          <StatusChip status="received" />
          <StatusChip status="queued" />
          <StatusChip status="neutral" label="Pending" />
          <StatusChip status="simulated" />
        </div>
      </Section>

      {/* ── Buttons ──────────────────────────────────── */}
      <Section title="Buttons — 48 px min touch target">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="primary" fullWidth>Start journey</Button>
          <Button variant="secondary" fullWidth>Invite guardian</Button>
          <Button variant="ghost" fullWidth>End journey</Button>
          <Button variant="primary" fullWidth disabled>Disabled state</Button>
        </div>
      </Section>

      {/* ── Glass cards ──────────────────────────────── */}
      <Section title="Glass cards — 3 elevations">
        <GlassCard elevation={1} style={{ padding: '14px 16px' }}>
          <CardLabel>Elevation 1 · 16 px blur · radius 20</CardLabel>
          <p style={{ fontSize: 14, color: 'var(--vuka-text-secondary)', marginTop: 4 }}>
            List items, secondary content, quiet containers
          </p>
        </GlassCard>
        <GlassCard elevation={2} style={{ padding: '14px 16px' }}>
          <CardLabel>Elevation 2 · 20 px blur · radius 20</CardLabel>
          <p style={{ fontSize: 14, color: 'var(--vuka-text-secondary)', marginTop: 4 }}>
            Primary cards — journey status, record, hero content
          </p>
        </GlassCard>
        <GlassCard elevation={3} style={{ padding: '14px 16px' }}>
          <CardLabel>Elevation 3 · 24 px blur · radius 24</CardLabel>
          <p style={{ fontSize: 14, color: 'var(--vuka-text-secondary)', marginTop: 4 }}>
            Modal surfaces, sheets, highest-priority cards
          </p>
        </GlassCard>
      </Section>

      {/* ── Flat card ────────────────────────────────── */}
      <Section title="Flat card — Journey check">
        <FlatCard style={{ padding: '16px 18px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--vuka-text-title)', marginBottom: 4 }}>
            Journey check
          </p>
          <p style={{ fontSize: 14, color: 'var(--vuka-text-secondary)' }}>
            No glow, no blur, no background art, no countdown.
            One frame for normal and duress — from spec.
          </p>
        </FlatCard>
      </Section>

      {/* ── Timeline ─────────────────────────────────── */}
      <Section title="Timeline">
        <div style={{ paddingLeft: 0 }}>
          <TimelineItem
            kind="journey_started"
            label="Journey started · Cape Town CBD"
            time="07:42"
            chipStatus="received"
          />
          <TimelineItem
            kind="sound_detected"
            label="Scream-like sound · uncalibrated"
            time="08:06"
            monoDetail="score 8 120 bp · uncalibrated"
            tag="PROPOSED"
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
            monoDetail="seq 004 · a3f8b2…c219"
            chipStatus="verified"
            isLast
          />
        </div>
      </Section>

      {/* ── PIN keypad ───────────────────────────────── */}
      <Section title="PIN keypad — Journey check">
        <FlatCard style={{ padding: '20px 16px' }}>
          <p style={{ fontSize: 14, color: 'var(--vuka-text-secondary)', textAlign: 'center', marginBottom: 20 }}>
            Enter your PIN to continue
          </p>
          <PinKeypad
            onComplete={(pin) => setPinResult(pin)}
            resetOnComplete
          />
          {pinResult && (
            <p style={{ marginTop: 12, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--vuka-text-dim)', textAlign: 'center' }}>
              Entered: {pinResult} (demo only — not sent)
            </p>
          )}
        </FlatCard>
      </Section>

      {/* ── Anchor proof card ────────────────────────── */}
      <Section title="Anchor proof card — 3 states">
        <AnchorProofCard state="live" simulated />
        <AnchorProofCard
          state="archived"
          simulated
          rootHash="9c2a…f441"
          sequence={6803}
          timestamp="2026-09-22 · 14:30 SAST"
        />
        <AnchorProofCard state="unavailable" simulated />
      </Section>

      {/* ── Reason rows ──────────────────────────────── */}
      <Section title="Reason rows — Evidence assessment">
        <GlassCard elevation={1} style={{ padding: '4px 14px' }}>
          <ReasonRow
            label="Scream-like sound detected"
            points="3 pt"
            description="Audio classification match above threshold"
          />
          <ReasonRow
            label="No answer within 60 s"
            points="4 pt"
            description="Check-in timed out with no PIN entry"
          />
          <ReasonRow
            label="Location consistent with route"
            points="1 pt"
            description="Fix within 200 m of last known waypoint"
          />
          <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--vuka-text-secondary)' }}>Total</span>
            <span style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--vuka-text-label)', fontWeight: 600 }}>
              8 pt · E2
            </span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--vuka-text-dim)', paddingBottom: 12, lineHeight: 1.5 }}>
            Uncalibrated design tally. Not a probability or a finding about any person.
            A low total is not evidence that no coercion occurred.
          </p>
        </GlassCard>
      </Section>

      {/* ── List rows ────────────────────────────────── */}
      <Section title="List rows">
        <GlassCard elevation={1} style={{ padding: '4px 14px' }}>
          <ListRow
            leading={<User size={18} />}
            label="Thandi Dlamini"
            sublabel="Member since September 2026"
            chevron
          />
          <ListRow
            leading={<Bell size={18} />}
            label="Notifications"
            trailing="On"
            chevron
          />
          <ListRow
            leading={<MapPin size={18} />}
            label="Location access"
            sublabel="Optional — journey still works without it"
            trailing="Off"
            chevron
          />
          <ListRow
            leading={<Gear size={18} />}
            label="Settings"
            chevron
          />
          <ListRow
            leading={<Trash size={18} />}
            label="Delete my data"
            sublabel="PIN required · 72-hour cooling-off"
            danger
          />
        </GlassCard>
      </Section>

      {/* ── Toast ────────────────────────────────────── */}
      <Section title="Toast">
        <ToastDemo />
      </Section>

      {/* ── Bottom sheet ─────────────────────────────── */}
      <Section title="Bottom sheet">
        <Button variant="secondary" fullWidth onClick={() => setShowSheet(true)}>
          Preview bottom sheet
        </Button>
        {showSheet && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowSheet(false) }}
          >
            <div style={{ width: '100%', maxWidth: 390, margin: '0 auto' }}>
              <BottomSheet title="Stand down" onClose={() => setShowSheet(false)}>
                <p style={{ fontSize: 14, color: 'var(--vuka-text-secondary)', marginBottom: 20 }}>
                  Only stand down if you know they're safe.
                </p>
                <Button variant="secondary" fullWidth onClick={() => setShowSheet(false)}>
                  Cancel
                </Button>
              </BottomSheet>
            </div>
          </div>
        )}
        <BottomSheet inline title="Guardian invite (inline preview)" onClose={() => {}}>
          <p style={{ fontSize: 13, color: 'var(--vuka-text-secondary)', marginBottom: 12 }}>
            Share this 6-digit code. Valid 10 min · 5 attempts.
          </p>
          <div
            style={{
              background: 'var(--vuka-bg-base)',
              borderRadius: 'var(--vuka-radius-sm)',
              padding: '14px 12px',
              textAlign: 'center',
              border: '1px solid var(--vuka-border)',
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                letterSpacing: '0.22em',
                color: 'var(--vuka-text-title)',
              }}
            >
              4 8 3 2 1 9
            </span>
          </div>
        </BottomSheet>
      </Section>

      {/* ── Spacing & radius reference ───────────────── */}
      <Section title="Radius tokens">
        <div style={{ display: 'flex', gap: 10 }}>
          {([12, 20, 24, 36] as const).map((r) => (
            <div
              key={r}
              style={{
                flex: 1,
                height: 48,
                background: 'var(--vuka-bg-elevated)',
                border: '1px solid var(--vuka-border)',
                borderRadius: r,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--vuka-text-dim)' }}>
                {r}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer spacer */}
      <div style={{ height: 16 }} />
    </div>
  )
}

/* ── Gallery helpers ──────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--vuka-text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 12,
        }}
      >
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  )
}

function TypeRow({
  size,
  weight,
  label,
  mono = false,
  secondary = false,
}: {
  size: number
  weight: number
  label: string
  mono?: boolean
  secondary?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span
        style={{
          fontSize: size,
          fontWeight: weight,
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
          color: secondary ? 'var(--vuka-text-secondary)' : 'var(--vuka-text-label)',
          lineHeight: 1.35,
        }}
      >
        {label}
      </span>
    </div>
  )
}

function ColourRow({
  fill,
  textColor,
  border,
  label,
  rule,
}: {
  fill: string
  textColor: string
  border: string
  label: string
  rule: string
}) {
  return (
    <div
      style={{
        background: fill,
        border: `1px solid ${border}`,
        borderRadius: 'var(--vuka-radius-sm)',
        padding: '10px 14px',
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 600, color: textColor, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 11, color: textColor, opacity: 0.75 }}>{rule}</p>
    </div>
  )
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--vuka-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {children}
    </p>
  )
}

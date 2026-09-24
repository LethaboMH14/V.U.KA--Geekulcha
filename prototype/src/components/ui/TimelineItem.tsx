import { Circle, CheckCircle, ShieldWarning, Ear, ArrowRight, Lock } from '@phosphor-icons/react'
import { StatusChip, type ChipStatus } from './StatusChip'

export type TimelineKind =
  | 'journey_started'
  | 'journey_ended'
  | 'sound_detected'
  | 'check_answered'
  | 'anchor_written'

interface TimelineItemProps {
  kind: TimelineKind
  label: string
  /** ISO time string or formatted time string */
  time: string
  /** Optional mono detail — hashes, scores, sequence numbers, location fixes */
  monoDetail?: React.ReactNode
  chipStatus?: ChipStatus
  isLast?: boolean
  /** Tags: SIMULATED, PROPOSED, etc. */
  tag?: string
}

const kindConfig: Record<TimelineKind, { Icon: React.ElementType; color: string }> = {
  journey_started: { Icon: ArrowRight,      color: 'var(--vuka-action)' },
  journey_ended:   { Icon: Circle,           color: 'var(--vuka-text-secondary)' },
  sound_detected:  { Icon: Ear,              color: 'var(--vuka-text-secondary)' },
  check_answered:  { Icon: CheckCircle,      color: 'var(--vuka-green-text)' },
  anchor_written:  { Icon: Lock,             color: 'var(--vuka-action)' },
}

export function TimelineItem({
  kind,
  label,
  time,
  monoDetail,
  chipStatus,
  isLast = false,
  tag,
}: TimelineItemProps) {
  const { Icon, color } = kindConfig[kind]

  return (
    <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
      {/* Spine */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--vuka-bg-elevated)',
            border: '1px solid var(--vuka-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            flexShrink: 0,
          }}
        >
          <Icon size={16} weight={kind === 'check_answered' || kind === 'journey_started' ? 'fill' : 'regular'} />
        </div>
        {!isLast && (
          <div
            style={{
              width: 1,
              flex: 1,
              minHeight: 16,
              background: 'var(--vuka-border)',
              marginTop: 4,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginTop: 6 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--vuka-text-label)',
              lineHeight: 1.4,
            }}
          >
            {label}
            {tag && (
              <span
                style={{
                  marginLeft: 8,
                  display: 'inline-block',
                  padding: '1px 6px',
                  borderRadius: 99,
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--vuka-text-secondary)',
                  background: 'var(--vuka-bg-elevated)',
                  border: '1px solid var(--vuka-border)',
                  verticalAlign: 'middle',
                }}
              >
                {tag}
              </span>
            )}
          </span>
          <span
            style={{
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--vuka-text-dim)',
              flexShrink: 0,
            }}
          >
            {time}
          </span>
        </div>

        {monoDetail && (
          <p
            style={{
              marginTop: 3,
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--vuka-text-secondary)',
              lineHeight: 1.5,
            }}
          >
            {monoDetail}
          </p>
        )}

        {chipStatus && (
          <div style={{ marginTop: 6 }}>
            <StatusChip status={chipStatus} size="sm" />
          </div>
        )}
      </div>
    </div>
  )
}

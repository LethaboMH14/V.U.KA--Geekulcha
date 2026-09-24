import { useState } from 'react'
import {
  Phone, PhoneX, Prohibit, MapPinLine, ClockCounterClockwise,
  ShieldChevron, SealCheck,
} from '@phosphor-icons/react'
import { useMember } from '@/contexts/MemberContext'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { StatusChip } from '@/components/ui/StatusChip'

type Ack = 'new' | 'called' | 'handling' | 'stood_down'

/**
 * Guardian mode — the one urgent screen. Amber lives here and nowhere else.
 * The reason differs by PIN type (duress vs no-answer), demonstrating the duress
 * rule: the member's own phone shows an identical "Checked in" either way.
 */
export function GuardianView() {
  const { memberName, pinType } = useMember()
  const [ack, setAck] = useState<Ack>('new')
  const [confirmStandDown, setConfirmStandDown] = useState(false)

  const reason =
    pinType === 'duress'
      ? 'Duress PIN entered'
      : 'Scream-like sound, then no answer in 60 s'

  return (
    <div style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Standby identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShieldChevron size={20} weight="fill" color="var(--vuka-text-secondary)" />
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--vuka-text-header)' }}>
          Guardian · alert
        </span>
        <span style={{ marginLeft: 'auto' }}>
          <StatusChip status="simulated" size="sm" />
        </span>
      </div>

      {/* Amber lead card — the one urgent colour */}
      <div
        style={{
          background: 'var(--vuka-amber-fill)',
          borderRadius: 'var(--vuka-radius-lg)',
          padding: '18px 20px',
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
        }}
      >
        <Prohibit size={28} weight="fill" color="var(--vuka-amber-text)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 600, fontSize: 22, lineHeight: 1.15, letterSpacing: '-0.01em',
            color: 'var(--vuka-amber-text)',
          }}>
            Don't call or text them. Call 10111.
          </p>
        </div>
      </div>

      {/* Who & why */}
      <GlassCard hero style={{ padding: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--vuka-text-secondary)', marginBottom: 6 }}>
          Who
        </p>
        <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--vuka-text-title)' }}>
          {memberName}
        </p>

        <div style={{ height: 1, background: 'var(--vuka-border)', margin: '16px 0' }} />

        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--vuka-text-secondary)', marginBottom: 6 }}>
          Why
        </p>
        <p style={{ fontSize: 16, color: 'var(--vuka-text-label)', lineHeight: 1.45 }}>
          {reason}
        </p>
        <p style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--vuka-text-secondary)', marginTop: 8 }}>
          22:14 SAST
        </p>
      </GlassCard>

      {/* Location */}
      <GlassCard style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="glass-circle" style={{ width: 40, height: 40 }}>
            <MapPinLine size={20} color="var(--vuka-text-title)" style={{ opacity: 0.85 }} />
          </span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--vuka-text-label)' }}>
              Location unavailable
            </p>
            <p style={{ fontSize: 13, color: 'var(--vuka-text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
              No location fix was shared for this detection.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 2 }}>
        {ack === 'new' && (
          <Button variant="primary" size="lg" fullWidth
            icon={<Phone size={18} weight="fill" />}
            onClick={() => setAck('called')}
          >
            Call 10111
          </Button>
        )}

        {ack === 'called' && (
          <Button variant="primary" size="lg" fullWidth
            icon={<SealCheck size={18} weight="fill" />}
            onClick={() => setAck('handling')}
          >
            I called 10111
          </Button>
        )}

        {ack === 'handling' && (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 14, color: 'var(--vuka-green-text)', fontWeight: 500,
              padding: '4px 2px',
            }}>
              <SealCheck size={18} weight="fill" />
              Response recorded — signed on this device
            </div>
            <Button variant="secondary" size="lg" fullWidth onClick={() => setConfirmStandDown(true)}>
              Stand down
            </Button>
          </>
        )}

        {ack === 'stood_down' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 15, color: 'var(--vuka-text-label)', fontWeight: 500,
            padding: '6px 2px',
          }}>
            <SealCheck size={18} weight="fill" color="var(--vuka-green-text)" />
            Stood down — you confirmed they're safe
          </div>
        )}

        {/* Locked "Call them" — never available during an open incident */}
        <Button variant="ghost" size="lg" fullWidth disabled icon={<PhoneX size={18} />}>
          Call them
        </Button>
        <p style={{ fontSize: 12, color: 'var(--vuka-text-dim)', textAlign: 'center', lineHeight: 1.5 }}>
          Unlocks after stand-down or when the incident closes.
          The alert is never withdrawn.
        </p>
      </div>

      {/* Stand-down confirmation */}
      {confirmStandDown && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.45)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmStandDown(false) }}
        >
          <div style={{ width: '100%' }}>
            <BottomSheet title="Stand down" onClose={() => setConfirmStandDown(false)}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 20 }}>
                <ClockCounterClockwise size={18} color="var(--vuka-text-secondary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 15, color: 'var(--vuka-text-label)', lineHeight: 1.5 }}>
                  Only stand down if you know they're safe.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button variant="primary" fullWidth onClick={() => { setAck('stood_down'); setConfirmStandDown(false) }}>
                  I know they're safe — stand down
                </Button>
                <Button variant="ghost" fullWidth onClick={() => setConfirmStandDown(false)}>
                  Cancel
                </Button>
              </div>
            </BottomSheet>
          </div>
        </div>
      )}
    </div>
  )
}

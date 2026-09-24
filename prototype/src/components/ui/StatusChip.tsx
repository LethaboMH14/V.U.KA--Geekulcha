export type ChipStatus = 'verified' | 'received' | 'queued' | 'neutral' | 'simulated'

interface StatusChipProps {
  status: ChipStatus
  label?: string
  size?: 'sm' | 'md'
}

const config: Record<ChipStatus, { defaultLabel: string; dot: string; mono?: boolean }> = {
  verified:  { defaultLabel: 'Verified',  dot: 'var(--vuka-green-text)' },
  received:  { defaultLabel: 'Received',  dot: 'var(--vuka-green-text)' },
  queued:    { defaultLabel: 'Queued',    dot: 'var(--vuka-text-dim)' },
  neutral:   { defaultLabel: 'Pending',   dot: 'var(--vuka-text-dim)' },
  simulated: { defaultLabel: 'SIMULATED', dot: 'var(--vuka-text-dim)', mono: true },
}

/**
 * Small glass pill with a coloured dot + word. Green dots are reserved for a
 * real verification or a server receipt; everything else is neutral grey.
 */
export function StatusChip({ status, label, size = 'md' }: StatusChipProps) {
  const { defaultLabel, dot, mono } = config[status]
  const text = label ?? defaultLabel

  return (
    <span
      className="glass-pill"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: size === 'sm' ? '3px 9px 3px 8px' : '4px 11px 4px 9px',
        fontSize: mono ? 10 : size === 'sm' ? 11 : 12,
        fontWeight: 500,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        color: 'var(--vuka-text-secondary)',
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        textTransform: mono ? 'uppercase' : 'none',
        letterSpacing: mono ? '0.08em' : 'normal',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dot,
          flexShrink: 0,
          boxShadow: '0 0 0 2px color-mix(in srgb, currentColor 12%, transparent)',
        }}
      />
      {text}
    </span>
  )
}

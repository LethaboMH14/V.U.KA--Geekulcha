interface ReasonRowProps {
  label: string
  /** Point value in mono — e.g. "3 pt" */
  points: string
  description?: string
}

/**
 * Evidence assessment reason row: label + mono points.
 * From spec: no bands, gauges, percentages or colour scales.
 */
export function ReasonRow({ label, points, description }: ReasonRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 0',
        borderBottom: '1px solid var(--vuka-border-subtle)',
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, color: 'var(--vuka-text-label)', marginBottom: description ? 3 : 0, fontWeight: 500 }}>
          {label}
        </p>
        {description && (
          <p style={{ fontSize: 12, color: 'var(--vuka-text-secondary)', lineHeight: 1.5 }}>
            {description}
          </p>
        )}
      </div>
      <span
        style={{
          fontSize: 14,
          fontFamily: 'var(--font-mono)',
          color: 'var(--vuka-text-secondary)',
          flexShrink: 0,
          paddingTop: 1,
        }}
      >
        {points}
      </span>
    </div>
  )
}

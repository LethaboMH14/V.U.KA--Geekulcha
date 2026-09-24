import { WebShell } from './WebShell'
import { PanelStream } from './PanelStream'
import { StatusChip } from '@/components/ui/StatusChip'

/**
 * /panel — the live demo panel. Default theme: Midnight (from spec).
 * A dense, crt.sh-style table of opaque hashes, updating on a timer.
 */
export function PanelPage() {
  return (
    <WebShell defaultTheme="midnight" maxWidth={1400}>
      <section aria-labelledby="panel-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h1
            id="panel-heading"
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 32,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              color: 'var(--vuka-text-title)',
              margin: 0,
            }}
          >
            Anchor stream
          </h1>
          <StatusChip status="simulated" />
        </div>
        <p style={{ fontSize: 15, color: 'var(--vuka-text-secondary)', maxWidth: 640, lineHeight: 1.5, marginTop: 0 }}>
          Every row is an opaque, typed fingerprint written toward the hourly anchor. Event kind and
          reason are shown only for demo subjects (tagged <code style={{ fontFamily: 'var(--font-mono)' }}>sim_</code>);
          real-subject rows show only the hash.
        </p>
      </section>

      <div style={{ marginTop: 24, height: 560 }}>
        <PanelStream />
      </div>
    </WebShell>
  )
}

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { PhoneFrame } from '@/components/PhoneFrame'
import { VigilHome } from '@/pages/VigilHome'
import { WebShell } from './WebShell'
import { PanelStream } from './PanelStream'

const STAGE_WIDTH = 1920
const STAGE_HEIGHT = 1080

/**
 * /stage — the demo stage: the phone (VIGIL) mirrored on the left, the
 * /panel stream on the right, arriving side by side. A fixed 1920×1080
 * canvas, scaled to fit. Switching PIN type in DemoPanel changes only the
 * panel side and guardian view — the phone (a member screen) never differs
 * by PIN type, by construction.
 *
 * /stage?present — presentation mode for the projector: the canvas alone,
 * fitted to the whole window, no page chrome. Esc returns to /stage.
 */
function StageCanvas({ fit }: { fit: 'width' | 'window' }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () =>
      setScale(
        fit === 'window'
          ? Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT)
          : Math.min(1, el.clientWidth / STAGE_WIDTH),
      )
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    measure()
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [fit])

  const canvas: ReactNode = (
    <div
      style={{
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: fit === 'window' ? 'center center' : 'top left',
        display: 'flex',
        flexDirection: 'column',
        border: fit === 'window' ? 'none' : '1px solid var(--vuka-border)',
        borderRadius: fit === 'window' ? 0 : 20,
        overflow: 'hidden',
        background: 'var(--vuka-bg-surface)',
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1, display: 'flex', gap: 72, padding: '48px 72px', minHeight: 0, alignItems: 'center' }}>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <PhoneFrame>
            <VigilHome />
          </PhoneFrame>
        </div>
        <div style={{ flex: 1, minWidth: 0, height: '100%' }}>
          <PanelStream compact />
        </div>
      </div>
      <div
        style={{
          height: 64,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '1px solid var(--vuka-border)',
        }}
      >
        <p style={{ fontSize: 16, color: 'var(--vuka-text-secondary)', margin: 0 }}>
          Everything on screen is SIMULATED unless marked otherwise.
        </p>
      </div>
    </div>
  )

  if (fit === 'window') {
    return (
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--vuka-bg-base)',
          overflow: 'hidden',
        }}
      >
        {canvas}
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ marginTop: 20, width: '100%' }}>
      <div style={{ height: STAGE_HEIGHT * scale, position: 'relative' }}>{canvas}</div>
    </div>
  )
}

export function StagePage() {
  const present = new URLSearchParams(window.location.search).has('present')

  useEffect(() => {
    if (!present) return
    document.documentElement.setAttribute('data-theme', 'midnight')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') window.location.assign('/stage')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [present])

  if (present) {
    return (
      <main aria-label="Demo stage, presentation mode">
        <h1 style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          Demo stage
        </h1>
        <StageCanvas fit="window" />
      </main>
    )
  }

  return (
    <WebShell defaultTheme="midnight" maxWidth={1400}>
      <section
        aria-labelledby="stage-heading"
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}
      >
        <div>
          <h1
            id="stage-heading"
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 32,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              color: 'var(--vuka-text-title)',
              margin: '0 0 6px',
            }}
          >
            Demo stage
          </h1>
          <p style={{ fontSize: 14, color: 'var(--vuka-text-secondary)', margin: 0 }}>
            The phone and the live record, side by side. Present it full screen for the projector.
          </p>
        </div>
        <a
          href="/stage?present"
          className="vuka-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 48,
            padding: '0 22px',
            borderRadius: 999,
            background: 'var(--vuka-action)',
            color: 'var(--vuka-action-text)',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
          }}
        >
          Present full screen
        </a>
      </section>

      <StageCanvas fit="width" />
    </WebShell>
  )
}

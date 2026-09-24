/**
 * The signature "listening" line — a calm, slow waveform that drifts under the
 * hero status on Journey active. It is VUKA's visual identity.
 *
 * Rules (from the art direction):
 *  - colour #C5CEE0 at 60%, 2 px stroke, no colour pulsing
 *  - a gentle horizontal drift only; nothing flashes
 *  - it must NOT appear on the Journey check (that screen stays flat and plain)
 */
export function ListeningLine() {
  return (
    <div
      aria-hidden
      style={{
        height: 24,
        overflow: 'hidden',
        // Fade the wave out at both ends so it reads as ambient, not a hard edge
        WebkitMaskImage:
          'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)',
        maskImage:
          'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)',
      }}
    >
      <svg
        className="listening-wave"
        width="480"
        height="24"
        viewBox="0 0 480 24"
        fill="none"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        {/* One period is 120px; the drift animation translates by exactly 120px
            so the loop is seamless. Two extra periods cover the reveal. */}
        <path
          d="M0,12 Q15,3 30,12 T60,12 T90,12 T120,12 T150,12 T180,12
             T210,12 T240,12 T270,12 T300,12 T330,12 T360,12
             T390,12 T420,12 T450,12 T480,12"
          stroke="var(--vuka-action)"
          strokeOpacity="0.4"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

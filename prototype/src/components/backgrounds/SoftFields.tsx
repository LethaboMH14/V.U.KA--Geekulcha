/**
 * Background — three large, soft, slowly drifting colour orbs. This is the only
 * thing behind the content; it gives the glass something real to blur and
 * refract. Colours come from the active theme's --vuka-orb-* tokens.
 */
export function SoftFields() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div
        className="orb-1"
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-20%',
          width: '75%',
          aspectRatio: '1',
          borderRadius: '50%',
          background: 'var(--vuka-orb-1)',
          opacity: 'var(--vuka-orb-1-op)',
          filter: 'blur(90px)',
        }}
      />
      <div
        className="orb-2"
        style={{
          position: 'absolute',
          top: '20%',
          right: '-25%',
          width: '80%',
          aspectRatio: '1',
          borderRadius: '50%',
          background: 'var(--vuka-orb-2)',
          opacity: 'var(--vuka-orb-2-op)',
          filter: 'blur(90px)',
        }}
      />
      <div
        className="orb-3"
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '10%',
          width: '70%',
          aspectRatio: '1',
          borderRadius: '50%',
          background: 'var(--vuka-orb-3)',
          opacity: 'var(--vuka-orb-3-op)',
          filter: 'blur(90px)',
        }}
      />
    </div>
  )
}

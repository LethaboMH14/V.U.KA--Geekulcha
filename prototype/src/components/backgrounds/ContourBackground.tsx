/**
 * Night Contour background art.
 * Topographic contour lines in slate blue (#5B7BA6) at ~50%, 1px, with 2–3 denser
 * "summit" clusters, a soft teal glow behind the active hero card, and a faint
 * indigo glow in the opposite corner — from the art direction.
 *
 * On Record / Verify screens, a faint linked-node chain motif (the hash chain)
 * runs down one edge.
 */
const CONTOURS = [
  // Upper region — broad sweeping contours
  'M-10,55  Q60,38  140,52  T300,46  T390,50',
  'M-10,88  Q50,72  130,85  T295,78  T390,82',
  'M-10,118 Q70,102 150,116 T310,109 T390,113',
  'M-10,152 Q65,136 145,150 T305,143 T390,147',
  'M20,182  Q90,165  170,180 T330,172 T390,178',
  'M30,218  Q100,200 180,215 T350,207',
  // Mid region — denser
  'M-10,255 Q55,238 135,252 T300,244 T390,249',
  'M-10,285 Q60,268 140,282 T305,274 T390,279',
  'M10,315  Q80,297 160,312 T325,304',
  'M60,340  Q130,324 200,338 T330,330',
  'M80,360  Q148,344 220,358 T340,350',
  // Lower-mid — opens out again
  'M-10,395 Q58,378 138,392 T302,385 T390,389',
  'M-10,425 Q55,408 135,422 T300,415 T390,419',
  'M0,455   Q68,438 148,452 T308,445 T390,449',
  // Low region — broad, widely spaced
  'M-10,500 Q60,483 140,497 T305,490 T390,494',
  'M-10,558 Q55,541 135,555 T300,548 T390,552',
  'M-10,592 Q58,575 138,589 T302,582 T390,586',
  // Bottom region
  'M-10,635 Q62,618 142,632 T308,625 T390,629',
  'M-10,668 Q58,651 138,665 T302,658 T390,662',
  'M-10,702 Q55,685 135,699 T300,692 T390,696',
  'M-10,738 Q62,721 142,735 T308,728 T390,732',
]

export function ContourBackground({ showChain = false }: { showChain?: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 360 780"
        width="360"
        height="780"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          {/* Teal glow — sits behind the active hero card, upper-centre */}
          <radialGradient id="tealGlow" cx="54%" cy="30%" r="46%">
            <stop offset="0%"   stopColor="var(--vuka-glow-teal)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--vuka-glow-teal)" stopOpacity="0" />
          </radialGradient>
          {/* Indigo glow — faint, opposite (lower-left) corner */}
          <radialGradient id="indigoGlow" cx="14%" cy="88%" r="42%">
            <stop offset="0%"   stopColor="var(--vuka-glow-indigo)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--vuka-glow-indigo)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <defs>
          {/* Edge fade — contours are strongest in the centre, dissolve to the edges */}
          <radialGradient id="edgeFade" cx="50%" cy="46%" r="62%">
            <stop offset="0%"   stopColor="#fff" stopOpacity="1" />
            <stop offset="62%"  stopColor="#fff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="contourMask">
            <rect width="360" height="780" fill="url(#edgeFade)" />
          </mask>
        </defs>

        {/* Ambient glows */}
        <rect width="360" height="780" fill="url(#tealGlow)" />
        <rect width="360" height="780" fill="url(#indigoGlow)" />

        {/* Topographic contour lines — 0.6px, every 5th 1.2px, faded to the edges */}
        <g fill="none" stroke="var(--vuka-art-stroke)" strokeLinecap="round" mask="url(#contourMask)">
          {CONTOURS.map((d, i) => (
            <path key={i} d={d} strokeWidth={(i + 1) % 5 === 0 ? 1.2 : 0.6} />
          ))}
        </g>

        {/* Denser "summit" clusters — tight concentric rings, 3 places */}
        <g fill="none" stroke="var(--vuka-art-stroke-dense)" strokeWidth="1" strokeLinecap="round" mask="url(#contourMask)">
          {/* Summit 1 — upper right */}
          <ellipse cx="248" cy="150" rx="52" ry="16" />
          <ellipse cx="248" cy="150" rx="38" ry="11" />
          <ellipse cx="248" cy="150" rx="24" ry="7" />
          <ellipse cx="248" cy="150" rx="11" ry="3.5" />
          {/* Summit 2 — mid left */}
          <ellipse cx="86" cy="330" rx="58" ry="17" />
          <ellipse cx="86" cy="330" rx="42" ry="12" />
          <ellipse cx="86" cy="330" rx="26" ry="7.5" />
          <ellipse cx="86" cy="330" rx="12" ry="4" />
          {/* Summit 3 — lower centre-right */}
          <ellipse cx="220" cy="540" rx="60" ry="18" />
          <ellipse cx="220" cy="540" rx="44" ry="13" />
          <ellipse cx="220" cy="540" rx="28" ry="8" />
          <ellipse cx="220" cy="540" rx="13" ry="4" />
        </g>

        {/* Hash-chain node motif — Record / Verify screens, running down the right edge */}
        {showChain && (
          <g opacity="0.85">
            {[
              [326, 120], [312, 210], [330, 300], [316, 392],
              [328, 486], [314, 578], [330, 668],
            ].map(([x, y], i, arr) => (
              <g key={i}>
                {i < arr.length - 1 && (
                  <line
                    x1={x} y1={y}
                    x2={arr[i + 1][0]} y2={arr[i + 1][1]}
                    stroke="var(--vuka-art-stroke)"
                    strokeWidth="1"
                  />
                )}
                <circle cx={x} cy={y} r="4" fill="none" stroke="var(--vuka-art-stroke-dense)" strokeWidth="1" />
                <circle cx={x} cy={y} r="1.5" fill="var(--vuka-art-stroke-dense)" />
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  )
}

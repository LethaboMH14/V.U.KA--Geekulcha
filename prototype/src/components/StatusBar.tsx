import { useState, useEffect } from 'react'
import { WifiHigh, BatteryFull } from '@phosphor-icons/react'

/** Android-style status bar — time, signal, WiFi, battery */
export function StatusBar() {
  const [time, setTime] = useState(formatTime())

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 15_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      style={{
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Time */}
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          color: 'var(--vuka-text-title)',
          letterSpacing: '0.01em',
        }}
      >
        {time}
      </span>

      {/* Punch-hole camera placeholder */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.8)',
        }}
      />

      {/* System icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Signal bars */}
        <SignalBars />
        <WifiHigh size={14} color="var(--vuka-text-title)" weight="fill" />
        <BatteryFull size={16} color="var(--vuka-text-title)" weight="fill" />
      </div>
    </div>
  )
}

function SignalBars() {
  const bars = [3, 5, 7, 9]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 12 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: h,
            borderRadius: 1,
            background: 'var(--vuka-text-title)',
          }}
        />
      ))}
    </div>
  )
}

function formatTime() {
  const now = new Date()
  return now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })
}

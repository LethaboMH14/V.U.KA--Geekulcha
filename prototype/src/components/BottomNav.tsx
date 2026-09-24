import { useLocation, useNavigate } from 'react-router-dom'
import { ShieldChevron, Lock } from '@phosphor-icons/react'

const tabs = [
  { path: '/',        label: 'VIGIL',  Icon: ShieldChevron },
  { path: '/anchor',  label: 'ANCHOR', Icon: Lock },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const active = location.pathname === '/anchor' ? '/anchor' : '/'

  return (
    <div style={{ padding: 16, flexShrink: 0, position: 'relative', zIndex: 10 }}>
      <nav
        className="glass-pill"
        style={{
          height: 64,
          display: 'flex',
          padding: 6,
          gap: 6,
        }}
      >
        {tabs.map(({ path, label, Icon }) => {
          const isActive = active === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                color: isActive ? 'var(--vuka-action-text)' : 'var(--vuka-text-secondary)',
                background: isActive ? 'linear-gradient(to bottom, #2A4A73, #1A3354)' : 'transparent',
                boxShadow: isActive ? '0 6px 14px -6px rgba(30,58,95,0.5)' : 'none',
                transition: 'color var(--vuka-ease), background var(--vuka-ease)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

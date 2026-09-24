import { NavLink } from 'react-router-dom'

const items: { to: string; label: string }[] = [
  { to: '/', label: 'VIGIL prototype' },
  { to: '/verify', label: 'Verify' },
  { to: '/panel', label: 'Panel' },
  { to: '/stage', label: 'Stage' },
]

/**
 * Small web nav — lives outside the phone frame entirely, on the three
 * desktop pages only. Native links: keyboard accessible by default, with a
 * visible active state (background fill, not colour alone).
 */
export function WebNav() {
  return (
    <nav aria-label="VUKA prototype navigation" style={{ borderBottom: '1px solid var(--vuka-border)' }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 28,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--vuka-text-title)',
          }}
        >
          VUKA
        </span>
        <ul style={{ display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end
                style={({ isActive }) => ({
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 44,
                  padding: '0 14px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? 'var(--vuka-action-text)' : 'var(--vuka-text-secondary)',
                  background: isActive ? 'var(--vuka-action)' : 'transparent',
                  transition: 'background var(--vuka-ease), color var(--vuka-ease)',
                })}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

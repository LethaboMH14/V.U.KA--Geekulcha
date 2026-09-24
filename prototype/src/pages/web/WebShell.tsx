import { useEffect, type ReactNode } from 'react'
import { useDemo, type VukaTheme } from '@/contexts/DemoContext'
import { DemoPanel } from '@/components/DemoPanel'
import { WebNav } from './WebNav'

interface WebShellProps {
  children: ReactNode
  /**
   * Each web page has its own default landing theme (from spec). The shared
   * Theme control in DemoPanel still overrides it from there — same
   * DemoContext the phone uses, so flipping it here flips the phone too.
   */
  defaultTheme?: VukaTheme
  maxWidth?: number
}

/**
 * Shared desktop-web chrome for Slice D: skip link, small nav, a max-width
 * main column and the same off-canvas DemoPanel used beside the phone.
 * No phone frame here — these are full desktop pages.
 */
export function WebShell({ children, defaultTheme, maxWidth = 1280 }: WebShellProps) {
  const { theme, setTheme } = useDemo()

  useEffect(() => {
    if (defaultTheme) setTheme(defaultTheme)
    // Only on first landing — the shared Theme toggle takes over after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      data-theme={theme === 'ivory' ? undefined : theme}
      style={{ minHeight: '100vh', background: 'var(--vuka-bg-base)' }}
    >
      <style>{`
        .vuka-skip-link {
          position: absolute;
          left: -9999px;
          top: 0;
          z-index: 1000;
          background: var(--vuka-action);
          color: var(--vuka-action-text);
          padding: 10px 16px;
          border-radius: 0 0 10px 0;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
        }
        .vuka-skip-link:focus-visible,
        .vuka-skip-link:focus {
          left: 0;
        }
      `}</style>
      <a href="#vuka-web-main" className="vuka-skip-link">
        Skip to main content
      </a>
      <WebNav />
      <div
        style={{
          maxWidth,
          margin: '0 auto',
          padding: '32px 32px 64px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 28,
        }}
      >
        <main id="vuka-web-main" style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
        <DemoPanel />
      </div>
    </div>
  )
}

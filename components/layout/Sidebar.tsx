'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/journal', icon: '📝', label: 'Journal' },
  { href: '/calendrier', icon: '📅', label: 'Calendrier P&L' },
  { href: '/calendrier-eco', icon: '🗓️', label: 'Calendrier Éco.' },
  { href: '/marches', icon: '📈', label: 'Marchés' },
  { href: '/analyse', icon: '🤖', label: 'Analyse IA' },
  { href: '/rapport', icon: '📄', label: 'Rapport' },
  { href: '/settings', icon: '⚙️', label: 'Paramètres' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{
      width: '220px',
      minHeight: '100vh',
      background: '#0e1117',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px', fontFamily: 'sans-serif' }}>
          Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
        </div>
        <div style={{ fontSize: '11px', color: '#404760', marginTop: '2px', fontFamily: 'sans-serif' }}>
          Coach Trading IA
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 20px',
                color: isActive ? '#00e5b0' : '#7a8299',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: isActive ? '500' : '400',
                fontFamily: 'sans-serif',
                background: isActive ? 'rgba(0,229,176,0.06)' : 'transparent',
                borderLeft: isActive ? '3px solid #00e5b0' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Déconnexion */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#7a8299',
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          🚪 Se déconnecter
        </button>
      </div>
    </div>
  )
}
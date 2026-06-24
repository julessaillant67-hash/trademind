'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/journal', icon: '📝', label: 'Journal' },
  { href: '/calendrier', icon: '📅', label: 'Calendrier' },
  { href: '/marches', icon: '📈', label: 'Marchés' },
  { href: '/analyse', icon: '🤖', label: 'Analyse IA' },
  { href: '/settings', icon: '⚙️', label: 'Paramètres' },
]

const NOTIFICATIONS = [
  { id: 1, icon: '⚠️', title: 'PIB américain dans 2h', desc: 'Impact fort prévu — 13:30 USD', color: '#f59e0b', time: 'Il y a 5min' },
  { id: 2, icon: '🧠', title: 'Score psychologique en baisse', desc: 'Tu as perdu 3 trades consécutifs', color: '#f05252', time: 'Il y a 1h' },
  { id: 3, icon: '📈', title: 'XAU/USD — Biais haussier', desc: 'Scanner IA détecte contexte favorable', color: '#22d3a0', time: 'Il y a 2h' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [showNotifs, setShowNotifs] = useState(false)
  const [unread, setUnread] = useState(3)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name, plan').eq('id', user.id).single()
        if (data) setProfile(data)
      }
    }
    loadProfile()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <div style={{
        width: '220px', background: '#0a0c10',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 100, padding: '20px 12px'
      }}>

        {/* LOGO + NOTIF */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', padding: '0 8px' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px' }}>
            Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
          </div>
          <button
            onClick={() => { setShowNotifs(!showNotifs); setUnread(0) }}
            style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <span style={{ fontSize: '18px' }}>🔔</span>
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: '0', right: '0',
                background: '#f05252', color: '#fff',
                borderRadius: '50%', width: '16px', height: '16px',
                fontSize: '10px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {unread}
              </span>
            )}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav style={{ flex: 1 }}>
          {navItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
                textDecoration: 'none',
                background: isActive ? 'rgba(0,229,176,0.1)' : 'transparent',
                color: isActive ? '#00e5b0' : '#7a8299',
                fontSize: '14px', fontWeight: isActive ? '600' : '400',
                transition: 'all 0.15s'
              }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* PROFIL + PLAN */}
        {profile && (
          <div style={{ background: '#141920', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#dfe3ed', marginBottom: '2px' }}>
              {profile.full_name || 'Mon compte'}
            </div>
            <div style={{ fontSize: '11px', color: profile.plan === 'pro' ? '#3b82f6' : profile.plan === 'elite' ? '#f59e0b' : profile.plan === 'starter' ? '#00e5b0' : '#7a8299', textTransform: 'capitalize', fontWeight: '600' }}>
              Plan {profile.plan || 'Free'}
            </div>
          </div>
        )}

        <button onClick={handleLogout} style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px', padding: '10px', color: '#7a8299',
          fontSize: '13px', cursor: 'pointer', width: '100%'
        }}>
          Se déconnecter
        </button>
      </div>

      {/* PANNEAU NOTIFICATIONS */}
      {showNotifs && (
        <div style={{
          position: 'fixed', top: '0', left: '220px', width: '320px',
          background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)',
          borderLeft: 'none', bottom: '0', zIndex: 99, padding: '20px',
          boxShadow: '4px 0 20px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#dfe3ed', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Notifications
            <button onClick={() => setShowNotifs(false)} style={{ background: 'transparent', border: 'none', color: '#7a8299', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {NOTIFICATIONS.map(notif => (
              <div key={notif.id} style={{ background: '#141920', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '18px' }}>{notif.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: notif.color, marginBottom: '3px' }}>{notif.title}</div>
                    <div style={{ fontSize: '12px', color: '#7a8299', lineHeight: '1.5' }}>{notif.desc}</div>
                    <div style={{ fontSize: '11px', color: '#404760', marginTop: '6px' }}>{notif.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OVERLAY */}
      {showNotifs && (
        <div onClick={() => setShowNotifs(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
      )}
    </>
  )
}
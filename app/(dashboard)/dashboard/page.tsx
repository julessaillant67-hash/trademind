'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalPnl: 0, weekPnl: 0, winRate: 0, tradeCount: 0, psychScore: 0 })
  const [recentTrades, setRecentTrades] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [nextEvent, setNextEvent] = useState<any>(null)
  const [scannerIA, setScannerIA] = useState<any>(null)
  const [loadingScanner, setLoadingScanner] = useState(false)
  const [hour] = useState(new Date().getHours())

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: trades }, { data: prof }] = await Promise.all([
      supabase.from('trades').select('*').order('opened_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('id', user.id).single()
    ])

    if (prof) setProfile(prof)

    if (trades && trades.length > 0) {
      const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
      const winningTrades = trades.filter(t => t.pnl > 0).length
      const winRate = Math.round((winningTrades / trades.length) * 100)
      const psychScore = winRate > 70 ? 82 : winRate > 50 ? 65 : 45
      const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const weekPnl = trades.filter(t => new Date(t.opened_at) >= oneWeekAgo).reduce((sum, t) => sum + (t.pnl || 0), 0)
      setStats({ totalPnl, weekPnl, winRate, tradeCount: trades.length, psychScore })
      setRecentTrades(trades.slice(0, 3))
    }

    // Prochain événement macro
    const events = [
      { time: '13:30', currency: 'USD', impact: 3, event: 'PIB américain', forecast: '2.3%' },
      { time: '20:00', currency: 'USD', impact: 3, event: 'Discours FED', forecast: '—' },
      { time: '09:00', currency: 'EUR', impact: 3, event: 'IPC Zone Euro', forecast: '2.3%' },
    ]
    const now = new Date()
    const upcoming = events.find(e => {
      const [h, m] = e.time.split(':').map(Number)
      return h * 60 + m > now.getHours() * 60 + now.getMinutes()
    })
    setNextEvent(upcoming || events[0])
  }

  async function loadScanner() {
    setLoadingScanner(true)
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      const news = data.news || []
      
      const res2 = await fetch('/api/ai/scanner', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ news: news.slice(0, 3) })
      })
      const scanner = await res2.json()
      setScannerIA(scanner)
    } catch { setScannerIA(null) }
    setLoadingScanner(false)
  }

  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const firstName = profile?.full_name?.split(' ')[0] || 'trader'

  const cardStyle = { background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* HEADER PERSONNALISE */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
              {greeting}, <span style={{ color: '#00e5b0' }}>{firstName}</span> 👋
            </div>
            <div style={{ fontSize: '14px', color: '#7a8299' }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} — Voici ton résumé du jour
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {nextEvent && (
              <div style={{ background: 'rgba(240,82,82,0.1)', border: '1px solid rgba(240,82,82,0.2)', borderRadius: '10px', padding: '10px 16px', fontSize: '13px' }}>
                <span style={{ color: '#f87171', fontWeight: '600' }}>⚠️ Prochain événement</span>
                <div style={{ color: '#dfe3ed', marginTop: '2px' }}>{nextEvent.event} à {nextEvent.time}</div>
              </div>
            )}
          </div>
        </div>

        {/* STATS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'SCORE PSYCHO', value: stats.tradeCount > 0 ? `${stats.psychScore}/100` : '--/100', color: stats.psychScore >= 70 ? '#22d3a0' : stats.psychScore >= 50 ? '#f59e0b' : '#f05252', big: true },
            { label: 'P&L SEMAINE', value: `${stats.weekPnl > 0 ? '+' : ''}${stats.weekPnl.toFixed(0)}€`, color: stats.weekPnl >= 0 ? '#22d3a0' : '#f05252' },
            { label: 'P&L TOTAL', value: `${stats.totalPnl > 0 ? '+' : ''}${stats.totalPnl.toFixed(0)}€`, color: stats.totalPnl >= 0 ? '#22d3a0' : '#f05252' },
            { label: 'WIN RATE', value: `${stats.winRate}%`, color: stats.winRate >= 50 ? '#22d3a0' : '#f05252' },
            { label: 'TRADES', value: String(stats.tradeCount), color: '#dfe3ed' },
          ].map(s => (
            <div key={s.label} style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: s.big ? '28px' : '22px', fontWeight: '700', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* CONSEIL IA PERSONNALISE */}
          <div style={{ ...cardStyle, background: 'rgba(0,229,176,0.06)', border: '1px solid rgba(0,229,176,0.2)' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#00e5b0', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
              🤖 Conseil IA du jour
            </div>
            <div style={{ fontSize: '14px', color: '#dfe3ed', lineHeight: '1.7' }}>
              {stats.tradeCount === 0 
                ? "Commence par ajouter tes premiers trades dans le journal pour recevoir des conseils personnalisés basés sur tes données réelles."
                : stats.winRate >= 70 
                ? `Excellent win rate de ${stats.winRate}%. Ta discipline paie. Continue à respecter ton plan et augmente progressivement la taille de tes positions sur tes meilleurs setups.`
                : stats.winRate >= 50
                ? `Win rate de ${stats.winRate}% — solide mais perfectible. Concentre-toi sur la qualité de tes entrées et évite de trader dans les 30 minutes suivant une perte.`
                : `Win rate de ${stats.winRate}% — travaille en priorité le respect de ton plan de trading. Lance l'analyse IA pour identifier tes biais récurrents.`
              }
            </div>
            <a href="/analyse" style={{ display: 'inline-block', marginTop: '14px', background: '#00e5b0', borderRadius: '8px', padding: '8px 18px', color: '#000', fontWeight: '600', fontSize: '13px', textDecoration: 'none' }}>
              Lancer l'analyse IA →
            </a>
          </div>

          {/* SCANNER IA */}
          <div style={cardStyle}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
              🎯 Scanner IA — Biais du marché
            </div>
            {!scannerIA && !loadingScanner && (
              <div>
                <div style={{ fontSize: '13px', color: '#7a8299', marginBottom: '14px', lineHeight: '1.6' }}>
                  Analyse le contexte macro actuel et obtiens un biais directionnel pour tes actifs principaux.
                </div>
                <button onClick={loadScanner} style={{ background: 'rgba(0,229,176,0.1)', border: '1px solid rgba(0,229,176,0.2)', borderRadius: '8px', padding: '10px 20px', color: '#00e5b0', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                  🔍 Analyser le marché maintenant
                </button>
              </div>
            )}
            {loadingScanner && (
              <div style={{ fontSize: '13px', color: '#7a8299', padding: '20px 0' }}>
                🤖 L'IA analyse le contexte macro...
              </div>
            )}
            {scannerIA && (
              <div>
                <div style={{ fontSize: '13px', color: '#dfe3ed', lineHeight: '1.7', marginBottom: '12px' }}>{scannerIA.resume}</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(scannerIA.biais || []).map((b: any, i: number) => (
                    <div key={i} style={{ background: b.direction === 'haussier' ? 'rgba(34,211,160,0.1)' : b.direction === 'baissier' ? 'rgba(240,82,82,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${b.direction === 'haussier' ? 'rgba(34,211,160,0.3)' : b.direction === 'baissier' ? 'rgba(240,82,82,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '6px', padding: '4px 10px', fontSize: '12px' }}>
                      <span style={{ fontWeight: '600', color: '#dfe3ed' }}>{b.actif}</span>
                      <span style={{ color: b.direction === 'haussier' ? '#22d3a0' : b.direction === 'baissier' ? '#f05252' : '#7a8299', marginLeft: '6px' }}>
                        {b.direction === 'haussier' ? '↑' : b.direction === 'baissier' ? '↓' : '→'} {b.direction}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DERNIERS TRADES + ACTIONS RAPIDES */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>
              Derniers trades
            </div>
            {recentTrades.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#7a8299', padding: '20px 0', fontSize: '13px' }}>
                Aucun trade — <a href="/journal" style={{ color: '#00e5b0', textDecoration: 'none' }}>ajouter mon premier trade →</a>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Actif', 'Direction', 'P&L', 'Date'].map(h => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#7a8299', fontWeight: '500' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map(trade => (
                    <tr key={trade.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px', fontWeight: '500' }}>{trade.asset}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ background: trade.direction === 'LONG' ? 'rgba(34,211,160,0.15)' : 'rgba(240,82,82,0.15)', color: trade.direction === 'LONG' ? '#22d3a0' : '#f05252', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                          {trade.direction}
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontWeight: '600', color: trade.pnl > 0 ? '#22d3a0' : trade.pnl < 0 ? '#f05252' : '#dfe3ed' }}>
                        {trade.pnl ? `${trade.pnl > 0 ? '+' : ''}${trade.pnl}€` : '—'}
                      </td>
                      <td style={{ padding: '10px', color: '#7a8299' }}>{new Date(trade.opened_at).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <a href="/journal" style={{ display: 'inline-block', marginTop: '14px', fontSize: '13px', color: '#00e5b0', textDecoration: 'none' }}>
              Voir tous les trades →
            </a>
          </div>

          {/* ACTIONS RAPIDES */}
          <div style={cardStyle}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>
              Actions rapides
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: '/journal', icon: '📝', label: 'Ajouter un trade', desc: 'Enregistre ton dernier trade' },
                { href: '/analyse', icon: '🤖', label: 'Lancer l\'analyse IA', desc: 'Détecte tes biais psychologiques' },
                { href: '/calendrier', icon: '📅', label: 'Calendrier éco.', desc: 'Voir les événements du jour' },
                { href: '/marches', icon: '📈', label: 'Voir les marchés', desc: 'Graphiques TradingView' },
              ].map(action => (
                <a key={action.href} href={action.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#141920', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px', textDecoration: 'none', transition: 'border-color 0.15s' }}>
                  <span style={{ fontSize: '20px' }}>{action.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#dfe3ed' }}>{action.label}</div>
                    <div style={{ fontSize: '11px', color: '#7a8299', marginTop: '2px' }}>{action.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
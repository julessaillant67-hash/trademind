'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const IMPACT_COLORS: Record<number, string> = { 1: '#22d3a0', 2: '#f59e0b', 3: '#f05252' }
const IMPACT_LABELS: Record<number, string> = { 1: 'Faible', 2: 'Moyen', 3: 'Fort' }
const MARKET_COLORS: Record<string, string> = { haussier: '#22d3a0', baissier: '#f05252', neutre: '#7a8299' }

const EVENTS_STATIC = [
  { time: '08:00', currency: 'EUR', impact: 2, event: 'IFO Climat des affaires Allemagne', forecast: '86.0', previous: '85.1' },
  { time: '10:00', currency: 'EUR', impact: 2, event: 'Indice de confiance consommateurs UE', forecast: '-14.0', previous: '-15.3' },
  { time: '13:30', currency: 'USD', impact: 3, event: 'PIB américain (annualisé)', forecast: '2.3%', previous: '2.4%' },
  { time: '13:30', currency: 'USD', impact: 3, event: 'Inscriptions chômage hebdomadaires', forecast: '225K', previous: '220K' },
  { time: '15:00', currency: 'USD', impact: 2, event: 'Ventes de logements en attente', forecast: '0.5%', previous: '-3.4%' },
  { time: '20:00', currency: 'USD', impact: 3, event: 'Discours membre FED', forecast: '—', previous: '—' },
  { time: '09:00', currency: 'EUR', impact: 3, event: 'IPC Zone Euro (annuel)', forecast: '2.3%', previous: '2.2%' },
  { time: '13:30', currency: 'USD', impact: 3, event: 'PCE Core (mensuel)', forecast: '0.2%', previous: '0.2%' },
  { time: '15:00', currency: 'USD', impact: 2, event: 'Indice de confiance Michigan', forecast: '68.5', previous: '69.1' },
]

export default function CalendrierPage() {
  const [tab, setTab] = useState<'pnl' | 'eco' | 'news'>('pnl')
  const [trades, setTrades] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])
  const [loadingNews, setLoadingNews] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filter, setFilter] = useState('ALL')
  const [impactFilter, setImpactFilter] = useState(0)

  const currencies = ['ALL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD']

  useEffect(() => { loadTrades() }, [])
  useEffect(() => { if (tab === 'news' && news.length === 0) loadNews() }, [tab])

  async function loadTrades() {
    const supabase = createClient()
    const { data } = await supabase.from('trades').select('*').order('opened_at', { ascending: false })
    if (data) setTrades(data)
  }

  async function loadNews() {
    setLoadingNews(true)
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      setNews(data.news || [])
    } catch { setNews([]) }
    setLoadingNews(false)
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = (firstDay.getDay() + 6) % 7

  const pnlByDay: Record<string, number> = {}
  trades.forEach(t => {
    if (!t.pnl) return
    const d = new Date(t.opened_at)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate().toString()
      pnlByDay[key] = (pnlByDay[key] || 0) + t.pnl
    }
  })

  const monthPnl = Object.values(pnlByDay).reduce((sum, v) => sum + v, 0)
  const gainDays = Object.values(pnlByDay).filter(v => v > 0).length
  const lossDays = Object.values(pnlByDay).filter(v => v < 0).length

  const days = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i)

  const filteredEvents = EVENTS_STATIC.filter(e => {
    if (filter !== 'ALL' && e.currency !== filter) return false
    if (impactFilter > 0 && e.impact < impactFilter) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px' }}>
            Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
          </div>
          <div style={{ color: '#7a8299', marginTop: '4px' }}>Calendrier</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[
            { id: 'pnl', icon: '📅', label: 'P&L Journalier' },
            { id: 'eco', icon: '🗓️', label: 'Économique' },
            { id: 'news', icon: '📰', label: 'Actualités IA' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', background: tab === t.id ? '#00e5b0' : '#0e1117', color: tab === t.id ? '#000' : '#7a8299', border: `1px solid ${tab === t.id ? '#00e5b0' : 'rgba(255,255,255,0.08)'}` }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* TAB P&L */}
        {tab === 'pnl' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'P&L DU MOIS', value: `${monthPnl > 0 ? '+' : ''}${monthPnl.toFixed(2)}€`, color: monthPnl >= 0 ? '#22d3a0' : '#f05252' },
                { label: 'JOURS GAGNANTS', value: String(gainDays), color: '#22d3a0' },
                { label: 'JOURS PERDANTS', value: String(lossDays), color: '#f05252' },
              ].map(s => (
                <div key={s.label} style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>{s.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{ background: '#141920', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 16px', color: '#dfe3ed', cursor: 'pointer', fontSize: '16px' }}>←</button>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{monthNames[month]} {year}</div>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{ background: '#141920', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 16px', color: '#dfe3ed', cursor: 'pointer', fontSize: '16px' }}>→</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px' }}>
                {dayNames.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#7a8299', padding: '8px 0' }}>{d}</div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {days.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />
                  const pnl = pnlByDay[day.toString()]
                  const hasData = pnl !== undefined
                  const isGain = hasData && pnl > 0
                  const isLoss = hasData && pnl < 0
                  const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
                  return (
                    <div key={day} style={{ background: isGain ? 'rgba(34,211,160,0.15)' : isLoss ? 'rgba(240,82,82,0.15)' : '#141920', border: `1px solid ${isGain ? 'rgba(34,211,160,0.3)' : isLoss ? 'rgba(240,82,82,0.3)' : isToday ? '#00e5b0' : 'rgba(255,255,255,0.06)'}`, borderRadius: '8px', padding: '10px 6px', textAlign: 'center', minHeight: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: isToday ? '700' : '400', color: isToday ? '#00e5b0' : '#7a8299' }}>{day}</div>
                      {hasData && <div style={{ fontSize: '11px', fontWeight: '700', color: isGain ? '#22d3a0' : '#f05252' }}>{isGain ? '+' : ''}{pnl.toFixed(0)}€</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* TAB ECO */}
        {tab === 'eco' && (
          <>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {currencies.map(c => (
                  <button key={c} onClick={() => setFilter(c)} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', background: filter === c ? '#00e5b0' : '#0e1117', color: filter === c ? '#000' : '#7a8299', border: `1px solid ${filter === c ? '#00e5b0' : 'rgba(255,255,255,0.08)'}`, fontWeight: filter === c ? '600' : '400' }}>{c}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0, 1, 2, 3].map(i => (
                  <button key={i} onClick={() => setImpactFilter(i)} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', background: impactFilter === i ? (i === 0 ? '#00e5b0' : IMPACT_COLORS[i]) : '#0e1117', color: impactFilter === i ? '#000' : '#7a8299', border: `1px solid ${impactFilter === i ? (i === 0 ? '#00e5b0' : IMPACT_COLORS[i]) : 'rgba(255,255,255,0.08)'}`, fontWeight: impactFilter === i ? '600' : '400' }}>
                    {i === 0 ? 'Tous' : '★'.repeat(i)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>📅 {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span style={{ fontSize: '12px', color: '#7a8299', marginLeft: '8px' }}>— {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Heure', 'Devise', 'Impact', 'Événement', 'Prévision', 'Précédent'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#7a8299', fontWeight: '500', fontSize: '12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#00e5b0', fontWeight: '600' }}>{event.time}</td>
                      <td style={{ padding: '12px 16px' }}><span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', fontWeight: '600' }}>{event.currency}</span></td>
                      <td style={{ padding: '12px 16px' }}><span style={{ color: IMPACT_COLORS[event.impact], fontSize: '12px', fontWeight: '600' }}>{'★'.repeat(event.impact)} {IMPACT_LABELS[event.impact]}</span></td>
                      <td style={{ padding: '12px 16px', fontWeight: event.impact === 3 ? '600' : '400', color: event.impact === 3 ? '#dfe3ed' : '#a0a8c0' }}>
                        {event.impact === 3 && '🔴 '}{event.impact === 2 && '🟡 '}{event.impact === 1 && '🟢 '}{event.event}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#7a8299' }}>{event.forecast}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#7a8299' }}>{event.previous}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB NEWS */}
        {tab === 'news' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loadingNews ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#7a8299' }}>🤖 L'IA analyse les actualités...</div>
            ) : news.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#7a8299' }}>Aucune actualité disponible.</div>
            ) : (
              news.map((item, i) => (
                <div key={i} style={{ background: '#0e1117', border: `1px solid ${item.score === 3 ? 'rgba(240,82,82,0.3)' : item.score === 2 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: IMPACT_COLORS[item.score], fontSize: '13px', fontWeight: '700' }}>{'★'.repeat(item.score)}</span>
                    <span style={{ fontSize: '11px', color: '#7a8299' }}>{item.time}</span>
                    <span style={{ fontSize: '11px', color: '#404760', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: '4px' }}>{item.source}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#dfe3ed', marginBottom: '8px' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: '#7a8299', lineHeight: '1.6', marginBottom: '12px' }}>{item.summary}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {Object.entries(item.impact || {}).map(([market, direction]: any) => (
                      <div key={market} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#7a8299', textTransform: 'uppercase', fontWeight: '600' }}>{market}</span>
                        <span style={{ color: MARKET_COLORS[direction] || '#7a8299', fontWeight: '700' }}>{direction === 'haussier' ? '↑' : direction === 'baissier' ? '↓' : '→'} {direction}</span>
                      </div>
                    ))}
                  </div>
                  {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#00e5b0', textDecoration: 'none' }}>Lire l'article →</a>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
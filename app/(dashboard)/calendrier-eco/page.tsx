'use client'

import { useState, useEffect } from 'react'

const IMPACT_COLORS: Record<number, string> = { 1: '#22d3a0', 2: '#f59e0b', 3: '#f05252' }
const IMPACT_LABELS: Record<number, string> = { 1: 'Faible', 2: 'Moyen', 3: 'Fort' }
const MARKET_COLORS: Record<string, string> = { haussier: '#22d3a0', baissier: '#f05252', neutre: '#7a8299' }

export default function CalendrierEcoPage() {
  const [tab, setTab] = useState<'eco' | 'news'>('eco')
  const [events, setEvents] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])
  const [loadingEco, setLoadingEco] = useState(true)
  const [loadingNews, setLoadingNews] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const [impactFilter, setImpactFilter] = useState(0)

  const currencies = ['ALL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD']

  useEffect(() => {
    loadEco()
  }, [])

  useEffect(() => {
    if (tab === 'news' && news.length === 0) loadNews()
  }, [tab])

  async function loadEco() {
    setLoadingEco(true)
    try {
      const res = await fetch('/api/calendrier-eco')
      const data = await res.json()
      setEvents(data.events || [])
    } catch {
      setEvents([])
    }
    setLoadingEco(false)
  }

  async function loadNews() {
    setLoadingNews(true)
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      setNews(data.news || [])
    } catch {
      setNews([])
    }
    setLoadingNews(false)
  }

  const filtered = events.filter(e => {
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
          <div style={{ color: '#7a8299', marginTop: '4px' }}>Actualités & Calendrier économique</div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => setTab('eco')} style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', background: tab === 'eco' ? '#00e5b0' : '#0e1117', color: tab === 'eco' ? '#000' : '#7a8299', border: `1px solid ${tab === 'eco' ? '#00e5b0' : 'rgba(255,255,255,0.08)'}` }}>
            📅 Calendrier éco.
          </button>
          <button onClick={() => setTab('news')} style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', background: tab === 'news' ? '#00e5b0' : '#0e1117', color: tab === 'news' ? '#000' : '#7a8299', border: `1px solid ${tab === 'news' ? '#00e5b0' : 'rgba(255,255,255,0.08)'}` }}>
            📰 Actualités IA
          </button>
        </div>

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
                <span style={{ fontSize: '13px', fontWeight: '600' }}>
                  📅 {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span style={{ fontSize: '12px', color: '#7a8299', marginLeft: '8px' }}>— {filtered.length} événement{filtered.length > 1 ? 's' : ''}</span>
              </div>

              {loadingEco ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#7a8299' }}>Chargement du calendrier...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#7a8299' }}>Aucun événement pour ce filtre.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Heure', 'Devise', 'Impact', 'Événement', 'Prévision', 'Précédent', 'Réel'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#7a8299', fontWeight: '500', fontSize: '12px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((event, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#00e5b0', fontWeight: '600' }}>{event.time}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', fontWeight: '600' }}>{event.currency}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ color: IMPACT_COLORS[event.impact], fontSize: '12px', fontWeight: '600' }}>{'★'.repeat(event.impact)} {IMPACT_LABELS[event.impact]}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: event.impact === 3 ? '600' : '400', color: event.impact === 3 ? '#dfe3ed' : '#a0a8c0' }}>
                          {event.impact === 3 && '🔴 '}{event.impact === 2 && '🟡 '}{event.impact === 1 && '🟢 '}{event.event}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#7a8299' }}>{event.forecast}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#7a8299' }}>{event.previous}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '600', color: event.actual ? '#00e5b0' : '#404760' }}>{event.actual || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {tab === 'news' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loadingNews ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#7a8299' }}>
                🤖 L'IA analyse les actualités en cours...
              </div>
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
                        <span style={{ color: MARKET_COLORS[direction] || '#7a8299', fontWeight: '700' }}>
                          {direction === 'haussier' ? '↑' : direction === 'baissier' ? '↓' : '→'} {direction}
                        </span>
                      </div>
                    ))}
                  </div>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#00e5b0', textDecoration: 'none' }}>
                      Lire l'article →
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
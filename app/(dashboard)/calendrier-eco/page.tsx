'use client'

import { useState } from 'react'

const EVENTS_MOCK = [
  { time: '14:30', currency: 'USD', impact: 3, event: 'Non-Farm Payrolls (NFP)', forecast: '180K', previous: '175K' },
  { time: '14:30', currency: 'USD', impact: 3, event: 'Taux de chômage', forecast: '3.9%', previous: '3.9%' },
  { time: '16:00', currency: 'USD', impact: 2, event: 'ISM Services PMI', forecast: '52.5', previous: '51.4' },
  { time: '08:00', currency: 'EUR', impact: 3, event: 'CPI Allemagne (annuel)', forecast: '2.3%', previous: '2.2%' },
  { time: '10:00', currency: 'EUR', impact: 2, event: 'Ventes au détail Zone Euro', forecast: '0.3%', previous: '-0.1%' },
  { time: '13:00', currency: 'GBP', impact: 2, event: 'Décision taux BOE', forecast: '5.25%', previous: '5.25%' },
  { time: '15:30', currency: 'CAD', impact: 1, event: 'PIB mensuel', forecast: '0.2%', previous: '0.1%' },
  { time: '20:00', currency: 'USD', impact: 3, event: 'FOMC Minutes', forecast: '—', previous: '—' },
]

const NEWS_MOCK = [
  {
    time: 'Il y a 2h',
    title: 'Trump annonce des frappes militaires contre l\'Iran',
    summary: 'Les États-Unis ont frappé des infrastructures militaires iraniennes. Impact majeur sur les marchés pétroliers et refuge vers l\'or et le yen.',
    impact: { usd: 'haussier', xau: 'haussier', oil: 'haussier', eur: 'baissier' },
    score: 3,
    source: 'Reuters'
  },
  {
    time: 'Il y a 4h',
    title: 'FED : Powell maintient les taux inchangés',
    summary: 'La Réserve Fédérale maintient ses taux entre 5.25% et 5.50%. Ton hawkish confirmé pour les prochains mois.',
    impact: { usd: 'haussier', xau: 'baissier', btc: 'baissier', eur: 'baissier' },
    score: 3,
    source: 'Bloomberg'
  },
  {
    time: 'Il y a 6h',
    title: 'CPI américain supérieur aux attentes à 3.4%',
    summary: 'L\'inflation américaine ressort au-dessus des prévisions, réduisant les chances de baisse de taux en 2025.',
    impact: { usd: 'haussier', xau: 'neutre', btc: 'baissier' },
    score: 2,
    source: 'CNBC'
  },
  {
    time: 'Il y a 8h',
    title: 'BCE : Lagarde ouvre la porte à une baisse de taux en juin',
    summary: 'Christine Lagarde laisse entendre que la BCE pourrait réduire ses taux en juin si l\'inflation continue de baisser.',
    impact: { eur: 'baissier', gbp: 'neutre', usd: 'neutre' },
    score: 2,
    source: 'Financial Times'
  },
  {
    time: 'Il y a 12h',
    title: 'PIB UK légèrement en dessous des attentes',
    summary: 'Le PIB britannique ressort à 0.1% contre 0.2% attendu. Pression modérée sur la livre sterling.',
    impact: { gbp: 'baissier', eur: 'neutre' },
    score: 1,
    source: 'BBC'
  },
]

const IMPACT_COLORS: Record<number, string> = { 1: '#22d3a0', 2: '#f59e0b', 3: '#f05252' }
const IMPACT_LABELS: Record<number, string> = { 1: 'Faible', 2: 'Moyen', 3: 'Fort' }

const MARKET_COLORS: Record<string, string> = {
  haussier: '#22d3a0',
  baissier: '#f05252',
  neutre: '#7a8299'
}

export default function CalendrierEcoPage() {
  const [filter, setFilter] = useState('ALL')
  const [impactFilter, setImpactFilter] = useState(0)
  const [tab, setTab] = useState<'eco' | 'news'>('eco')

  const currencies = ['ALL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD']

  const filtered = EVENTS_MOCK.filter(e => {
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

        {/* Tabs */}
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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Heure', 'Devise', 'Impact', 'Événement', 'Prévision', 'Précédent'].map(h => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'news' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {NEWS_MOCK.map((news, i) => (
              <div key={i} style={{ background: '#0e1117', border: `1px solid ${news.score === 3 ? 'rgba(240,82,82,0.3)' : news.score === 2 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ color: IMPACT_COLORS[news.score], fontSize: '13px', fontWeight: '700' }}>{'★'.repeat(news.score)}</span>
                      <span style={{ fontSize: '11px', color: '#7a8299' }}>{news.time}</span>
                      <span style={{ fontSize: '11px', color: '#404760', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: '4px' }}>{news.source}</span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#dfe3ed', marginBottom: '8px' }}>{news.title}</div>
                    <div style={{ fontSize: '13px', color: '#7a8299', lineHeight: '1.6', marginBottom: '12px' }}>{news.summary}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.entries(news.impact).map(([market, direction]) => (
                    <div key={market} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: '6px', padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#7a8299', textTransform: 'uppercase', fontWeight: '600' }}>{market}</span>
                      <span style={{ color: MARKET_COLORS[direction], fontWeight: '700' }}>
                        {direction === 'haussier' ? '↑' : direction === 'baissier' ? '↓' : '→'} {direction}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ fontSize: '11px', color: '#404760', textAlign: 'center', marginTop: '8px' }}>
              ⚠️ Données de démonstration — connexion API actualités en temps réel arrive prochainement
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
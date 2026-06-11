'use client'

import { useState, useEffect } from 'react'

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

const IMPACT_COLORS: Record<number, string> = {
  1: '#22d3a0',
  2: '#f59e0b',
  3: '#f05252',
}

const IMPACT_LABELS: Record<number, string> = {
  1: 'Faible',
  2: 'Moyen',
  3: 'Fort',
}

export default function CalendrierEcoPage() {
  const [filter, setFilter] = useState('ALL')
  const [impactFilter, setImpactFilter] = useState(0)

  const currencies = ['ALL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'CHF']

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
          <div style={{ color: '#7a8299', marginTop: '4px' }}>Calendrier économique</div>
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {currencies.map(c => (
              <button key={c} onClick={() => setFilter(c)} style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                background: filter === c ? '#00e5b0' : '#0e1117',
                color: filter === c ? '#000' : '#7a8299',
                border: `1px solid ${filter === c ? '#00e5b0' : 'rgba(255,255,255,0.08)'}`,
                fontWeight: filter === c ? '600' : '400'
              }}>{c}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2, 3].map(i => (
              <button key={i} onClick={() => setImpactFilter(i)} style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                background: impactFilter === i ? (i === 0 ? '#00e5b0' : IMPACT_COLORS[i]) : '#0e1117',
                color: impactFilter === i ? '#000' : '#7a8299',
                border: `1px solid ${impactFilter === i ? (i === 0 ? '#00e5b0' : IMPACT_COLORS[i]) : 'rgba(255,255,255,0.08)'}`,
                fontWeight: impactFilter === i ? '600' : '400'
              }}>
                {i === 0 ? 'Tous' : '★'.repeat(i)}
              </button>
            ))}
          </div>
        </div>

        {/* Tableau */}
        <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#dfe3ed' }}>
              📅 {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span style={{ fontSize: '12px', color: '#7a8299' }}>— {filtered.length} événement{filtered.length > 1 ? 's' : ''}</span>
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
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.1s' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#00e5b0', fontWeight: '600' }}>{event.time}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', fontWeight: '600' }}>
                      {event.currency}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ color: IMPACT_COLORS[event.impact], fontSize: '12px', fontWeight: '600' }}>
                      {'★'.repeat(event.impact)} {IMPACT_LABELS[event.impact]}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: event.impact === 3 ? '600' : '400', color: event.impact === 3 ? '#dfe3ed' : '#a0a8c0' }}>
                    {event.impact === 3 && <span style={{ marginRight: '6px' }}>🔴</span>}
                    {event.impact === 2 && <span style={{ marginRight: '6px' }}>🟡</span>}
                    {event.impact === 1 && <span style={{ marginRight: '6px' }}>🟢</span>}
                    {event.event}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#7a8299' }}>{event.forecast}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#7a8299' }}>{event.previous}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#7a8299' }}>
              Aucun événement pour ce filtre.
            </div>
          )}
        </div>

        <div style={{ marginTop: '12px', fontSize: '12px', color: '#404760', textAlign: 'center' }}>
          ⚠️ Données de démonstration — la connexion API Finnhub arrive en V2 finale
        </div>

      </div>
    </div>
  )
}
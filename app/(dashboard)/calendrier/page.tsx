'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CalendrierPage() {
  const [trades, setTrades] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => { loadTrades() }, [])

  async function loadTrades() {
    const supabase = createClient()
    const { data } = await supabase
      .from('trades')
      .select('*')
      .order('opened_at', { ascending: false })
    if (data) setTrades(data)
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = (firstDay.getDay() + 6) % 7

  // Calcul P&L par jour
  const pnlByDay: Record<string, number> = {}
  trades.forEach(t => {
    if (!t.pnl) return
    const d = new Date(t.opened_at)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate().toString()
      pnlByDay[key] = (pnlByDay[key] || 0) + t.pnl
    }
  })

  // Stats du mois
  const monthPnl = Object.values(pnlByDay).reduce((sum, v) => sum + v, 0)
  const gainDays = Object.values(pnlByDay).filter(v => v > 0).length
  const lossDays = Object.values(pnlByDay).filter(v => v < 0).length

  const days = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i)

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px' }}>
            Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
          </div>
          <div style={{ color: '#7a8299', marginTop: '4px' }}>Calendrier P&L</div>
        </div>

        {/* Stats du mois */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'P&L DU MOIS', value: `${monthPnl > 0 ? '+' : ''}${monthPnl.toFixed(2)}€`, color: monthPnl >= 0 ? '#22d3a0' : '#f05252' },
            { label: 'JOURS GAGNANTS', value: gainDays, color: '#22d3a0' },
            { label: 'JOURS PERDANTS', value: lossDays, color: '#f05252' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Navigation mois */}
        <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              style={{ background: '#141920', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 16px', color: '#dfe3ed', cursor: 'pointer', fontSize: '16px' }}
            >←</button>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>
              {monthNames[month]} {year}
            </div>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              style={{ background: '#141920', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 16px', color: '#dfe3ed', cursor: 'pointer', fontSize: '16px' }}
            >→</button>
          </div>

          {/* Jours de la semaine */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px' }}>
            {dayNames.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#7a8299', padding: '8px 0' }}>{d}</div>
            ))}
          </div>

          {/* Cases du calendrier */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {days.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />

              const pnl = pnlByDay[day.toString()]
              const hasData = pnl !== undefined
              const isGain = hasData && pnl > 0
              const isLoss = hasData && pnl < 0
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()

              return (
                <div key={day} style={{
                  background: isGain ? 'rgba(34,211,160,0.15)' : isLoss ? 'rgba(240,82,82,0.15)' : '#141920',
                  border: `1px solid ${isGain ? 'rgba(34,211,160,0.3)' : isLoss ? 'rgba(240,82,82,0.3)' : isToday ? '#00e5b0' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '8px',
                  padding: '10px 6px',
                  textAlign: 'center',
                  minHeight: '64px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: isToday ? '700' : '400', color: isToday ? '#00e5b0' : '#7a8299' }}>{day}</div>
                  {hasData && (
                    <div style={{ fontSize: '11px', fontWeight: '700', color: isGain ? '#22d3a0' : '#f05252' }}>
                      {isGain ? '+' : ''}{pnl.toFixed(0)}€
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
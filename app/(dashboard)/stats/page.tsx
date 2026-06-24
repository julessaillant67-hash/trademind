'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function StatsPage() {
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadTrades() }, [])

  async function loadTrades() {
    const supabase = createClient()
    const { data } = await supabase
      .from('trades')
      .select('*')
      .order('opened_at', { ascending: true })
    if (data) setTrades(data)
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080a0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a8299', fontFamily: 'sans-serif' }}>
      Chargement...
    </div>
  )

  // Calculs
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const winRate = trades.length > 0 ? Math.round((trades.filter(t => t.pnl > 0).length / trades.length) * 100) : 0

  // P&L cumulé dans le temps
  let cumPnl = 0
  const pnlCurve = trades.map(t => {
    cumPnl += t.pnl || 0
    return { date: new Date(t.opened_at).toLocaleDateString('fr-FR'), pnl: Math.round(cumPnl * 100) / 100 }
  })

  // Biais Pareto
  const biasCount: Record<string, number> = {}
  trades.forEach(t => {
    if (!t.followed_plan) biasCount['Non-respect du plan'] = (biasCount['Non-respect du plan'] || 0) + 1
    if (t.emotion_before <= 2 && t.pnl < 0) biasCount['Trading émotionnel'] = (biasCount['Trading émotionnel'] || 0) + 1
    if (t.emotion_after <= 1) biasCount['Revenge Trading'] = (biasCount['Revenge Trading'] || 0) + 1
    if (t.emotion_before >= 4 && t.pnl < 0) biasCount['Overconfidence'] = (biasCount['Overconfidence'] || 0) + 1
  })
  const biases = Object.entries(biasCount).sort((a, b) => b[1] - a[1])
  const maxBias = biases[0]?.[1] || 1

  // Heures les plus rentables
  const hourStats: Record<number, { pnl: number, count: number }> = {}
  trades.forEach(t => {
    const hour = new Date(t.opened_at).getHours()
    if (!hourStats[hour]) hourStats[hour] = { pnl: 0, count: 0 }
    hourStats[hour].pnl += t.pnl || 0
    hourStats[hour].count++
  })
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    pnl: Math.round((hourStats[i]?.pnl || 0) * 100) / 100,
    count: hourStats[i]?.count || 0
  })).filter(h => h.count > 0)
  const maxHourPnl = Math.max(...hours.map(h => Math.abs(h.pnl)), 1)

  // Score psycho simulé dans le temps
  const scoreEvolution = trades.map((t, i) => {
    const recentTrades = trades.slice(Math.max(0, i - 4), i + 1)
    const recentWinRate = recentTrades.filter(r => r.pnl > 0).length / recentTrades.length
    const followedPlanRate = recentTrades.filter(r => r.followed_plan).length / recentTrades.length
    const score = Math.round(50 + recentWinRate * 25 + followedPlanRate * 25)
    return { date: new Date(t.opened_at).toLocaleDateString('fr-FR'), score: Math.min(100, Math.max(20, score)) }
  })

  const cardStyle = { background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }

  if (trades.length < 2) return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px', marginBottom: '8px' }}>
          Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
        </div>
        <div style={{ color: '#7a8299', marginBottom: '32px' }}>Statistiques avancées</div>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
          <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>Pas assez de données</div>
          <div style={{ fontSize: '14px', color: '#7a8299' }}>Ajoute au moins 2 trades pour voir tes statistiques avancées.</div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px' }}>
            Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
          </div>
          <div style={{ color: '#7a8299', marginTop: '4px' }}>Statistiques avancées</div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'TRADES TOTAL', value: String(trades.length), color: '#dfe3ed' },
            { label: 'WIN RATE', value: `${winRate}%`, color: winRate >= 50 ? '#22d3a0' : '#f05252' },
            { label: 'P&L TOTAL', value: `${totalPnl > 0 ? '+' : ''}${totalPnl.toFixed(2)}€`, color: totalPnl >= 0 ? '#22d3a0' : '#f05252' },
            { label: 'BIAIS DÉTECTÉS', value: String(biases.length), color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={cardStyle}>
              <div style={{ fontSize: '10px', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* COURBE P&L CUMULÉ */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '20px' }}>
            📈 Courbe P&L cumulé
          </div>
          <div style={{ position: 'relative', height: '160px' }}>
            <svg width="100%" height="160" viewBox={`0 0 ${Math.max(pnlCurve.length * 40, 400)} 160`} preserveAspectRatio="none">
              {(() => {
                const maxVal = Math.max(...pnlCurve.map(p => Math.abs(p.pnl)), 1)
                const w = Math.max(pnlCurve.length * 40, 400)
                const points = pnlCurve.map((p, i) => {
                  const x = (i / (pnlCurve.length - 1)) * (w - 40) + 20
                  const y = 80 - (p.pnl / maxVal) * 70
                  return `${x},${y}`
                }).join(' ')
                const lastPoint = pnlCurve[pnlCurve.length - 1]
                const isPositive = lastPoint.pnl >= 0
                return (
                  <>
                    <line x1="0" y1="80" x2={w} y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <polyline points={points} fill="none" stroke={isPositive ? '#22d3a0' : '#f05252'} strokeWidth="2.5" />
                    {pnlCurve.map((p, i) => {
                      const x = (i / (pnlCurve.length - 1)) * (Math.max(pnlCurve.length * 40, 400) - 40) + 20
                      const y = 80 - (p.pnl / Math.max(...pnlCurve.map(pp => Math.abs(pp.pnl)), 1)) * 70
                      return <circle key={i} cx={x} cy={y} r="4" fill={p.pnl >= 0 ? '#22d3a0' : '#f05252'} />
                    })}
                  </>
                )
              })()}
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#404760', marginTop: '8px' }}>
            {pnlCurve.filter((_, i) => i % Math.max(1, Math.floor(pnlCurve.length / 5)) === 0).map((p, i) => (
              <span key={i}>{p.date}</span>
            ))}
          </div>
        </div>

        {/* SCORE PSYCHO + PARETO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* Score évolution */}
          <div style={cardStyle}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '20px' }}>
              🧠 Évolution du score psycho
            </div>
            <div style={{ position: 'relative', height: '160px' }}>
              <svg width="100%" height="160" viewBox="0 0 400 160" preserveAspectRatio="none">
                <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(0,229,176,0.1)" strokeWidth="1" strokeDasharray="4,4" />
                {scoreEvolution.length > 1 && (
                  <polyline
                    points={scoreEvolution.map((s, i) => {
                      const x = (i / (scoreEvolution.length - 1)) * 380 + 10
                      const y = 160 - (s.score / 100) * 150
                      return `${x},${y}`
                    }).join(' ')}
                    fill="none"
                    stroke="#00e5b0"
                    strokeWidth="2.5"
                  />
                )}
                {scoreEvolution.map((s, i) => {
                  const x = (i / (scoreEvolution.length - 1)) * 380 + 10
                  const y = 160 - (s.score / 100) * 150
                  return <circle key={i} cx={x} cy={y} r="4" fill="#00e5b0" />
                })}
                <text x="5" y="45" fill="#00e5b0" fontSize="9">100</text>
                <text x="5" y="85" fill="#7a8299" fontSize="9">50</text>
              </svg>
            </div>
          </div>

          {/* Pareto biais */}
          <div style={cardStyle}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '20px' }}>
              ⚠️ Pareto des biais
            </div>
            {biases.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#7a8299', fontSize: '13px', paddingTop: '40px' }}>Aucun biais détecté 🎉</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {biases.map(([bias, count]) => (
                  <div key={bias}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#dfe3ed' }}>{bias}</span>
                      <span style={{ color: '#f87171', fontWeight: '600' }}>{count}×</span>
                    </div>
                    <div style={{ background: '#141920', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ background: '#f05252', height: '100%', width: `${(count / maxBias) * 100}%`, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* HEURES LES PLUS RENTABLES */}
        <div style={cardStyle}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '20px' }}>
            🕐 Heures les plus rentables
          </div>
          {hours.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#7a8299', fontSize: '13px' }}>Pas assez de données</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
              {hours.map(h => (
                <div key={h.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ fontSize: '10px', color: h.pnl > 0 ? '#22d3a0' : '#f05252', fontWeight: '600' }}>
                    {h.pnl > 0 ? '+' : ''}{h.pnl.toFixed(0)}€
                  </div>
                  <div style={{
                    width: '100%',
                    background: h.pnl > 0 ? 'rgba(34,211,160,0.8)' : 'rgba(240,82,82,0.8)',
                    borderRadius: '4px 4px 0 0',
                    height: `${(Math.abs(h.pnl) / maxHourPnl) * 80}px`,
                    minHeight: '4px'
                  }} />
                  <div style={{ fontSize: '10px', color: '#7a8299' }}>{h.hour}h</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
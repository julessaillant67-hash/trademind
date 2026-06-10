'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPnl: 0,
    winRate: 0,
    tradeCount: 0,
    psychScore: 0
  })
  const [recentTrades, setRecentTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const supabase = createClient()
    const { data: trades } = await supabase
      .from('trades')
      .select('*')
      .order('opened_at', { ascending: false })

    if (trades && trades.length > 0) {
      const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
      const winningTrades = trades.filter(t => t.pnl > 0).length
      const winRate = Math.round((winningTrades / trades.length) * 100)
      const psychScore = winRate > 70 ? 82 : winRate > 50 ? 65 : 45

      setStats({
        totalPnl,
        winRate,
        tradeCount: trades.length,
        psychScore: trades.length > 0 ? psychScore : 0
      })
      setRecentTrades(trades.slice(0, 5))
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px' }}>
            Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
          </div>
          <div style={{ color: '#7a8299', marginTop: '4px' }}>Bienvenue sur ton dashboard</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'P&L CE MOIS', value: `${stats.totalPnl > 0 ? '+' : ''}${stats.totalPnl.toFixed(2)}€`, color: stats.totalPnl >= 0 ? '#22d3a0' : '#f05252' },
            { label: 'WIN RATE', value: `${stats.winRate}%`, color: stats.winRate >= 50 ? '#22d3a0' : '#f05252' },
            { label: 'TRADES', value: stats.tradeCount, color: '#dfe3ed' },
            { label: 'SCORE PSYCHO', value: stats.tradeCount > 0 ? `${stats.psychScore}/100` : '--/100', color: stats.psychScore >= 70 ? '#22d3a0' : stats.psychScore >= 50 ? '#f59e0b' : '#f05252' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>{stat.label}</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {recentTrades.length === 0 ? (
          <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#7a8299' }}>
            Ajoute ton premier trade pour commencer l'analyse IA
          </div>
        ) : (
          <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>
              Derniers trades
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Actif', 'Direction', 'Entrée', 'Sortie', 'P&L', 'Date'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#7a8299', fontWeight: '500' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTrades.map(trade => (
                  <tr key={trade.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '500' }}>{trade.asset}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: trade.direction === 'LONG' ? 'rgba(34,211,160,0.15)' : 'rgba(240,82,82,0.15)', color: trade.direction === 'LONG' ? '#22d3a0' : '#f05252', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                        {trade.direction}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{trade.entry_price}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{trade.exit_price || '—'}</td>
                    <td style={{ padding: '10px 12px', fontWeight: '600', color: trade.pnl > 0 ? '#22d3a0' : trade.pnl < 0 ? '#f05252' : '#dfe3ed' }}>
                      {trade.pnl ? `${trade.pnl > 0 ? '+' : ''}${trade.pnl}€` : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#7a8299' }}>
                      {new Date(trade.opened_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
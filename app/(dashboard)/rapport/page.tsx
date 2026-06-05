'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RapportPage() {
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrades()
  }, [])

  async function loadTrades() {
    const supabase = createClient()
    const { data } = await supabase
      .from('trades')
      .select('*')
      .order('opened_at', { ascending: false })
    if (data) setTrades(data)
    setLoading(false)
  }

  // Calcul des stats
  const totalTrades = trades.length
  const winningTrades = trades.filter(t => t.pnl > 0).length
  const losingTrades = trades.filter(t => t.pnl < 0).length
  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const bestTrade = trades.reduce((best, t) => (t.pnl > (best?.pnl || -Infinity) ? t : best), null)
  const worstTrade = trades.reduce((worst, t) => (t.pnl < (worst?.pnl || Infinity) ? t : worst), null)
  const avgEmotion = totalTrades > 0 ? (trades.reduce((sum, t) => sum + (t.emotion_before || 3), 0) / totalTrades).toFixed(1) : '—'
  const followedPlan = totalTrades > 0 ? Math.round((trades.filter(t => t.followed_plan).length / totalTrades) * 100) : 0

  // Assets les plus tradés
  const assetCount: Record<string, number> = {}
  trades.forEach(t => { assetCount[t.asset] = (assetCount[t.asset] || 0) + 1 })
  const topAssets = Object.entries(assetCount).sort((a, b) => b[1] - a[1]).slice(0, 3)

  // Meilleure heure
  const hourCount: Record<number, { wins: number, total: number }> = {}
  trades.forEach(t => {
    const hour = new Date(t.opened_at).getHours()
    if (!hourCount[hour]) hourCount[hour] = { wins: 0, total: 0 }
    hourCount[hour].total++
    if (t.pnl > 0) hourCount[hour].wins++
  })
  const bestHour = Object.entries(hourCount)
    .filter(([, v]) => v.total >= 2)
    .sort((a, b) => (b[1].wins / b[1].total) - (a[1].wins / a[1].total))[0]

  const psychScore = winRate > 70 ? 82 : winRate > 50 ? 65 : 45

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080a0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a8299', fontFamily: 'sans-serif' }}>
        Chargement du rapport...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px' }}>
              Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
            </div>
            <div style={{ color: '#7a8299', marginTop: '4px' }}>Rapport de performance</div>
          </div>
          <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', color: '#7a8299' }}>
            📅 {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {totalTrades === 0 ? (
          <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#7a8299' }}>
            Aucun trade enregistré. Ajoute des trades dans le journal pour générer ton rapport.
          </div>
        ) : (
          <>
            {/* SCORE PSYCHO */}
            <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                border: `3px solid ${psychScore >= 70 ? '#22d3a0' : psychScore >= 50 ? '#f59e0b' : '#f05252'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <div style={{ fontSize: '22px', fontWeight: '700', color: psychScore >= 70 ? '#22d3a0' : psychScore >= 50 ? '#f59e0b' : '#f05252' }}>{psychScore}</div>
                <div style={{ fontSize: '10px', color: '#7a8299' }}>/100</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '6px' }}>Score psychologique global</div>
                <div style={{ fontSize: '13px', color: '#7a8299', lineHeight: '1.6' }}>
                  {psychScore >= 70 ? 'Bonne discipline générale. Continue sur cette lancée et travaille ta constance.' :
                   psychScore >= 50 ? 'Des progrès visibles mais des axes d\'amélioration importants. Travaille ta gestion émotionnelle.' :
                   'Score à améliorer. Concentre-toi sur le respect de ton plan de trading avant tout.'}
                </div>
              </div>
            </div>

            {/* STATS GRILLE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Total trades', value: totalTrades, color: '#dfe3ed' },
                { label: 'Win Rate', value: `${winRate}%`, color: winRate >= 50 ? '#22d3a0' : '#f05252' },
                { label: 'P&L Total', value: `${totalPnl > 0 ? '+' : ''}${totalPnl.toFixed(2)}€`, color: totalPnl > 0 ? '#22d3a0' : '#f05252' },
                { label: 'Respect du plan', value: `${followedPlan}%`, color: followedPlan >= 70 ? '#22d3a0' : '#f59e0b' },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{stat.label}</div>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* DETAILS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

              {/* TRADES W/L */}
              <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>Trades gagnants / perdants</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, background: 'rgba(34,211,160,0.08)', border: '1px solid rgba(34,211,160,0.2)', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#22d3a0' }}>{winningTrades}</div>
                    <div style={{ fontSize: '12px', color: '#7a8299', marginTop: '4px' }}>Gagnants</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(240,82,82,0.08)', border: '1px solid rgba(240,82,82,0.2)', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#f05252' }}>{losingTrades}</div>
                    <div style={{ fontSize: '12px', color: '#7a8299', marginTop: '4px' }}>Perdants</div>
                  </div>
                </div>
              </div>

              {/* ACTIFS */}
              <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>Actifs les plus tradés</div>
                {topAssets.length > 0 ? topAssets.map(([asset, count]) => (
                  <div key={asset} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>{asset}</div>
                    <div style={{ fontSize: '12px', color: '#7a8299' }}>{count} trade{count > 1 ? 's' : ''}</div>
                  </div>
                )) : <div style={{ fontSize: '13px', color: '#7a8299' }}>Pas encore de données</div>}
              </div>

              {/* MEILLEUR / PIRE TRADE */}
              <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>Meilleur / Pire trade</div>
                {bestTrade && (
                  <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '13px', color: '#7a8299' }}>🏆 Meilleur — {bestTrade.asset}</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#22d3a0' }}>+{bestTrade.pnl}€</div>
                  </div>
                )}
                {worstTrade && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '13px', color: '#7a8299' }}>📉 Pire — {worstTrade.asset}</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#f05252' }}>{worstTrade.pnl}€</div>
                  </div>
                )}
              </div>

              {/* MEILLEURE HEURE */}
              <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>Analyse horaire</div>
                {bestHour ? (
                  <div>
                    <div style={{ fontSize: '13px', color: '#7a8299', marginBottom: '6px' }}>Meilleure heure de trading :</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#00e5b0' }}>{bestHour[0]}h00</div>
                    <div style={{ fontSize: '12px', color: '#7a8299', marginTop: '4px' }}>
                      {Math.round((bestHour[1].wins / bestHour[1].total) * 100)}% de wins sur {bestHour[1].total} trades
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: '#7a8299' }}>Ajoute plus de trades pour voir tes meilleures heures</div>
                )}
              </div>
            </div>

            {/* CONSEIL IA */}
            <div style={{ background: 'rgba(0,229,176,0.06)', border: '1px solid rgba(0,229,176,0.2)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#00e5b0', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
                💡 Conseil basé sur tes données
              </div>
              <div style={{ fontSize: '14px', color: '#dfe3ed', lineHeight: '1.7' }}>
                {winRate >= 70
                  ? `Excellent win rate de ${winRate}%. Ton défi maintenant est d'augmenter la taille de tes positions sur tes setups les plus fiables pour maximiser tes gains.`
                  : winRate >= 50
                  ? `Win rate de ${winRate}% — tu es dans la bonne direction. Concentre-toi sur la qualité des entrées et respecte toujours ton stop loss.`
                  : `Win rate de ${winRate}% — priorité au respect du plan de trading. Lance l'analyse IA pour identifier tes biais et corriger tes erreurs récurrentes.`
                }
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RapportPage() {
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => { loadTrades() }, [])

  async function loadTrades() {
    const supabase = createClient()
    const { data } = await supabase
      .from('trades')
      .select('*')
      .order('opened_at', { ascending: false })
    if (data) setTrades(data)
    setLoading(false)
  }

  async function downloadPDF() {
    setDownloading(true)
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    const teal = [0, 229, 176] as [number, number, number]
    const dark = [14, 17, 23] as [number, number, number]
    const gray = [122, 130, 153] as [number, number, number]

    // Header
    doc.setFillColor(...dark)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(...teal)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('TradeMind', 14, 20)
    doc.setTextColor(...gray)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Rapport de performance', 14, 28)
    doc.text(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), 14, 35)

    // Stats
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const winningTrades = trades.filter(t => t.pnl > 0).length
    const losingTrades = trades.filter(t => t.pnl < 0).length
    const winRate = trades.length > 0 ? Math.round((winningTrades / trades.length) * 100) : 0
    const followedPlan = trades.length > 0 ? Math.round((trades.filter(t => t.followed_plan).length / trades.length) * 100) : 0
    const psychScore = winRate > 70 ? 82 : winRate > 50 ? 65 : 45

    const stats = [
      { label: 'Total trades', value: String(trades.length) },
      { label: 'Win Rate', value: `${winRate}%` },
      { label: 'P&L Total', value: `${totalPnl > 0 ? '+' : ''}${totalPnl.toFixed(2)}€` },
      { label: 'Trades gagnants', value: String(winningTrades) },
      { label: 'Trades perdants', value: String(losingTrades) },
      { label: 'Respect du plan', value: `${followedPlan}%` },
      { label: 'Score psycho', value: `${psychScore}/100` },
    ]

    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text('Statistiques globales', 14, 55)

    stats.forEach((s, i) => {
      const x = i % 2 === 0 ? 14 : 110
      const y = 65 + Math.floor(i / 2) * 12
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...gray)
      doc.text(s.label, x, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(s.value, x + 50, y)
    })

    // Tableau trades
    const tableY = 65 + Math.ceil(stats.length / 2) * 12 + 15
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Historique des trades', 14, tableY)

    const headers = ['Actif', 'Dir.', 'Entrée', 'Sortie', 'P&L', 'Date']
    const colWidths = [30, 15, 28, 28, 25, 28]
    let colX = 14
    doc.setFontSize(8)
    doc.setFillColor(240, 240, 240)
    doc.rect(14, tableY + 4, 182, 7, 'F')

    headers.forEach((h, i) => {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(80, 80, 80)
      doc.text(h, colX + 2, tableY + 10)
      colX += colWidths[i]
    })

    trades.slice(0, 25).forEach((trade, idx) => {
      const rowY = tableY + 18 + idx * 8
      if (idx % 2 === 0) {
        doc.setFillColor(250, 250, 250)
        doc.rect(14, rowY - 4, 182, 8, 'F')
      }
      colX = 14
      const row = [
        trade.asset,
        trade.direction,
        trade.entry_price?.toString() || '',
        trade.exit_price?.toString() || '—',
        trade.pnl ? `${trade.pnl > 0 ? '+' : ''}${trade.pnl}€` : '—',
        new Date(trade.opened_at).toLocaleDateString('fr-FR')
      ]
      row.forEach((cell, i) => {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        if (i === 4 && trade.pnl) {
          doc.setTextColor(trade.pnl > 0 ? 34 : 220, trade.pnl > 0 ? 197 : 50, trade.pnl > 0 ? 94 : 50)
        } else {
          doc.setTextColor(50, 50, 50)
        }
        doc.text(cell, colX + 2, rowY + 1)
        colX += colWidths[i]
      })
    })

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(...gray)
    doc.text('TradeMind — trademind-gamma.vercel.app — Document confidentiel', 14, 285)

    doc.save(`TradeMind_Rapport_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`)
    setDownloading(false)
  }

  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const winningTrades = trades.filter(t => t.pnl > 0).length
  const losingTrades = trades.filter(t => t.pnl < 0).length
  const winRate = trades.length > 0 ? Math.round((winningTrades / trades.length) * 100) : 0
  const followedPlan = trades.length > 0 ? Math.round((trades.filter(t => t.followed_plan).length / trades.length) * 100) : 0
  const psychScore = winRate > 70 ? 82 : winRate > 50 ? 65 : 45

  const assetCount: Record<string, number> = {}
  trades.forEach(t => { assetCount[t.asset] = (assetCount[t.asset] || 0) + 1 })
  const topAssets = Object.entries(assetCount).sort((a, b) => b[1] - a[1]).slice(0, 3)

  const bestTrade = trades.reduce((best, t) => (t.pnl > (best?.pnl || -Infinity) ? t : best), null)
  const worstTrade = trades.reduce((worst, t) => (t.pnl < (worst?.pnl || Infinity) ? t : worst), null)

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const weekPnl = trades.filter(t => new Date(t.opened_at) >= oneWeekAgo).reduce((sum, t) => sum + (t.pnl || 0), 0)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080a0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a8299', fontFamily: 'sans-serif' }}>
      Chargement...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px' }}>
              Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
            </div>
            <div style={{ color: '#7a8299', marginTop: '4px' }}>Rapport de performance</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', color: '#7a8299' }}>
              📅 {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <button
              onClick={downloadPDF}
              disabled={downloading || trades.length === 0}
              style={{ background: '#00e5b0', border: 'none', borderRadius: '10px', padding: '10px 20px', color: '#000', fontWeight: '600', fontSize: '14px', cursor: trades.length === 0 ? 'not-allowed' : 'pointer', opacity: downloading ? 0.7 : 1 }}
            >
              {downloading ? '⏳ Génération...' : '⬇️ Télécharger PDF'}
            </button>
          </div>
        </div>

        {trades.length === 0 ? (
          <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#7a8299' }}>
            Aucun trade enregistré. Ajoute des trades dans le journal pour générer ton rapport.
          </div>
        ) : (
          <>
            <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: `3px solid ${psychScore >= 70 ? '#22d3a0' : psychScore >= 50 ? '#f59e0b' : '#f05252'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: '22px', fontWeight: '700', color: psychScore >= 70 ? '#22d3a0' : psychScore >= 50 ? '#f59e0b' : '#f05252' }}>{psychScore}</div>
                <div style={{ fontSize: '10px', color: '#7a8299' }}>/100</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '6px' }}>Score psychologique global</div>
                <div style={{ fontSize: '13px', color: '#7a8299', lineHeight: '1.6' }}>
                  {psychScore >= 70 ? 'Bonne discipline. Continue sur cette lancée.' : psychScore >= 50 ? 'Des progrès visibles mais des axes à améliorer.' : 'Score à améliorer. Concentre-toi sur ton plan.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'TRADES', value: String(trades.length), color: '#dfe3ed' },
                { label: 'WIN RATE', value: `${winRate}%`, color: winRate >= 50 ? '#22d3a0' : '#f05252' },
                { label: 'P&L SEMAINE', value: `${weekPnl > 0 ? '+' : ''}${weekPnl.toFixed(2)}€`, color: weekPnl >= 0 ? '#22d3a0' : '#f05252' },
                { label: 'P&L TOTAL', value: `${totalPnl > 0 ? '+' : ''}${totalPnl.toFixed(2)}€`, color: totalPnl >= 0 ? '#22d3a0' : '#f05252' },
                { label: 'PLAN SUIVI', value: `${followedPlan}%`, color: followedPlan >= 70 ? '#22d3a0' : '#f59e0b' },
              ].map(s => (
                <div key={s.label} style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '10px', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{s.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>Gagnants / Perdants</div>
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

              <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>Actifs les plus tradés</div>
                {topAssets.map(([asset, count]) => (
                  <div key={asset} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>{asset}</div>
                    <div style={{ fontSize: '12px', color: '#7a8299' }}>{count} trade{count > 1 ? 's' : ''}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>Meilleur / Pire trade</div>
                {bestTrade && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><div style={{ fontSize: '13px', color: '#7a8299' }}>🏆 {bestTrade.asset}</div><div style={{ fontSize: '13px', fontWeight: '700', color: '#22d3a0' }}>+{bestTrade.pnl}€</div></div>}
                {worstTrade && <div style={{ display: 'flex', justifyContent: 'space-between' }}><div style={{ fontSize: '13px', color: '#7a8299' }}>📉 {worstTrade.asset}</div><div style={{ fontSize: '13px', fontWeight: '700', color: '#f05252' }}>{worstTrade.pnl}€</div></div>}
              </div>

              <div style={{ background: 'rgba(0,229,176,0.06)', border: '1px solid rgba(0,229,176,0.2)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#00e5b0', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>💡 Conseil</div>
                <div style={{ fontSize: '13px', color: '#dfe3ed', lineHeight: '1.7' }}>
                  {winRate >= 70 ? `Win rate ${winRate}% — excellent. Augmente progressivement la taille de tes positions.` : winRate >= 50 ? `Win rate ${winRate}% — bien. Concentre-toi sur la qualité des entrées.` : `Win rate ${winRate}% — travaille le respect de ton plan et lance l'analyse IA.`}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
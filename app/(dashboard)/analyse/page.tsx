'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePlan } from '@/lib/usePlan'

export default function AnalysePage() {
  const { canAccess } = usePlan()
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [activeTab, setActiveTab] = useState<'analyse' | 'rapport' | 'stats'>('analyse')

  useEffect(() => { loadTrades() }, [])

  async function loadTrades() {
    const supabase = createClient()
    const { data } = await supabase.from('trades').select('*').order('opened_at', { ascending: true })
    if (data) setTrades(data)
    setLoading(false)
  }

  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const winningTrades = trades.filter(t => t.pnl > 0).length
  const losingTrades = trades.filter(t => t.pnl < 0).length
  const winRate = trades.length > 0 ? Math.round((winningTrades / trades.length) * 100) : 0
  const followedPlan = trades.length > 0 ? Math.round((trades.filter(t => t.followed_plan).length / trades.length) * 100) : 0
  const psychScore = winRate > 70 ? 82 : winRate > 50 ? 65 : 45
  const bestTrade = trades.reduce((best, t) => (t.pnl > (best?.pnl || -Infinity) ? t : best), null)
  const worstTrade = trades.reduce((worst, t) => (t.pnl < (worst?.pnl || Infinity) ? t : worst), null)
  const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const weekPnl = trades.filter(t => new Date(t.opened_at) >= oneWeekAgo).reduce((sum, t) => sum + (t.pnl || 0), 0)
  const assetCount: Record<string, number> = {}
  trades.forEach(t => { assetCount[t.asset] = (assetCount[t.asset] || 0) + 1 })
  const topAssets = Object.entries(assetCount).sort((a, b) => b[1] - a[1]).slice(0, 3)

  // Pareto biais
  const biasCount: Record<string, number> = {}
  trades.forEach(t => {
    if (!t.followed_plan) biasCount['Non-respect du plan'] = (biasCount['Non-respect du plan'] || 0) + 1
    if (t.emotion_before <= 2 && t.pnl < 0) biasCount['Trading émotionnel'] = (biasCount['Trading émotionnel'] || 0) + 1
    if (t.emotion_after <= 1) biasCount['Revenge Trading'] = (biasCount['Revenge Trading'] || 0) + 1
    if (t.emotion_before >= 4 && t.pnl < 0) biasCount['Overconfidence'] = (biasCount['Overconfidence'] || 0) + 1
  })
  const biases = Object.entries(biasCount).sort((a, b) => b[1] - a[1])
  const maxBias = biases[0]?.[1] || 1

  // P&L cumulé
  let cumPnl = 0
  const pnlCurve = trades.map(t => {
    cumPnl += t.pnl || 0
    return { date: new Date(t.opened_at).toLocaleDateString('fr-FR'), pnl: Math.round(cumPnl * 100) / 100 }
  })

  // Heures rentables
  const hourStats: Record<number, { pnl: number, count: number }> = {}
  trades.forEach(t => {
    const hour = new Date(t.opened_at).getHours()
    if (!hourStats[hour]) hourStats[hour] = { pnl: 0, count: 0 }
    hourStats[hour].pnl += t.pnl || 0
    hourStats[hour].count++
  })
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: i, pnl: Math.round((hourStats[i]?.pnl || 0) * 100) / 100, count: hourStats[i]?.count || 0
  })).filter(h => h.count > 0)
  const maxHourPnl = Math.max(...hours.map(h => Math.abs(h.pnl)), 1)

  async function lancerAnalyse() {
    setAnalysisLoading(true)
    setError('')
    setAnalysis(null)
    try {
      const res = await fetch('/api/ai/analyse', { method: 'POST' })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setAnalysis(data)
    } catch { setError('Erreur de connexion') }
    setAnalysisLoading(false)
  }

  async function downloadPDF() {
    setDownloading(true)
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const pageW = 210
    doc.setFillColor(8, 10, 13)
    doc.rect(0, 0, pageW, 297, 'F')
    doc.setFillColor(0, 229, 176)
    doc.rect(0, 0, pageW, 2, 'F')
    doc.setTextColor(0, 229, 176)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('Trade', 14, 20)
    doc.setTextColor(122, 130, 153)
    doc.setFont('helvetica', 'normal')
    doc.text('Mind', 46, 20)
    doc.setTextColor(223, 227, 237)
    doc.setFontSize(12)
    doc.text('Rapport de performance', 14, 28)
    doc.setFontSize(10)
    doc.setTextColor(122, 130, 153)
    doc.text(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), 14, 34)
    const scoreColor: [number, number, number] = psychScore >= 70 ? [34, 211, 160] : psychScore >= 50 ? [245, 158, 11] : [240, 82, 82]
    doc.setFillColor(14, 17, 23)
    doc.roundedRect(14, 46, pageW - 28, 30, 3, 3, 'F')
    doc.setDrawColor(...scoreColor)
    doc.setLineWidth(0.5)
    doc.roundedRect(14, 46, pageW - 28, 30, 3, 3, 'S')
    doc.setFillColor(...scoreColor)
    doc.circle(30, 61, 10, 'F')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(String(psychScore), 30, 64, { align: 'center' })
    doc.setFontSize(7)
    doc.text('/100', 30, 69, { align: 'center' })
    doc.setTextColor(223, 227, 237)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Score psychologique', 46, 57)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(122, 130, 153)
    doc.text(psychScore >= 70 ? 'Bonne discipline.' : psychScore >= 50 ? 'Des progres visibles.' : 'Travaille ton plan.', 46, 65)
    const statsCards = [
      { label: 'TRADES', value: String(trades.length), color: [0, 229, 176] as [number, number, number] },
      { label: 'WIN RATE', value: `${winRate}%`, color: (winRate >= 50 ? [34, 211, 160] : [240, 82, 82]) as [number, number, number] },
      { label: 'P&L TOTAL', value: `${totalPnl > 0 ? '+' : ''}${totalPnl.toFixed(0)}EUR`, color: (totalPnl >= 0 ? [34, 211, 160] : [240, 82, 82]) as [number, number, number] },
      { label: 'PLAN SUIVI', value: `${followedPlan}%`, color: (followedPlan >= 70 ? [34, 211, 160] : [245, 158, 11]) as [number, number, number] },
    ]
    const cardW = (pageW - 28 - 9) / 4
    statsCards.forEach((s, i) => {
      const x = 14 + i * (cardW + 3)
      doc.setFillColor(14, 17, 23)
      doc.roundedRect(x, 82, cardW, 22, 2, 2, 'F')
      doc.setTextColor(122, 130, 153)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text(s.label, x + cardW / 2, 88, { align: 'center' })
      doc.setTextColor(...s.color)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(s.value, x + cardW / 2, 99, { align: 'center' })
    })
    doc.setFillColor(0, 40, 30)
    doc.roundedRect(14, 110, pageW - 28, 18, 2, 2, 'F')
    doc.setDrawColor(0, 229, 176)
    doc.setLineWidth(0.5)
    doc.roundedRect(14, 110, pageW - 28, 18, 2, 2, 'S')
    doc.setTextColor(0, 229, 176)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('CONSEIL IA', 18, 116)
    doc.setTextColor(223, 227, 237)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(winRate >= 70 ? `Win rate ${winRate}% - Augmente progressivement tes positions.` : winRate >= 50 ? `Win rate ${winRate}% - Concentre-toi sur la qualite des entrees.` : `Win rate ${winRate}% - Travaille le respect de ton plan.`, 18, 123)
    doc.setTextColor(223, 227, 237)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Historique des trades', 14, 142)
    doc.setFillColor(0, 229, 176)
    doc.rect(14, 145, pageW - 28, 0.5, 'F')
    doc.setFillColor(14, 17, 23)
    doc.rect(14, 146, pageW - 28, 8, 'F')
    const headers = ['Actif', 'Dir.', 'Entree', 'Sortie', 'P&L', 'Date']
    const colWidths = [32, 18, 28, 28, 28, 28]
    let colX = 16
    headers.forEach((h) => {
      doc.setTextColor(0, 229, 176)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text(h, colX, 151)
      colX += colWidths[headers.indexOf(h)]
    })
    trades.slice(0, 20).forEach((trade, idx) => {
      const rowY = 159 + idx * 6
      if (idx % 2 === 0) { doc.setFillColor(20, 25, 32); doc.rect(14, rowY - 4, pageW - 28, 6, 'F') }
      colX = 16
      const row = [trade.asset, trade.direction, trade.entry_price?.toString() || '', trade.exit_price?.toString() || '-', trade.pnl ? `${trade.pnl > 0 ? '+' : ''}${trade.pnl}EUR` : '-', new Date(trade.opened_at).toLocaleDateString('fr-FR')]
      row.forEach((cell, i) => {
        if (i === 1) doc.setTextColor(...(trade.direction === 'LONG' ? [34, 211, 160] : [240, 82, 82]) as [number, number, number])
        else if (i === 4 && trade.pnl) doc.setTextColor(...(trade.pnl > 0 ? [34, 211, 160] : [240, 82, 82]) as [number, number, number])
        else doc.setTextColor(180, 185, 200)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text(cell, colX, rowY + 1)
        colX += colWidths[i]
      })
    })
    doc.setFillColor(0, 229, 176)
    doc.rect(14, 282, pageW - 28, 0.5, 'F')
    doc.setTextColor(122, 130, 153)
    doc.setFontSize(7)
    doc.text('TradeMind — Le coach trading IA', 14, 289)
    doc.setTextColor(0, 229, 176)
    doc.text('trademind.dev', pageW - 14, 289, { align: 'right' })
    doc.save(`TradeMind_Rapport_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`)
    setDownloading(false)
  }

  if (!canAccess.analyse) return (
    <div style={{ minHeight: '100vh', background: '#080a0d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔒</div>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#dfe3ed', marginBottom: '8px' }}>Fonctionnalité Starter</div>
        <div style={{ fontSize: '14px', color: '#7a8299', marginBottom: '24px', lineHeight: '1.6' }}>L'analyse IA est disponible à partir du plan Starter à 9,99€/mois.</div>
        <a href="/settings" style={{ display: 'inline-block', background: '#00e5b0', color: '#000', fontWeight: '700', fontSize: '14px', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none' }}>Voir les plans →</a>
      </div>
    </div>
  )

  const cardStyle = { background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px' }}>
              Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
            </div>
            <div style={{ color: '#7a8299', marginTop: '4px' }}>Analyse IA & Performance</div>
          </div>
          <button onClick={downloadPDF} disabled={downloading || trades.length === 0} style={{ background: '#00e5b0', border: 'none', borderRadius: '10px', padding: '10px 20px', color: '#000', fontWeight: '600', fontSize: '14px', cursor: trades.length === 0 ? 'not-allowed' : 'pointer', opacity: downloading ? 0.7 : 1 }}>
            {downloading ? '⏳ Génération...' : '⬇️ Télécharger PDF'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[
            { id: 'analyse', label: '🤖 Analyse IA' },
            { id: 'rapport', label: '📊 Rapport' },
            { id: 'stats', label: '📈 Statistiques' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', background: activeTab === t.id ? '#00e5b0' : '#0e1117', color: activeTab === t.id ? '#000' : '#7a8299', border: `1px solid ${activeTab === t.id ? '#00e5b0' : 'rgba(255,255,255,0.08)'}` }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ANALYSE IA */}
        {activeTab === 'analyse' && (
          <div>
            <button onClick={lancerAnalyse} disabled={analysisLoading} style={{ background: analysisLoading ? '#1a2030' : '#00e5b0', border: 'none', borderRadius: '10px', padding: '14px 32px', color: analysisLoading ? '#7a8299' : '#000', fontSize: '15px', fontWeight: '600', cursor: analysisLoading ? 'not-allowed' : 'pointer', marginBottom: '24px' }}>
              {analysisLoading ? '🤖 Analyse en cours...' : '🤖 Lancer l\'analyse IA'}
            </button>
            {error && <div style={{ background: 'rgba(240,82,82,0.1)', border: '1px solid rgba(240,82,82,0.3)', borderRadius: '10px', padding: '14px 18px', color: '#f87171', marginBottom: '24px' }}>{error}</div>}
            {analysis && (
              <div>
                <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: `3px solid ${analysis.psych_score >= 70 ? '#22d3a0' : analysis.psych_score >= 40 ? '#f59e0b' : '#f05252'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: analysis.psych_score >= 70 ? '#22d3a0' : analysis.psych_score >= 40 ? '#f59e0b' : '#f05252' }}>{analysis.psych_score}</div>
                    <div style={{ fontSize: '10px', color: '#7a8299' }}>/100</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '6px' }}>Score psychologique</div>
                    <div style={{ fontSize: '13px', color: '#7a8299', lineHeight: '1.6' }}>{analysis.resume}</div>
                  </div>
                </div>
                <div style={{ ...cardStyle, background: 'rgba(0,229,176,0.06)', border: '1px solid rgba(0,229,176,0.2)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#00e5b0', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>💡 Conseil principal</div>
                  <div style={{ fontSize: '14px', color: '#dfe3ed', lineHeight: '1.6' }}>{analysis.conseil_principal}</div>
                </div>
                {analysis.biases?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>⚠️ Biais détectés</div>
                    {analysis.biases.map((bias: any, i: number) => (
                      <div key={i} style={{ ...cardStyle, border: '1px solid rgba(240,82,82,0.2)', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#f87171' }}>{bias.type}</div>
                          <div style={{ fontSize: '11px', background: 'rgba(240,82,82,0.15)', color: '#f87171', padding: '2px 8px', borderRadius: '4px' }}>{bias.occurrences}× détecté</div>
                        </div>
                        <div style={{ fontSize: '13px', color: '#7a8299', marginBottom: '8px' }}>{bias.description}</div>
                        <div style={{ fontSize: '13px', color: '#dfe3ed' }}><span style={{ color: '#00e5b0' }}>→ </span>{bias.conseil}</div>
                      </div>
                    ))}
                  </div>
                )}
                {analysis.strengths?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>✅ Points forts</div>
                    {analysis.strengths.map((s: any, i: number) => (
                      <div key={i} style={{ ...cardStyle, border: '1px solid rgba(34,211,160,0.2)', marginBottom: '10px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#22d3a0', marginBottom: '6px' }}>{s.label}</div>
                        <div style={{ fontSize: '13px', color: '#7a8299' }}>{s.detail}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* RAPPORT */}
        {activeTab === 'rapport' && (
          <div>
            {trades.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '40px', color: '#7a8299' }}>Aucun trade enregistré.</div>
            ) : (
              <>
                <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: `3px solid ${psychScore >= 70 ? '#22d3a0' : psychScore >= 50 ? '#f59e0b' : '#f05252'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: psychScore >= 70 ? '#22d3a0' : psychScore >= 50 ? '#f59e0b' : '#f05252' }}>{psychScore}</div>
                    <div style={{ fontSize: '10px', color: '#7a8299' }}>/100</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '6px' }}>Score psychologique global</div>
                    <div style={{ fontSize: '13px', color: '#7a8299', lineHeight: '1.6' }}>{psychScore >= 70 ? 'Bonne discipline.' : psychScore >= 50 ? 'Des progrès visibles.' : 'Concentre-toi sur ton plan.'}</div>
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
                    <div key={s.label} style={cardStyle}>
                      <div style={{ fontSize: '10px', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{s.label}</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={cardStyle}>
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
                  <div style={cardStyle}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>Actifs les plus tradés</div>
                    {topAssets.map(([asset, count]) => (
                      <div key={asset} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '500' }}>{asset}</div>
                        <div style={{ fontSize: '12px', color: '#7a8299' }}>{count} trade{count > 1 ? 's' : ''}</div>
                      </div>
                    ))}
                  </div>
                  <div style={cardStyle}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>Meilleur / Pire trade</div>
                    {bestTrade && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><div style={{ fontSize: '13px', color: '#7a8299' }}>🏆 {bestTrade.asset}</div><div style={{ fontSize: '13px', fontWeight: '700', color: '#22d3a0' }}>+{bestTrade.pnl}€</div></div>}
                    {worstTrade && <div style={{ display: 'flex', justifyContent: 'space-between' }}><div style={{ fontSize: '13px', color: '#7a8299' }}>📉 {worstTrade.asset}</div><div style={{ fontSize: '13px', fontWeight: '700', color: '#f05252' }}>{worstTrade.pnl}€</div></div>}
                  </div>
                  <div style={{ ...cardStyle, background: 'rgba(0,229,176,0.06)', border: '1px solid rgba(0,229,176,0.2)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#00e5b0', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>💡 Conseil</div>
                    <div style={{ fontSize: '13px', color: '#dfe3ed', lineHeight: '1.7' }}>
                      {winRate >= 70 ? `Win rate ${winRate}% — augmente progressivement tes positions.` : winRate >= 50 ? `Win rate ${winRate}% — concentre-toi sur la qualité des entrées.` : `Win rate ${winRate}% — travaille le respect de ton plan.`}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* STATS */}
        {activeTab === 'stats' && (
          <div>
            {trades.length < 2 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
                <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>Pas assez de données</div>
                <div style={{ fontSize: '14px', color: '#7a8299' }}>Ajoute au moins 2 trades pour voir tes statistiques avancées.</div>
              </div>
            ) : (
              <>
                <div style={{ ...cardStyle, marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '20px' }}>📈 Courbe P&L cumulé</div>
                  <svg width="100%" height="160" viewBox={`0 0 ${Math.max(pnlCurve.length * 40, 400)} 160`} preserveAspectRatio="none">
                    {(() => {
                      const maxVal = Math.max(...pnlCurve.map(p => Math.abs(p.pnl)), 1)
                      const w = Math.max(pnlCurve.length * 40, 400)
                      const points = pnlCurve.map((p, i) => `${(i / (pnlCurve.length - 1)) * (w - 40) + 20},${80 - (p.pnl / maxVal) * 70}`).join(' ')
                      const isPositive = pnlCurve[pnlCurve.length - 1].pnl >= 0
                      return <>
                        <line x1="0" y1="80" x2={w} y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                        <polyline points={points} fill="none" stroke={isPositive ? '#22d3a0' : '#f05252'} strokeWidth="2.5" />
                        {pnlCurve.map((p, i) => <circle key={i} cx={(i / (pnlCurve.length - 1)) * (w - 40) + 20} cy={80 - (p.pnl / maxVal) * 70} r="4" fill={p.pnl >= 0 ? '#22d3a0' : '#f05252'} />)}
                      </>
                    })()}
                  </svg>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div style={cardStyle}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '20px' }}>⚠️ Pareto des biais</div>
                    {biases.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#7a8299', fontSize: '13px', paddingTop: '20px' }}>Aucun biais détecté 🎉</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {biases.map(([bias, count]) => (
                          <div key={bias}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                              <span style={{ color: '#dfe3ed' }}>{bias}</span>
                              <span style={{ color: '#f87171', fontWeight: '600' }}>{count}×</span>
                            </div>
                            <div style={{ background: '#141920', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                              <div style={{ background: '#f05252', height: '100%', width: `${(count / maxBias) * 100}%`, borderRadius: '4px' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={cardStyle}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '20px' }}>🕐 Heures rentables</div>
                    {hours.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#7a8299', fontSize: '13px' }}>Pas assez de données</div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px' }}>
                        {hours.map(h => (
                          <div key={h.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ fontSize: '9px', color: h.pnl > 0 ? '#22d3a0' : '#f05252', fontWeight: '600' }}>{h.pnl > 0 ? '+' : ''}{h.pnl.toFixed(0)}€</div>
                            <div style={{ width: '100%', background: h.pnl > 0 ? 'rgba(34,211,160,0.8)' : 'rgba(240,82,82,0.8)', borderRadius: '4px 4px 0 0', height: `${(Math.abs(h.pnl) / maxHourPnl) * 80}px`, minHeight: '4px' }} />
                            <div style={{ fontSize: '9px', color: '#7a8299' }}>{h.hour}h</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
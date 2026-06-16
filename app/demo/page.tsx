'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_TRADES = [
  { id: '1', asset: 'EUR/USD', direction: 'LONG', entry_price: 1.0821, exit_price: 1.0847, pnl: 26, emotion_before: 4, emotion_after: 4, followed_plan: true, opened_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', asset: 'XAU/USD', direction: 'SHORT', entry_price: 2345, exit_price: 2312, pnl: 33, emotion_before: 3, emotion_after: 4, followed_plan: true, opened_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', asset: 'EUR/USD', direction: 'SHORT', entry_price: 1.0892, exit_price: 1.0921, pnl: -29, emotion_before: 2, emotion_after: 1, followed_plan: false, opened_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '4', asset: 'BTC/USD', direction: 'LONG', entry_price: 67000, exit_price: 68200, pnl: 120, emotion_before: 4, emotion_after: 5, followed_plan: true, opened_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '5', asset: 'GBP/USD', direction: 'LONG', entry_price: 1.2634, exit_price: 1.2598, pnl: -36, emotion_before: 2, emotion_after: 1, followed_plan: false, opened_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '6', asset: 'XAU/USD', direction: 'LONG', entry_price: 2298, exit_price: 2334, pnl: 36, emotion_before: 3, emotion_after: 4, followed_plan: true, opened_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
]

const DEMO_ANALYSIS = {
  psych_score: 68,
  resume: "Tu as une bonne base mais le revenge trading après tes pertes te coûte cher. 2 trades sur 6 ont été pris sans suivre ton plan — toujours après une perte.",
  conseil_principal: "Mets-toi une règle simple : après une perte, tu attends 30 minutes avant de reprendre une position. Cette seule règle peut améliorer ton score de 15 points.",
  biases: [
    { type: "Revenge Trading", occurrences: 2, description: "Tu reprends une position trop rapidement après une perte pour te refaire.", conseil: "Impose-toi un délai de 30 minutes après chaque perte avant tout nouveau trade." },
    { type: "FOMO", occurrences: 1, description: "Tu as pris une position sans setup validé sur GBP/USD.", conseil: "Pas de setup = pas de trade. Écris tes règles d'entrée et respecte-les à 100%." }
  ],
  strengths: [
    { label: "Bonne gestion des gains", detail: "Tes trades gagnants sont bien tenus jusqu'à l'objectif sans sortie prématurée." },
    { label: "Discipline sur XAU/USD", detail: "Tes 2 trades sur l'or ont suivi le plan et ont été rentables." }
  ]
}

export default function DemoPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'dashboard' | 'journal' | 'analyse'>('dashboard')

  const totalPnl = DEMO_TRADES.reduce((sum, t) => sum + t.pnl, 0)
  const winRate = Math.round((DEMO_TRADES.filter(t => t.pnl > 0).length / DEMO_TRADES.length) * 100)
  const winningTrades = DEMO_TRADES.filter(t => t.pnl > 0).length
  const losingTrades = DEMO_TRADES.filter(t => t.pnl < 0).length

  const cardStyle = { background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }
  const inputStyle = { display: 'block' as const, width: '100%', background: '#141920', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px', color: '#dfe3ed', fontSize: '14px', fontFamily: 'sans-serif', marginTop: '6px' }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif' }}>

      {/* BANNER DEMO */}
      <div style={{ background: 'rgba(0,229,176,0.1)', borderBottom: '1px solid rgba(0,229,176,0.2)', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', color: '#00e5b0' }}>
          🎯 Mode démo — Données fictives pour illustrer la plateforme
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push('/register')} style={{ background: '#00e5b0', border: 'none', borderRadius: '8px', padding: '8px 18px', color: '#000', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
            Créer mon compte gratuit →
          </button>
          <button onClick={() => router.push('/login')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 18px', color: '#7a8299', fontSize: '13px', cursor: 'pointer' }}>
            Se connecter
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 45px)' }}>

        {/* SIDEBAR */}
        <div style={{ width: '220px', background: '#0a0c10', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 12px', flexShrink: 0 }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px', marginBottom: '24px', padding: '0 8px' }}>
            Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
          </div>
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'journal', icon: '📝', label: 'Journal' },
            { id: 'analyse', icon: '🤖', label: 'Analyse IA' },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id as any)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: tab === item.id ? 'rgba(0,229,176,0.1)' : 'transparent', color: tab === item.id ? '#00e5b0' : '#7a8299', fontSize: '14px', cursor: 'pointer', marginBottom: '4px', textAlign: 'left' as const }}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
          <div style={{ marginTop: '16px', padding: '0 8px' }}>
            {['📅 Calendrier P&L', '🗓️ Calendrier Éco.', '📈 Marchés', '📄 Rapport', '⚙️ Paramètres'].map(item => (
              <div key={item} onClick={() => router.push('/register')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 4px', color: '#404760', fontSize: '14px', cursor: 'pointer', marginBottom: '4px', borderRadius: '8px' }}>
                {item} <span style={{ fontSize: '10px', background: 'rgba(0,229,176,0.1)', color: '#00e5b0', padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>Compte requis</span>
              </div>
            ))}
          </div>
        </div>

        {/* CONTENU */}
        <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>

          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Bienvenue sur ton dashboard</div>
                <div style={{ fontSize: '13px', color: '#7a8299' }}>Données de démonstration — crée ton compte pour utiliser tes vrais trades</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                  { label: 'P&L SEMAINE', value: '+150€', color: '#22d3a0' },
                  { label: 'P&L TOTAL', value: `+${totalPnl}€`, color: '#22d3a0' },
                  { label: 'WIN RATE', value: `${winRate}%`, color: '#22d3a0' },
                  { label: 'TRADES', value: String(DEMO_TRADES.length), color: '#dfe3ed' },
                  { label: 'SCORE PSYCHO', value: '68/100', color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} style={cardStyle}>
                    <div style={{ fontSize: '10px', color: '#7a8299', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '8px' }}>{s.label}</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={cardStyle}>
                <div style={{ fontSize: '12px', color: '#7a8299', textTransform: 'uppercase' as const, letterSpacing: '0.6px', marginBottom: '16px', fontWeight: '600' }}>Derniers trades</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Actif', 'Direction', 'P&L', 'Date'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left' as const, color: '#7a8299', fontWeight: '500' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_TRADES.slice(0, 5).map(trade => (
                      <tr key={trade.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: '500' }}>{trade.asset}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ background: trade.direction === 'LONG' ? 'rgba(34,211,160,0.15)' : 'rgba(240,82,82,0.15)', color: trade.direction === 'LONG' ? '#22d3a0' : '#f05252', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>{trade.direction}</span>
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: '600', color: trade.pnl > 0 ? '#22d3a0' : '#f05252' }}>{trade.pnl > 0 ? '+' : ''}{trade.pnl}€</td>
                        <td style={{ padding: '10px 12px', color: '#7a8299' }}>{new Date(trade.opened_at).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* JOURNAL */}
          {tab === 'journal' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Journal de trading</div>
                  <div style={{ fontSize: '13px', color: '#7a8299' }}>Données de démonstration</div>
                </div>
                <button onClick={() => router.push('/register')} style={{ background: '#00e5b0', border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#000', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                  + Ajouter mes vrais trades →
                </button>
              </div>

              <div style={cardStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Actif', 'Direction', 'Entrée', 'Sortie', 'P&L', 'Émotion', 'Plan suivi', 'Date'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left' as const, color: '#7a8299', fontWeight: '500' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_TRADES.map(trade => (
                      <tr key={trade.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{trade.asset}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: trade.direction === 'LONG' ? 'rgba(34,211,160,0.15)' : 'rgba(240,82,82,0.15)', color: trade.direction === 'LONG' ? '#22d3a0' : '#f05252', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>{trade.direction}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{trade.entry_price}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{trade.exit_price}</td>
                        <td style={{ padding: '12px 16px', fontWeight: '600', color: trade.pnl > 0 ? '#22d3a0' : '#f05252' }}>{trade.pnl > 0 ? '+' : ''}{trade.pnl}€</td>
                        <td style={{ padding: '12px 16px' }}>{trade.emotion_before}/5</td>
                        <td style={{ padding: '12px 16px' }}>{trade.followed_plan ? '✅' : '❌'}</td>
                        <td style={{ padding: '12px 16px', color: '#7a8299' }}>{new Date(trade.opened_at).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ANALYSE IA */}
          {tab === 'analyse' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Analyse IA — Exemple</div>
                <div style={{ fontSize: '13px', color: '#7a8299' }}>Voici ce que l'IA détecte sur tes trades</div>
              </div>

              <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #f59e0b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: '#f59e0b' }}>{DEMO_ANALYSIS.psych_score}</div>
                  <div style={{ fontSize: '10px', color: '#7a8299' }}>/100</div>
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '6px' }}>Score psychologique</div>
                  <div style={{ fontSize: '13px', color: '#7a8299', lineHeight: '1.6' }}>{DEMO_ANALYSIS.resume}</div>
                </div>
              </div>

              <div style={{ ...cardStyle, background: 'rgba(0,229,176,0.06)', border: '1px solid rgba(0,229,176,0.2)', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#00e5b0', textTransform: 'uppercase' as const, letterSpacing: '0.6px', marginBottom: '8px' }}>💡 Conseil principal</div>
                <div style={{ fontSize: '14px', color: '#dfe3ed', lineHeight: '1.6' }}>{DEMO_ANALYSIS.conseil_principal}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#7a8299', textTransform: 'uppercase' as const, letterSpacing: '0.6px', marginBottom: '10px' }}>⚠️ Biais détectés</div>
                {DEMO_ANALYSIS.biases.map((bias, i) => (
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

              <div style={{ ...cardStyle, border: '1px solid rgba(34,211,160,0.2)', marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#7a8299', textTransform: 'uppercase' as const, letterSpacing: '0.6px', marginBottom: '10px' }}>✅ Points forts</div>
                {DEMO_ANALYSIS.strengths.map((s, i) => (
                  <div key={i} style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#22d3a0', marginBottom: '4px' }}>{s.label}</div>
                    <div style={{ fontSize: '13px', color: '#7a8299' }}>{s.detail}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(0,229,176,0.08)', border: '1px solid rgba(0,229,176,0.3)', borderRadius: '14px', padding: '24px', textAlign: 'center' as const }}>
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Prêt à analyser tes vrais trades ?</div>
                <div style={{ fontSize: '14px', color: '#7a8299', marginBottom: '20px' }}>Crée ton compte gratuit et lance ta première analyse en 5 minutes.</div>
                <button onClick={() => router.push('/register')} style={{ background: '#00e5b0', border: 'none', borderRadius: '10px', padding: '12px 32px', color: '#000', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
                  Créer mon compte gratuit →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
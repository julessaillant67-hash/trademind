'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function JournalPage() {
  const [showForm, setShowForm] = useState(false)
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingTrade, setEditingTrade] = useState<any>(null)
  const [form, setForm] = useState({
    asset: '', direction: 'LONG', entry_price: '', exit_price: '',
    lot_size: '', pnl: '', emotion_before: '3', emotion_after: '3',
    followed_plan: true, notes: '', tradingview_url: '', opened_at: new Date().toISOString().slice(0, 16),
  })

  const supabase = createClient()

  useEffect(() => { loadTrades() }, [])

  async function loadTrades() {
    const { data } = await supabase.from('trades').select('*').order('opened_at', { ascending: false })
    if (data) setTrades(data)
  }

  function calculerPnl(asset: string, direction: string, entry: string, exit: string, lot: string) {
    if (!entry || !exit || !lot) return ''
    const entryPrice = parseFloat(entry)
    const exitPrice = parseFloat(exit)
    const lotSize = parseFloat(lot)
    if (isNaN(entryPrice) || isNaN(exitPrice) || isNaN(lotSize)) return ''
    const diff = direction === 'LONG' ? exitPrice - entryPrice : entryPrice - exitPrice
    const a = asset.toUpperCase()
    let pipSize = 0.0001
    let pipsValue = 10
    if (a.includes('JPY')) { pipSize = 0.01; pipsValue = 1000 }
    if (a.includes('XAU') || a === 'OR' || a === 'GOLD') { pipSize = 0.1; pipsValue = 10 }
    if (a.includes('BTC')) { pipSize = 1; pipsValue = 1 }
    if (a.includes('ETH')) { pipSize = 0.1; pipsValue = 1 }
    if (a.includes('NAS') || a.includes('SPX') || a.includes('DAX') || a.includes('CAC')) { pipSize = 1; pipsValue = 1 }
    const pips = diff / pipSize
    return (pips * pipsValue * lotSize).toFixed(2)
  }

  function openAddForm() {
    setEditingTrade(null)
    setForm({ asset: '', direction: 'LONG', entry_price: '', exit_price: '', lot_size: '', pnl: '', emotion_before: '3', emotion_after: '3', followed_plan: true, notes: '', tradingview_url: '', opened_at: new Date().toISOString().slice(0, 16) })
    setShowForm(true)
  }

  function openEditForm(trade: any) {
    setEditingTrade(trade)
    setForm({
      asset: trade.asset || '', direction: trade.direction || 'LONG',
      entry_price: trade.entry_price?.toString() || '', exit_price: trade.exit_price?.toString() || '',
      lot_size: trade.lot_size?.toString() || '', pnl: trade.pnl?.toString() || '',
      emotion_before: trade.emotion_before?.toString() || '3', emotion_after: trade.emotion_after?.toString() || '3',
      followed_plan: trade.followed_plan ?? true, notes: trade.notes || '', tradingview_url: trade.tradingview_url || '',
      opened_at: trade.opened_at ? new Date(trade.opened_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    })
    setShowForm(true)
  }

  async function handleSubmit() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = {
      user_id: user.id, asset: form.asset, direction: form.direction,
      entry_price: parseFloat(form.entry_price),
      exit_price: form.exit_price ? parseFloat(form.exit_price) : null,
      lot_size: form.lot_size ? parseFloat(form.lot_size) : null,
      pnl: form.pnl ? parseFloat(form.pnl) : null,
      emotion_before: parseInt(form.emotion_before), emotion_after: parseInt(form.emotion_after),
      followed_plan: form.followed_plan, notes: form.notes, tradingview_url: form.tradingview_url || null,
      opened_at: new Date(form.opened_at).toISOString(), source: 'manual'
    }
    if (editingTrade) {
      await supabase.from('trades').update(payload).eq('id', editingTrade.id)
    } else {
      await supabase.from('trades').insert(payload)
    }
    setShowForm(false)
    setEditingTrade(null)
    loadTrades()
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce trade ?')) return
    await supabase.from('trades').delete().eq('id', id)
    loadTrades()
  }

  const pnlAuto = calculerPnl(form.asset, form.direction, form.entry_price, form.exit_price, form.lot_size)

  const inputStyle = { width: '100%', background: '#141920', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px', color: '#dfe3ed', fontSize: '14px', outline: 'none', fontFamily: 'sans-serif' }
  const labelStyle = { color: '#7a8299', fontSize: '13px', display: 'block' as const, marginBottom: '6px' }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px' }}>
              Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
            </div>
            <div style={{ color: '#7a8299', marginTop: '4px' }}>Journal de trading</div>
          </div>
          <button onClick={openAddForm} style={{ background: '#00e5b0', border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#000', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
            + Ajouter un trade
          </button>
        </div>

        {showForm && (
          <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '20px' }}>
              {editingTrade ? '✏️ Modifier le trade' : '+ Nouveau trade'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Actif</label>
                <input style={inputStyle} placeholder="EUR/USD, XAU/USD, BTC..." value={form.asset} onChange={e => setForm({...form, asset: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Direction</label>
                <select style={inputStyle} value={form.direction} onChange={e => setForm({...form, direction: e.target.value})}>
                  <option value="LONG">LONG</option>
                  <option value="SHORT">SHORT</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Lot / Taille</label>
                <input style={inputStyle} placeholder="0.10" value={form.lot_size} onChange={e => setForm({...form, lot_size: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Prix d'entrée</label>
                <input style={inputStyle} placeholder="1.0821" value={form.entry_price} onChange={e => setForm({...form, entry_price: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Prix de sortie</label>
                <input style={inputStyle} placeholder="1.0847" value={form.exit_price} onChange={e => setForm({...form, exit_price: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>P&L (€) — calculé auto</label>
                <input
                  style={{...inputStyle, background: form.pnl && parseFloat(form.pnl) > 0 ? 'rgba(34,211,160,0.08)' : form.pnl && parseFloat(form.pnl) < 0 ? 'rgba(240,82,82,0.08)' : '#141920'}}
                  placeholder="Calculé automatiquement"
                  value={form.pnl}
                  onChange={e => setForm({...form, pnl: e.target.value})}
                  onBlur={() => { if (!form.pnl && pnlAuto) setForm(f => ({...f, pnl: pnlAuto})) }}
                />
                {pnlAuto && (
                  <div style={{ fontSize: '11px', color: '#7a8299', marginTop: '4px' }}>
                    Estimé : <span style={{ color: parseFloat(pnlAuto) > 0 ? '#22d3a0' : '#f05252', fontWeight: '600' }}>{parseFloat(pnlAuto) > 0 ? '+' : ''}{pnlAuto}€</span>
                    <button onClick={() => setForm(f => ({...f, pnl: pnlAuto}))} style={{ marginLeft: '8px', background: 'rgba(0,229,176,0.1)', border: '1px solid rgba(0,229,176,0.2)', borderRadius: '4px', padding: '1px 6px', color: '#00e5b0', fontSize: '10px', cursor: 'pointer' }}>
                      Utiliser
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Date / Heure</label>
                <input type="datetime-local" style={inputStyle} value={form.opened_at} onChange={e => setForm({...form, opened_at: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Émotion avant (1-5)</label>
                <select style={inputStyle} value={form.emotion_before} onChange={e => setForm({...form, emotion_before: e.target.value})}>
                  <option value="1">1 — Très stressé</option>
                  <option value="2">2 — Stressé</option>
                  <option value="3">3 — Neutre</option>
                  <option value="4">4 — Confiant</option>
                  <option value="5">5 — Très confiant</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Émotion après (1-5)</label>
                <select style={inputStyle} value={form.emotion_after} onChange={e => setForm({...form, emotion_after: e.target.value})}>
                  <option value="1">1 — Très frustré</option>
                  <option value="2">2 — Frustré</option>
                  <option value="3">3 — Neutre</option>
                  <option value="4">4 — Satisfait</option>
                  <option value="5">5 — Très satisfait</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Notes</label>
              <textarea style={{...inputStyle, height: '80px', resize: 'none'}} placeholder="Setup utilisé, observations..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>🔗 Lien analyse TradingView</label>
              <input style={inputStyle} placeholder="https://www.tradingview.com/chart/..." value={form.tradingview_url || ''} onChange={e => setForm({...form, tradingview_url: e.target.value})} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <input type="checkbox" checked={form.followed_plan} onChange={e => setForm({...form, followed_plan: e.target.checked})} />
              <label style={{ color: '#7a8299', fontSize: '13px' }}>J'ai suivi mon plan de trading</label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSubmit} disabled={loading} style={{ background: '#00e5b0', border: 'none', borderRadius: '8px', padding: '10px 24px', color: '#000', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                {loading ? 'Enregistrement...' : editingTrade ? 'Mettre à jour' : 'Enregistrer'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 24px', color: '#7a8299', fontSize: '14px', cursor: 'pointer' }}>
                Annuler
              </button>
            </div>
          </div>
        )}

        <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
          {trades.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#7a8299' }}>
              Aucun trade enregistré. Clique sur "Ajouter un trade" pour commencer.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Actif', 'Direction', 'Entrée', 'Sortie', 'P&L', 'Émotion', 'Date', 'Analyse', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#7a8299', fontWeight: '500' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map(trade => (
                  <tr key={trade.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{trade.asset}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: trade.direction === 'LONG' ? 'rgba(34,211,160,0.15)' : 'rgba(240,82,82,0.15)', color: trade.direction === 'LONG' ? '#22d3a0' : '#f05252', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                        {trade.direction}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{trade.entry_price}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{trade.exit_price || '—'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: trade.pnl > 0 ? '#22d3a0' : trade.pnl < 0 ? '#f05252' : '#dfe3ed' }}>
                      {trade.pnl ? `${trade.pnl > 0 ? '+' : ''}${trade.pnl}€` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>{trade.emotion_before}/5</td>
                    <td style={{ padding: '12px 16px', color: '#7a8299' }}>{new Date(trade.opened_at).toLocaleDateString('fr-FR')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {trade.tradingview_url ? (
                        <a href={trade.tradingview_url} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '6px', padding: '4px 10px', color: '#3b82f6', fontSize: '12px', textDecoration: 'none', fontWeight: '500' }}>
                          📈 Voir
                        </a>
                      ) : (
                        <span style={{ color: '#404760', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openEditForm(trade)} style={{ background: 'rgba(0,229,176,0.1)', border: '1px solid rgba(0,229,176,0.2)', borderRadius: '6px', padding: '4px 10px', color: '#00e5b0', fontSize: '12px', cursor: 'pointer' }}>
                          ✏️ Modifier
                        </button>
                        <button onClick={() => handleDelete(trade.id)} style={{ background: 'rgba(240,82,82,0.1)', border: '1px solid rgba(240,82,82,0.2)', borderRadius: '6px', padding: '4px 10px', color: '#f05252', fontSize: '12px', cursor: 'pointer' }}>
                          🗑️ Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
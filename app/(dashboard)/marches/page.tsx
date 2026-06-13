'use client'

import { useState } from 'react'

const WIDGETS = [
  { symbol: 'FX:EURUSD', label: 'EUR/USD', category: 'Forex' },
  { symbol: 'FX:GBPUSD', label: 'GBP/USD', category: 'Forex' },
  { symbol: 'FX:USDJPY', label: 'USD/JPY', category: 'Forex' },
  { symbol: 'OANDA:XAUUSD', label: 'Or (XAU/USD)', category: 'Matières' },
  { symbol: 'BINANCE:BTCUSDT', label: 'Bitcoin', category: 'Crypto' },
  { symbol: 'BINANCE:ETHUSDT', label: 'Ethereum', category: 'Crypto' },
  { symbol: 'NASDAQ:QQQ', label: 'Nasdaq', category: 'Indices' },
  { symbol: 'SP:SPX', label: 'S&P 500', category: 'Indices' },
]

export default function MarchesPage() {
  const [selected, setSelected] = useState(WIDGETS[0])
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', padding: fullscreen ? '0' : '40px' }}>
      {!fullscreen && (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px' }}>
              Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
            </div>
            <div style={{ color: '#7a8299', marginTop: '4px' }}>Marchés — Graphiques en direct</div>
          </div>

          {/* Sélecteur d'actifs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {WIDGETS.map(w => (
              <button
                key={w.symbol}
                onClick={() => setSelected(w)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                  background: selected.symbol === w.symbol ? '#00e5b0' : '#0e1117',
                  color: selected.symbol === w.symbol ? '#000' : '#7a8299',
                  border: `1px solid ${selected.symbol === w.symbol ? '#00e5b0' : 'rgba(255,255,255,0.08)'}`,
                  fontWeight: selected.symbol === w.symbol ? '600' : '400'
                }}
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* Graphique principal */}
          <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>📈 {selected.label}</div>
              <button
                onClick={() => setFullscreen(true)}
                style={{ background: 'rgba(0,229,176,0.1)', border: '1px solid rgba(0,229,176,0.2)', borderRadius: '6px', padding: '6px 14px', color: '#00e5b0', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
              >
                ⛶ Plein écran
              </button>
            </div>
            <iframe
              src={`https://s.tradingview.com/widgetembed/?symbol=${selected.symbol}&interval=15&theme=dark&style=1&timezone=Europe%2FParis&withdateranges=1&hideideas=1&toolbarbg=0e1117`}
              style={{ width: '100%', height: '500px', border: 'none', display: 'block' }}
              allowTransparency={true}
              frameBorder="0"
            />
          </div>

          {/* Petits graphiques */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {WIDGETS.filter(w => w.symbol !== selected.symbol).slice(0, 4).map(w => (
              <div
                key={w.symbol}
                style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => setSelected(w)}
              >
                <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '13px', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{w.label}</span>
                  <span style={{ fontSize: '11px', color: '#00e5b0' }}>Agrandir →</span>
                </div>
                <iframe
                  src={`https://s.tradingview.com/widgetembed/?symbol=${w.symbol}&interval=15&theme=dark&style=1&timezone=Europe%2FParis&withdateranges=0&hideideas=1&hidetoptoolbar=1&hidesidetoolbar=1&toolbarbg=0e1117`}
                  style={{ width: '100%', height: '200px', border: 'none', display: 'block' }}
                  allowTransparency={true}
                  frameBorder="0"
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '12px', fontSize: '11px', color: '#404760', textAlign: 'center' }}>
            Graphiques fournis par <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00e5b0' }}>TradingView</a>
          </div>
        </div>
      )}

      {/* MODE PLEIN ECRAN */}
      {fullscreen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#080a0d', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 16px', background: '#0e1117', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {WIDGETS.map(w => (
                <button
                  key={w.symbol}
                  onClick={() => setSelected(w)}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                    background: selected.symbol === w.symbol ? '#00e5b0' : '#141920',
                    color: selected.symbol === w.symbol ? '#000' : '#7a8299',
                    border: `1px solid ${selected.symbol === w.symbol ? '#00e5b0' : 'rgba(255,255,255,0.08)'}`,
                    fontWeight: selected.symbol === w.symbol ? '600' : '400'
                  }}
                >
                  {w.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setFullscreen(false)}
              style={{ background: 'rgba(240,82,82,0.1)', border: '1px solid rgba(240,82,82,0.2)', borderRadius: '6px', padding: '6px 14px', color: '#f05252', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
            >
              ✕ Fermer
            </button>
          </div>
          <iframe
            src={`https://s.tradingview.com/widgetembed/?symbol=${selected.symbol}&interval=15&theme=dark&style=1&timezone=Europe%2FParis&withdateranges=1&hideideas=1&toolbarbg=0e1117`}
            style={{ flex: 1, border: 'none', display: 'block' }}
            allowTransparency={true}
            frameBorder="0"
          />
        </div>
      )}
    </div>
  )
}
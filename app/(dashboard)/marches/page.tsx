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

const SYMBOL_MAP: Record<string, string> = {
  'eurusd': 'FX:EURUSD', 'eur/usd': 'FX:EURUSD',
  'gbpusd': 'FX:GBPUSD', 'gbp/usd': 'FX:GBPUSD',
  'usdjpy': 'FX:USDJPY', 'usd/jpy': 'FX:USDJPY',
  'xauusd': 'OANDA:XAUUSD', 'xau/usd': 'OANDA:XAUUSD', 'or': 'OANDA:XAUUSD', 'gold': 'OANDA:XAUUSD',
  'btc': 'BINANCE:BTCUSDT', 'bitcoin': 'BINANCE:BTCUSDT', 'btcusdt': 'BINANCE:BTCUSDT',
  'eth': 'BINANCE:ETHUSDT', 'ethereum': 'BINANCE:ETHUSDT',
  'nasdaq': 'NASDAQ:QQQ', 'nas100': 'NASDAQ:QQQ',
  'sp500': 'SP:SPX', 's&p500': 'SP:SPX', 'spx': 'SP:SPX',
  'usdcad': 'FX:USDCAD', 'usd/cad': 'FX:USDCAD',
  'audusd': 'FX:AUDUSD', 'aud/usd': 'FX:AUDUSD',
  'usdchf': 'FX:USDCHF', 'usd/chf': 'FX:USDCHF',
  'nzdusd': 'FX:NZDUSD', 'nzd/usd': 'FX:NZDUSD',
  'eurgbp': 'FX:EURGBP', 'eur/gbp': 'FX:EURGBP',
  'dax': 'XETR:DAX', 'cac40': 'EURONEXT:PX1',
  'oil': 'NYMEX:CL1!', 'wti': 'NYMEX:CL1!', 'petrole': 'NYMEX:CL1!',
  'dxy': 'TVC:DXY', 'dollar index': 'TVC:DXY',
'dji': 'DJ:DJI', 'dow jones': 'DJ:DJI',
'ftse': 'SPREADEX:FTSE', 'ftse100': 'SPREADEX:FTSE',
'nikkei': 'TVC:NI225',
'silver': 'TVC:SILVER', 'argent': 'TVC:SILVER', 'xagusd': 'TVC:SILVER',
'usoil': 'TVC:USOIL', 'brent': 'TVC:UKOIL',
'natgas': 'NYMEX:NG1!', 'gaz naturel': 'NYMEX:NG1!',
'copper': 'COMEX:HG1!', 'cuivre': 'COMEX:HG1!',
'usdjpy': 'FX:USDJPY', 'eurjpy': 'FX:EURJPY', 'eur/jpy': 'FX:EURJPY',
'gbpjpy': 'FX:GBPJPY', 'gbp/jpy': 'FX:GBPJPY',
'xrp': 'BINANCE:XRPUSDT', 'sol': 'BINANCE:SOLUSDT', 'solana': 'BINANCE:SOLUSDT',
'bnb': 'BINANCE:BNBUSDT', 'ada': 'BINANCE:ADAUSDT',
'aapl': 'NASDAQ:AAPL', 'apple': 'NASDAQ:AAPL',
'tsla': 'NASDAQ:TSLA', 'tesla': 'NASDAQ:TSLA',
'nvda': 'NASDAQ:NVDA', 'nvidia': 'NASDAQ:NVDA',
}

export default function MarchesPage() {
  const [selected, setSelected] = useState(WIDGETS[0])
  const [fullscreen, setFullscreen] = useState(false)
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState<string | null>(null)
  const [searchError, setSearchError] = useState(false)
  const [category, setCategory] = useState('Tous')

  const categories = ['Tous', 'Forex', 'Crypto', 'Indices', 'Matières']

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const query = search.toLowerCase().trim()
    const symbol = SYMBOL_MAP[query] || (query.includes(':') ? query.toUpperCase() : null)
    if (symbol) {
      setSearchResult(symbol)
      setSearchError(false)
      setSearch('')
    } else {
      setSearchError(true)
    }
  }

  const filteredWidgets = category === 'Tous' ? WIDGETS : WIDGETS.filter(w => w.category === category)
  const activeSymbol = searchResult || selected.symbol

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

          {/* BARRE DE RECHERCHE */}
          <form onSubmit={handleSearch} style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setSearchError(false) }}
                placeholder="🔍 Recherche un actif — EUR/USD, BTC, Or, Nasdaq..."
                style={{
                  width: '100%', background: '#0e1117',
                  border: `1px solid ${searchError ? '#f05252' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '10px', padding: '12px 16px',
                  color: '#dfe3ed', fontSize: '14px', outline: 'none',
                  fontFamily: 'sans-serif'
                }}
              />
              {searchError && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', fontSize: '12px', color: '#f87171' }}>
                  Actif non trouvé — essaie EUR/USD, XAU/USD, BTC, Nasdaq...
                </div>
              )}
            </div>
            {searchResult && (
              <button type="button" onClick={() => { setSearchResult(null); setSearch('') }} style={{ background: '#141920', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 16px', color: '#7a8299', fontSize: '13px', cursor: 'pointer' }}>
                ✕ Effacer
              </button>
            )}
          </form>

          {/* FILTRES CATEGORIE */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', background: category === c ? '#00e5b0' : '#0e1117', color: category === c ? '#000' : '#7a8299', border: `1px solid ${category === c ? '#00e5b0' : 'rgba(255,255,255,0.08)'}`, fontWeight: category === c ? '600' : '400' }}>
                {c}
              </button>
            ))}
          </div>

          {/* GRAPHIQUE PRINCIPAL */}
          <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                📈 {searchResult ? searchResult : selected.label}
                {searchResult && <span style={{ fontSize: '11px', color: '#00e5b0', marginLeft: '8px', background: 'rgba(0,229,176,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Résultat de recherche</span>}
              </div>
              <button onClick={() => setFullscreen(true)} style={{ background: 'rgba(0,229,176,0.1)', border: '1px solid rgba(0,229,176,0.2)', borderRadius: '6px', padding: '6px 14px', color: '#00e5b0', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                ⛶ Plein écran
              </button>
            </div>
            <iframe
              src={`https://s.tradingview.com/widgetembed/?symbol=${activeSymbol}&interval=15&theme=dark&style=1&timezone=Europe%2FParis&withdateranges=1&hideideas=1&toolbarbg=0e1117`}
              style={{ width: '100%', height: '500px', border: 'none', display: 'block' }}
              frameBorder="0"
            />
          </div>

          {/* PETITS GRAPHIQUES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {WIDGETS.filter(w => w.symbol !== activeSymbol).slice(0, 4).map(w => (
              <div key={w.symbol} style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => { setSelected(w); setSearchResult(null) }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '13px', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{w.label}</span>
                  <span style={{ fontSize: '11px', color: '#00e5b0' }}>Agrandir →</span>
                </div>
                <iframe
                  src={`https://s.tradingview.com/widgetembed/?symbol=${w.symbol}&interval=15&theme=dark&style=1&timezone=Europe%2FParis&withdateranges=0&hideideas=1&hidetoptoolbar=1&hidesidetoolbar=1&toolbarbg=0e1117`}
                  style={{ width: '100%', height: '200px', border: 'none', display: 'block' }}
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

      {fullscreen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#080a0d', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 16px', background: '#0e1117', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {WIDGETS.map(w => (
                <button key={w.symbol} onClick={() => { setSelected(w); setSearchResult(null) }} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', background: selected.symbol === w.symbol && !searchResult ? '#00e5b0' : '#141920', color: selected.symbol === w.symbol && !searchResult ? '#000' : '#7a8299', border: `1px solid ${selected.symbol === w.symbol && !searchResult ? '#00e5b0' : 'rgba(255,255,255,0.08)'}`, fontWeight: selected.symbol === w.symbol && !searchResult ? '600' : '400' }}>
                  {w.label}
                </button>
              ))}
            </div>
            <button onClick={() => setFullscreen(false)} style={{ background: 'rgba(240,82,82,0.1)', border: '1px solid rgba(240,82,82,0.2)', borderRadius: '6px', padding: '6px 14px', color: '#f05252', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
              ✕ Fermer
            </button>
          </div>
          <iframe
            src={`https://s.tradingview.com/widgetembed/?symbol=${activeSymbol}&interval=15&theme=dark&style=1&timezone=Europe%2FParis&withdateranges=1&hideideas=1&toolbarbg=0e1117`}
            style={{ flex: 1, border: 'none', display: 'block' }}
            frameBorder="0"
          />
        </div>
      )}
    </div>
  )
}
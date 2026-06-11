export default function MarchesPage() {
  const widgets = [
    { symbol: 'FX:EURUSD', label: 'EUR/USD' },
    { symbol: 'FX:GBPUSD', label: 'GBP/USD' },
    { symbol: 'OANDA:XAUUSD', label: 'Or (XAU/USD)' },
    { symbol: 'BINANCE:BTCUSDT', label: 'Bitcoin' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px' }}>
            Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
          </div>
          <div style={{ color: '#7a8299', marginTop: '4px' }}>Marchés — Graphiques en direct</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {widgets.map(w => (
            <div key={w.symbol} style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#dfe3ed', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                📈 {w.label}
              </div>
              <iframe
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${w.symbol.replace(':', '_')}&symbol=${w.symbol}&interval=15&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=1&saveimage=0&toolbarbg=1a1a2e&theme=dark&style=1&timezone=Europe%2FParis&withdateranges=1&hideideas=1`}
                style={{ width: '100%', height: '300px', border: 'none', display: 'block' }}
                allowTransparency={true}
                frameBorder="0"
              />
            </div>
          ))}
        </div>

        <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#dfe3ed', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            📊 Vue principale — EUR/USD
          </div>
          <iframe
            src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_main&symbol=FX:EURUSD&interval=60&hidesidetoolbar=0&hidetoptoolbar=0&symboledit=1&saveimage=0&toolbarbg=1a1a2e&theme=dark&style=1&timezone=Europe%2FParis&withdateranges=1&hideideas=1"
            style={{ width: '100%', height: '500px', border: 'none', display: 'block' }}
            allowTransparency={true}
            frameBorder="0"
          />
        </div>

        <div style={{ marginTop: '12px', fontSize: '11px', color: '#404760', textAlign: 'center' }}>
          Graphiques fournis par <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00e5b0' }}>TradingView</a>
        </div>

      </div>
    </div>
  )
}
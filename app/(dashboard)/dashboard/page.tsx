export default function DashboardPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080a0d',
      color: '#dfe3ed',
      fontFamily: 'sans-serif',
      padding: '40px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#00e5b0',
          letterSpacing: '-1px',
          marginBottom: '8px'
        }}>
          Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
        </div>
        <div style={{ color: '#7a8299', marginBottom: '40px' }}>
          Bienvenue sur ton dashboard
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {[
            { label: 'P&L ce mois', value: '+0€', color: '#22d3a0' },
            { label: 'Win Rate', value: '0%', color: '#dfe3ed' },
            { label: 'Trades', value: '0', color: '#dfe3ed' },
            { label: 'Score psycho', value: '--/100', color: '#f59e0b' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: '#0e1117',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '12px', color: '#7a8299', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: '#0e1117',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          color: '#7a8299'
        }}>
          Ajoute ton premier trade pour commencer l'analyse IA
        </div>
      </div>
    </div>
  )
}
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '22px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px' }}>
          Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/login" style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#7a8299', textDecoration: 'none', fontSize: '14px' }}>
            Se connecter
          </Link>
          <Link href="/register" style={{ padding: '8px 18px', borderRadius: '8px', background: '#00e5b0', color: '#000', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
            Essai gratuit
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: '80px 40px 60px' }}>
        <div style={{ display: 'inline-block', background: 'rgba(0,229,176,0.1)', border: '1px solid rgba(0,229,176,0.2)', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: '#00e5b0', marginBottom: '24px', fontWeight: '500' }}>
          🤖 Propulsé par Claude AI
        </div>
        <h1 style={{ fontSize: '52px', fontWeight: '700', lineHeight: '1.15', marginBottom: '20px', maxWidth: '700px', margin: '0 auto 20px' }}>
          Le coach trading IA qui analyse{' '}
          <span style={{ color: '#00e5b0' }}>tes erreurs</span>
          {' '}à ta place
        </h1>
        <p style={{ fontSize: '18px', color: '#7a8299', maxWidth: '500px', margin: '0 auto 40px', lineHeight: '1.7' }}>
          TradeMind détecte tes biais psychologiques, analyse tes trades et t'aide à progresser. Fini les pertes inexpliquées.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ padding: '14px 32px', borderRadius: '10px', background: '#00e5b0', color: '#000', textDecoration: 'none', fontSize: '16px', fontWeight: '700' }}>
            Commencer gratuitement →
          </Link>
          <Link href="/login" style={{ padding: '14px 32px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', color: '#dfe3ed', textDecoration: 'none', fontSize: '16px' }}>
            Se connecter
          </Link>
        </div>
      </div>

      {/* PROBLEME */}
      <div style={{ background: '#0e1117', padding: '60px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '16px' }}>
          Tu ouvres combien d'onglets chaque matin ?
        </h2>
        <p style={{ color: '#7a8299', marginBottom: '40px', fontSize: '16px' }}>La plupart des traders jonglent entre 5 outils différents.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
          {['TradingView', 'Investing.com', 'Forex Factory', 'Journal Excel', 'Discord'].map(tool => (
            <div key={tool} style={{ background: '#141920', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 18px', fontSize: '14px', color: '#7a8299' }}>
              ❌ {tool}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '32px', color: '#00e5b0', fontWeight: '700' }}>↓</div>
        <div style={{ background: 'rgba(0,229,176,0.06)', border: '1px solid rgba(0,229,176,0.2)', borderRadius: '12px', padding: '20px 32px', display: 'inline-block', marginTop: '16px', fontSize: '18px', fontWeight: '600' }}>
          ✅ TradeMind — tout en un seul endroit
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ padding: '80px 40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '600', textAlign: 'center', marginBottom: '48px' }}>
          Ce que TradeMind fait pour toi
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
          {[
            { icon: '🧠', title: 'Détection des biais IA', desc: 'Revenge trading, FOMO, overtrading — l\'IA analyse tes patterns et te dit exactement ce qui te coûte de l\'argent.' },
            { icon: '📊', title: 'Journal intelligent', desc: 'Enregistre tes trades en 30 secondes. Import CSV MT4/MT5. Toutes tes stats en un coup d\'œil.' },
            { icon: '🎯', title: 'Score psychologique', desc: 'Un score sur 100 qui évolue chaque semaine. Tu sais exactement où tu en es dans ta progression.' },
            { icon: '📅', title: 'Calendrier économique', desc: 'NFP, CPI, FOMC — filtré selon tes actifs. Alertes 15 minutes avant chaque événement important.' },
            { icon: '📰', title: 'Actualités scorées', desc: 'L\'IA résume les news et t\'explique en 2 lignes l\'impact sur tes marchés. Plus besoin de Bloomberg.' },
            { icon: '📄', title: 'Rapport hebdo PDF', desc: 'Chaque lundi, un rapport complet de ta semaine. Partage tes progrès avec ta communauté.' },
          ].map(f => (
            <div key={f.title} style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#dfe3ed' }}>{f.title}</div>
              <div style={{ fontSize: '14px', color: '#7a8299', lineHeight: '1.6' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div style={{ background: '#0e1117', padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '12px' }}>Tarifs simples et transparents</h2>
        <p style={{ color: '#7a8299', marginBottom: '48px', fontSize: '16px' }}>Commence gratuitement, upgrade quand tu es prêt.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { name: 'Free', price: '0€', desc: 'Pour découvrir', color: '#7a8299' },
            { name: 'Starter', price: '9,99€', desc: 'Pour progresser', color: '#00e5b0' },
            { name: 'Pro', price: '24,99€', desc: 'Pour les sérieux', color: '#3b82f6', popular: true },
            { name: 'Elite', price: '49,99€', desc: 'Pour les pros', color: '#f59e0b' },
          ].map(p => (
            <div key={p.name} style={{ background: '#141920', border: `1px solid ${p.popular ? p.color : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '24px', position: 'relative' }}>
              {p.popular && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: p.color, color: '#000', fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>POPULAIRE</div>}
              <div style={{ fontSize: '16px', fontWeight: '600', color: p.color, marginBottom: '8px' }}>{p.name}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{p.price}</div>
              <div style={{ fontSize: '12px', color: '#7a8299' }}>/mois</div>
              <div style={{ fontSize: '13px', color: '#7a8299', marginTop: '8px' }}>{p.desc}</div>
            </div>
          ))}
        </div>
        <Link href="/register" style={{ display: 'inline-block', marginTop: '40px', padding: '14px 40px', borderRadius: '10px', background: '#00e5b0', color: '#000', textDecoration: 'none', fontSize: '16px', fontWeight: '700' }}>
          Commencer gratuitement →
        </Link>
      </div>

      {/* FOOTER */}
      <div style={{ padding: '40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#404760', fontSize: '13px' }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#00e5b0', marginBottom: '8px' }}>
          Trade<span style={{ color: '#404760', fontWeight: '400' }}>Mind</span>
        </div>
        © 2025 TradeMind — Tous droits réservés
      </div>

    </div>
  )
}

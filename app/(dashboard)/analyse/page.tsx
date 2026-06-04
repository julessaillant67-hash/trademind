'use client'

import { useState } from 'react'

export default function AnalysePage() {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState('')

  async function lancerAnalyse() {
    setLoading(true)
    setError('')
    setAnalysis(null)

    try {
      const res = await fetch('/api/ai/analyse', { method: 'POST' })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setAnalysis(data)
      }
    } catch (e) {
      setError('Erreur de connexion')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px' }}>
            Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
          </div>
          <div style={{ color: '#7a8299', marginTop: '4px' }}>Analyse IA — Détection des biais psychologiques</div>
        </div>

        <button
          onClick={lancerAnalyse}
          disabled={loading}
          style={{
            background: loading ? '#1a2030' : '#00e5b0',
            border: 'none',
            borderRadius: '10px',
            padding: '14px 32px',
            color: loading ? '#7a8299' : '#000',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {loading ? '🤖 Analyse en cours...' : '🤖 Lancer l\'analyse IA'}
        </button>

        {error && (
          <div style={{ background: 'rgba(240,82,82,0.1)', border: '1px solid rgba(240,82,82,0.3)', borderRadius: '10px', padding: '14px 18px', color: '#f87171', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {analysis && (
          <div>
            {/* Score psychologique */}
            <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                border: `3px solid ${analysis.psych_score >= 70 ? '#22d3a0' : analysis.psych_score >= 40 ? '#f59e0b' : '#f05252'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <div style={{ fontSize: '22px', fontWeight: '700', color: analysis.psych_score >= 70 ? '#22d3a0' : analysis.psych_score >= 40 ? '#f59e0b' : '#f05252' }}>
                  {analysis.psych_score}
                </div>
                <div style={{ fontSize: '10px', color: '#7a8299' }}>/100</div>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '6px' }}>Score psychologique</div>
                <div style={{ fontSize: '13px', color: '#7a8299', lineHeight: '1.6' }}>{analysis.resume}</div>
              </div>
            </div>

            {/* Conseil principal */}
            <div style={{ background: 'rgba(0,229,176,0.06)', border: '1px solid rgba(0,229,176,0.2)', borderRadius: '12px', padding: '18px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#00e5b0', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                💡 Conseil principal
              </div>
              <div style={{ fontSize: '14px', color: '#dfe3ed', lineHeight: '1.6' }}>{analysis.conseil_principal}</div>
            </div>

            {/* Biais détectés */}
            {analysis.biases && analysis.biases.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
                  ⚠️ Biais détectés
                </div>
                {analysis.biases.map((bias: any, i: number) => (
                  <div key={i} style={{ background: '#0e1117', border: '1px solid rgba(240,82,82,0.2)', borderRadius: '10px', padding: '16px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#f87171' }}>{bias.type}</div>
                      <div style={{ fontSize: '11px', background: 'rgba(240,82,82,0.15)', color: '#f87171', padding: '2px 8px', borderRadius: '4px' }}>
                        {bias.occurrences}× détecté
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#7a8299', marginBottom: '8px', lineHeight: '1.5' }}>{bias.description}</div>
                    <div style={{ fontSize: '13px', color: '#dfe3ed', lineHeight: '1.5' }}>
                      <span style={{ color: '#00e5b0' }}>→ </span>{bias.conseil}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Points forts */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#7a8299', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
                  ✅ Points forts
                </div>
                {analysis.strengths.map((s: any, i: number) => (
                  <div key={i} style={{ background: '#0e1117', border: '1px solid rgba(34,211,160,0.2)', borderRadius: '10px', padding: '16px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#22d3a0', marginBottom: '6px' }}>{s.label}</div>
                    <div style={{ fontSize: '13px', color: '#7a8299', lineHeight: '1.5' }}>{s.detail}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
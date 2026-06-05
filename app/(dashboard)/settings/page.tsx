'use client'

import { useState } from 'react'

const plans = [
  {
    name: 'Free',
    price: '0€',
    priceId: '',
    features: ['50 trades/mois', 'Stats de base', 'Sans analyse IA', 'Sans rapport PDF'],
    color: '#7a8299',
    isFree: true
  },
  {
    name: 'Starter',
    price: '9,99€',
    priceId: 'price_1TezIiKMTLb6K3pJEiQ2IMLL',
    features: ['Trades illimités', 'Analyse IA biais', 'Score psychologique', 'Rapport PDF hebdo'],
    color: '#00e5b0'
  },
  {
    name: 'Pro',
    price: '24,99€',
    priceId: 'price_1TezJgKMTLb6K3pJN6wQlQik',
    features: ['Tout Starter', 'Calendrier économique', 'Analyse fondamentale', 'Alertes événements', 'Actualités IA'],
    color: '#3b82f6',
    popular: true
  },
  {
    name: 'Elite',
    price: '49,99€',
    priceId: 'price_1TezK8KMTLb6K3pJ7EduI9uQ',
    features: ['Tout Pro', 'Cours live', 'Watchlist', 'Multi-comptes', 'Import broker auto'],
    color: '#f59e0b'
  }
]

export default function SettingsPage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSubscribe(priceId: string, planName: string) {
    setLoading(planName)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error(e)
    }
    setLoading(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px' }}>
            Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
          </div>
          <div style={{ color: '#7a8299', marginTop: '4px' }}>Paramètres — Choisir un plan</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {plans.map(plan => (
            <div key={plan.name} style={{
              background: '#0e1117',
              border: `1px solid ${plan.popular ? plan.color : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '14px',
              padding: '24px',
              position: 'relative'
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: plan.color, color: '#000', fontSize: '11px', fontWeight: '700',
                  padding: '4px 12px', borderRadius: '20px'
                }}>
                  POPULAIRE
                </div>
              )}
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: plan.color }}>
                {plan.name}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '20px', color: '#dfe3ed' }}>
                {plan.price}<span style={{ fontSize: '14px', color: '#7a8299', fontWeight: '400' }}>/mois</span>
              </div>
              {plan.features.map(f => (
                <div key={f} style={{ fontSize: '13px', color: '#7a8299', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: plan.color }}>✓</span> {f}
                </div>
              ))}
              <button
  onClick={() => plan.isFree ? null : handleSubscribe(plan.priceId, plan.name)}
  disabled={loading === plan.name || plan.isFree}
  style={{
    width: '100%', marginTop: '20px',
    background: plan.popular ? plan.color : 'transparent',
    border: `1px solid ${plan.color}`,
    borderRadius: '8px', padding: '10px',
    color: plan.popular ? '#000' : plan.color,
    fontSize: '14px', fontWeight: '600',
    cursor: plan.isFree ? 'default' : 'pointer',
    opacity: loading === plan.name ? 0.7 : 1
  }}
>
  {plan.isFree ? 'Plan actuel' : loading === plan.name ? 'Chargement...' : `Choisir ${plan.name}`}
</button>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
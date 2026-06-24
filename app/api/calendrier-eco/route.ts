import { NextResponse } from 'next/server'

const EVENTS = [
  { time: '08:00', currency: 'EUR', impact: 2, event: 'IFO Climat des affaires Allemagne', forecast: '86.0', previous: '85.1' },
  { time: '10:00', currency: 'EUR', impact: 2, event: 'Indice de confiance des consommateurs UE', forecast: '-14.0', previous: '-15.3' },
  { time: '13:30', currency: 'USD', impact: 3, event: 'PIB américain (annualisé)', forecast: '2.3%', previous: '2.4%' },
  { time: '13:30', currency: 'USD', impact: 3, event: 'Inscriptions chômage hebdomadaires', forecast: '225K', previous: '220K' },
  { time: '15:00', currency: 'USD', impact: 2, event: 'Ventes de logements en attente', forecast: '0.5%', previous: '-3.4%' },
  { time: '15:30', currency: 'USD', impact: 2, event: 'Stocks de gaz naturel', forecast: '82B', previous: '78B' },
  { time: '20:00', currency: 'USD', impact: 3, event: 'Discours membre FED', forecast: '—', previous: '—' },
  { time: '01:30', currency: 'JPY', impact: 2, event: 'IPC Tokyo (annuel)', forecast: '2.8%', previous: '3.1%' },
  { time: '09:00', currency: 'EUR', impact: 3, event: 'IPC Zone Euro (annuel)', forecast: '2.3%', previous: '2.2%' },
  { time: '13:30', currency: 'USD', impact: 3, event: 'PCE Core (mensuel)', forecast: '0.2%', previous: '0.2%' },
  { time: '15:00', currency: 'USD', impact: 2, event: 'Indice de confiance Michigan', forecast: '68.5', previous: '69.1' },
]

export async function GET() {
  return NextResponse.json({ events: EVENTS })
}
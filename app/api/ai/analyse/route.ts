import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('opened_at', { ascending: false })
    .limit(50)

  if (!trades || trades.length === 0) {
    return NextResponse.json({ error: 'Aucun trade à analyser' }, { status: 400 })
  }

  const winningTrades = trades.filter((t: any) => t.pnl > 0).length
  const winRate = Math.round((winningTrades / trades.length) * 100)
  const totalPnl = trades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)

  const tradesText = trades.map((t: any) =>
    `- ${t.asset} ${t.direction} | P&L: ${t.pnl}€ | Émotion avant: ${t.emotion_before}/5 | Émotion après: ${t.emotion_after}/5 | Suivi plan: ${t.followed_plan ? 'Oui' : 'Non'} | Notes: ${t.notes || 'aucune'}`
  ).join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Tu es un coach trading professionnel. Analyse ces ${trades.length} trades et identifie les biais comportementaux.

STATISTIQUES:
- Win rate: ${winRate}%
- P&L total: ${totalPnl.toFixed(2)}€

TRADES:
${tradesText}

Réponds UNIQUEMENT en JSON:
{
  "psych_score": <0-100>,
  "biases": [{"type": "...", "description": "...", "occurrences": 1, "conseil": "..."}],
  "strengths": [{"label": "...", "detail": "..."}],
  "conseil_principal": "...",
  "resume": "..."
}`
    }]
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Erreur IA' }, { status: 500 })
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Format invalide' }, { status: 500 })
  }

  const analysis = JSON.parse(jsonMatch[0])
  return NextResponse.json(analysis)
}
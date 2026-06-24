import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: Request) {
  try {
    const { news } = await request.json()

    const newsText = news.map((n: any) => `- ${n.title}`).join('\n')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      system: 'Tu es un analyste macro senior. Reponds UNIQUEMENT en JSON valide avec ce format exact : {"resume": "1 phrase sur le contexte macro actuel", "biais": [{"actif": "XAU/USD", "direction": "haussier"}, {"actif": "EUR/USD", "direction": "baissier"}, {"actif": "USD/JPY", "direction": "haussier"}, {"actif": "BTC", "direction": "neutre"}]}. Uniquement JSON, rien d\'autre.',
      messages: [{ role: 'user', content: `Analyse ces actualites macro et donne un biais directionnel pour les principaux actifs forex:\n${newsText}` }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(clean)

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({
      resume: 'Contexte macro incertain — surveille les annonces FED et les tensions geopolitiques.',
      biais: [
        { actif: 'XAU/USD', direction: 'haussier' },
        { actif: 'EUR/USD', direction: 'neutre' },
        { actif: 'USD/JPY', direction: 'haussier' },
        { actif: 'BTC', direction: 'neutre' }
      ]
    })
  }
}
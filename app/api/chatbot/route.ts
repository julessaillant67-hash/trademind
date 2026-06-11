import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export async function POST(request: Request) {
  const { message, history } = await request.json()

  const messages = [
    ...history.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: message }
  ]

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 500,
    system: `Tu es un coach trading professionnel intégré dans TradeMind. Tu aides les traders à améliorer leur psychologie, leur discipline et leur performance. Tu réponds en français, de manière concise et actionnable. Tu ne donnes pas de conseils financiers spécifiques (acheter/vendre tel actif) mais tu aides sur la psychologie, le risk management, la discipline et l'utilisation de TradeMind. Sois bienveillant, direct et professionnel.`,
    messages
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ response: 'Erreur IA' }, { status: 500 })
  }

  return NextResponse.json({ response: content.text })
}
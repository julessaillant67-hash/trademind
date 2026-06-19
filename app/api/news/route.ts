import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function GET() {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/news?category=forex&token=${process.env.FINNHUB_API_KEY}`
    )
    const articles = await res.json()
    const top5 = articles.slice(0, 5)

    const newsWithIA = await Promise.all(top5.map(async (article: any) => {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 200,
        system: 'Tu es un analyste trading. Réponds UNIQUEMENT en JSON avec ce format exact : {"score": 1|2|3, "resume": "résumé en 1 phrase", "impact": {"USD": "haussier|baissier|neutre", "EUR": "haussier|baissier|neutre"}}',
        messages: [{ role: 'user', content: `Analyse cette news pour un trader forex: ${article.headline}. ${article.summary || ''}` }]
      })

      let analysis = { score: 1, resume: article.headline, impact: {} }
      try {
        const text = response.content[0].type === 'text' ? response.content[0].text : ''
        analysis = JSON.parse(text)
      } catch {}

      return {
        time: new Date(article.datetime * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        title: article.headline,
        summary: analysis.resume,
        score: analysis.score,
        impact: analysis.impact,
        source: article.source,
        url: article.url,
      }
    }))

    return NextResponse.json({ news: newsWithIA })
  } catch (error) {
    return NextResponse.json({ news: [] }, { status: 500 })
  }
}
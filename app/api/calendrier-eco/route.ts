import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const today = new Date()
    const from = today.toISOString().split('T')[0]
    const to = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const res = await fetch(
      `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${process.env.FINNHUB_API_KEY}`
    )
    const data = await res.json()

    const events = (data.economicCalendar || []).map((e: any) => ({
      time: e.time || '00:00',
      currency: e.country || 'USD',
      impact: e.impact === 'high' ? 3 : e.impact === 'medium' ? 2 : 1,
      event: e.event || '',
      forecast: e.estimate ? String(e.estimate) : '—',
      previous: e.prev ? String(e.prev) : '—',
      actual: e.actual ? String(e.actual) : null,
    }))

    return NextResponse.json({ events })
  } catch (error) {
    return NextResponse.json({ events: [] }, { status: 500 })
  }
}
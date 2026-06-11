import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

  const text = await file.text()
  const lines = text.split('\n').filter(l => l.trim())

  if (lines.length < 2) return NextResponse.json({ error: 'Fichier vide ou invalide' }, { status: 400 })

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))

  const trades = []
  const errors = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = values[idx] || '' })

    // Détection format MT4/MT5
    const asset = row['symbol'] || row['asset'] || row['instrument'] || row['pair'] || ''
    const direction = (row['type'] || row['direction'] || row['side'] || '').toUpperCase()
    const entryPrice = parseFloat(row['price'] || row['entry'] || row['open price'] || row['entry_price'] || '0')
    const exitPrice = parseFloat(row['price (sl)'] || row['exit'] || row['close price'] || row['exit_price'] || '0')
    const pnl = parseFloat(row['profit'] || row['pnl'] || row['p&l'] || row['gain/loss'] || '0')
    const lotSize = parseFloat(row['volume'] || row['lots'] || row['lot_size'] || row['size'] || '0')
    const openTime = row['open time'] || row['date'] || row['opened_at'] || row['time'] || ''

    if (!asset || !entryPrice) {
      errors.push(`Ligne ${i + 1} ignorée — données manquantes`)
      continue
    }

    const isLong = direction.includes('BUY') || direction.includes('LONG') || direction === 'B'
    const isShort = direction.includes('SELL') || direction.includes('SHORT') || direction === 'S'

    trades.push({
      user_id: user.id,
      asset: asset.toUpperCase(),
      direction: isShort ? 'SHORT' : 'LONG',
      entry_price: entryPrice || null,
      exit_price: exitPrice || null,
      lot_size: lotSize || null,
      pnl: pnl || null,
      opened_at: openTime ? new Date(openTime).toISOString() : new Date().toISOString(),
      source: 'csv',
      emotion_before: 3,
      emotion_after: 3,
      followed_plan: true,
    })
  }

  if (trades.length === 0) {
    return NextResponse.json({ error: 'Aucun trade valide trouvé dans le fichier', errors }, { status: 400 })
  }

  const { error } = await supabase.from('trades').insert(trades)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ imported: trades.length, errors })
}
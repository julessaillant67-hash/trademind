'use client'

import { useState } from 'react'

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function handleImport() {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/trades/import', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setResult(data)
    } catch {
      setError('Erreur lors de l\'import')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px' }}>
            Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
          </div>
          <div style={{ color: '#7a8299', marginTop: '4px' }}>Import CSV — MT4 / MT5</div>
        </div>

        {/* Instructions */}
        <div style={{ background: 'rgba(0,229,176,0.06)', border: '1px solid rgba(0,229,176,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#00e5b0', marginBottom: '10px' }}>📋 Comment exporter depuis MT4/MT5 :</div>
          <div style={{ fontSize: '13px', color: '#7a8299', lineHeight: '1.8' }}>
            1. Ouvre MT4/MT5 → Historique des comptes<br />
            2. Clic droit → Sauvegarder en tant que rapport détaillé<br />
            3. Choisis le format CSV<br />
            4. Importe le fichier ici
          </div>
        </div>

        {/* Zone upload */}
        <div style={{ background: '#0e1117', border: `2px dashed ${file ? '#00e5b0' : 'rgba(255,255,255,0.1)'}`, borderRadius: '14px', padding: '40px', textAlign: 'center', marginBottom: '20px', cursor: 'pointer' }}
          onClick={() => document.getElementById('csvInput')?.click()}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📁</div>
          <div style={{ fontSize: '15px', fontWeight: '500', color: file ? '#00e5b0' : '#dfe3ed', marginBottom: '6px' }}>
            {file ? file.name : 'Clique pour sélectionner ton fichier CSV'}
          </div>
          <div style={{ fontSize: '12px', color: '#7a8299' }}>
            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Formats supportés : .csv — MT4, MT5, cTrader'}
          </div>
          <input
            id="csvInput"
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <button
          onClick={handleImport}
          disabled={!file || loading}
          style={{
            width: '100%', background: !file ? '#141920' : '#00e5b0',
            border: 'none', borderRadius: '10px', padding: '14px',
            color: !file ? '#7a8299' : '#000', fontWeight: '700',
            fontSize: '15px', cursor: !file ? 'not-allowed' : 'pointer',
            marginBottom: '20px'
          }}
        >
          {loading ? '⏳ Import en cours...' : '⬆️ Importer les trades'}
        </button>

        {error && (
          <div style={{ background: 'rgba(240,82,82,0.1)', border: '1px solid rgba(240,82,82,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>
            ❌ {error}
          </div>
        )}

        {result && (
          <div style={{ background: 'rgba(0,229,176,0.08)', border: '1px solid rgba(0,229,176,0.3)', borderRadius: '10px', padding: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#00e5b0', marginBottom: '10px' }}>
              ✅ {result.imported} trade{result.imported > 1 ? 's' : ''} importé{result.imported > 1 ? 's' : ''} avec succès
            </div>
            {result.errors?.length > 0 && (
              <div style={{ fontSize: '12px', color: '#7a8299', marginTop: '8px' }}>
                {result.errors.length} ligne{result.errors.length > 1 ? 's' : ''} ignorée{result.errors.length > 1 ? 's' : ''}
              </div>
            )}
            <div style={{ fontSize: '13px', color: '#7a8299', marginTop: '8px' }}>
              Tes trades sont maintenant disponibles dans le journal.
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
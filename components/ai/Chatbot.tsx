'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Bonjour ! Je suis ton coach trading IA. Pose-moi toutes tes questions sur le trading, la psychologie ou TradeMind 🤖' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Désolé, une erreur est survenue. Réessaie.' }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          width: '56px', height: '56px', borderRadius: '50%',
          background: '#00e5b0', border: 'none', cursor: 'pointer',
          fontSize: '24px', boxShadow: '0 4px 20px rgba(0,229,176,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s'
        }}
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Fenêtre chat */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '24px', zIndex: 1000,
          width: '360px', height: '500px',
          background: '#0e1117', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)', fontFamily: 'sans-serif'
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,229,176,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🤖</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#dfe3ed' }}>Coach Trading IA</div>
              <div style={{ fontSize: '11px', color: '#22d3a0' }}>● En ligne</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.role === 'user' ? '#00e5b0' : '#141920',
                  color: msg.role === 'user' ? '#000' : '#dfe3ed',
                  fontSize: '13px', lineHeight: '1.5'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: '#141920', padding: '10px 14px', borderRadius: '14px 14px 14px 4px', fontSize: '13px', color: '#7a8299' }}>
                  En train d'écrire...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '8px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Pose ta question..."
              style={{ flex: 1, background: '#141920', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', color: '#dfe3ed', fontSize: '13px', outline: 'none', fontFamily: 'sans-serif' }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{ background: '#00e5b0', border: 'none', borderRadius: '8px', padding: '8px 14px', color: '#000', fontSize: '16px', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  )
}
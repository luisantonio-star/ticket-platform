'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminAcceso() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        setVisible(v => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!visible) return null

  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 999, animation: 'fadeIn .2s ease' }}>
      <Link
        href="/login"
        onClick={() => setVisible(false)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, background: 'rgba(15,8,0,0.92)', border: '1px solid rgba(232,93,32,0.4)', color: '#E85D20', fontFamily: "'Instrument Sans', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textDecoration: 'none', backdropFilter: 'blur(12px)', boxShadow: '0 8px 28px rgba(0,0,0,0.5)' }}
      >
        🔐 ACCESO ORGANIZADOR
      </Link>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}

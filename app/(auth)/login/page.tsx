'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }
    window.location.href = '/dashboard'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '13px 16px',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    background: 'rgba(255,255,255,0.06)', color: '#fff',
    fontFamily: 'inherit', fontSize: 14, outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0d0a1f 0%, #12102a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Instrument Sans', system-ui, sans-serif", color: '#fff' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, border: '2px solid rgba(232,93,32,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24 }}>◈</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase' }}>ACCESO ORGANIZADOR</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '32px 28px', backdropFilter: 'blur(12px)' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', margin: '0 0 6px', textTransform: 'uppercase' }}>
            Bienvenido <span style={{ color: '#E85D20' }}>de vuelta</span>
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px' }}>Ingresa tus credenciales para continuar</p>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5', fontSize: 13, marginBottom: 18 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase' }}>Correo</label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase' }}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={inputStyle}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 12, background: loading ? 'rgba(255,255,255,0.08)' : '#E85D20', color: loading ? 'rgba(255,255,255,0.3)' : '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 8px 28px rgba(232,93,32,0.4)' }}
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 20, letterSpacing: '0.06em' }}>
          ÁREA RESTRINGIDA · SOLO PERSONAL AUTORIZADO
        </p>
      </div>
    </div>
  )
}

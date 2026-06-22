'use client'

import { useEffect, useState } from 'react'

// Cambia esta fecha cuando tengas la real
const FECHA_EVENTO = new Date('2026-05-12T07:30:00')

export default function Countdown() {
  const [tiempo, setTiempo] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 })

  useEffect(() => {
    const calcular = () => {
      const diff = FECHA_EVENTO.getTime() - Date.now()
      if (diff <= 0) {
        setTiempo({ dias: 0, horas: 0, minutos: 0, segundos: 0 })
        return
      }
      setTiempo({
        dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
        horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((diff / (1000 * 60)) % 60),
        segundos: Math.floor((diff / 1000) % 60),
      })
    }
    calcular()
    const interval = setInterval(calcular, 1000)
    return () => clearInterval(interval)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <section style={{ background: '#0a0a0a', padding: '48px 24px 40px', textAlign: 'center' }}>
      {/* Urgencia */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28, fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', color: '#E85D20' }}>
        <span>⏳</span>
        <span>TEXTO DE URGENCIA · LOS LUGARES SON LIMITADOS</span>
      </div>

      {/* Números */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(3px, 1.2vw, 8px)', flexWrap: 'nowrap' }}>
        {[
          { val: pad(tiempo.dias), label: 'DÍAS' },
          { val: pad(tiempo.horas), label: 'HORAS' },
          { val: pad(tiempo.minutos), label: 'MINUTOS' },
          { val: pad(tiempo.segundos), label: 'SEGUNDOS' },
        ].map((item, i) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(3px, 1.2vw, 8px)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(32px, 8vw, 72px)', color: '#E85D20', lineHeight: 1, border: '1px solid rgba(232,93,32,0.25)', borderRadius: 10, padding: 'clamp(7px, 2vw, 10px) clamp(8px, 3vw, 18px)', background: 'rgba(232,93,32,0.06)', minWidth: 'clamp(46px, 13vw, 80px)' }}>
                {item.val}
              </div>
              <div style={{ fontSize: 'clamp(8px, 2vw, 10px)', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                {item.label}
              </div>
            </div>
            {i < 3 && (
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(20px, 5vw, 40px)', color: '#E85D20', marginBottom: 20, opacity: 0.6 }}>:</div>
            )}
          </div>
        ))}
      </div>

      {/* Info evento */}
      <div style={{ marginTop: 22, fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)' }}>
        FECHA · VENUE · CIUDAD, ESTADO
      </div>
    </section>
  )
}

'use client'

import { useRef, useState } from 'react'

export type SesionPublica = {
  id: string
  titulo: string
  subtitulo: string | null
  etiqueta: string | null
  horario: string | null
  tipo: string
  ponentes: { nombre: string; visible: boolean; imagen?: string | null }[]
  highlight: boolean
}

const TIPO_META: Record<string, { label: string; hue: number }> = {
  conferencia: { label: 'Conferencia', hue: 22 },
  conversatorio: { label: 'Conversatorio', hue: 200 },
  especial: { label: 'Especial', hue: 280 },
  registro: { label: 'Registro', hue: 215 },
  sorpresa: { label: 'Sorpresa', hue: 290 },
}

export default function LineupCards({ sesiones }: { sesiones: SesionPublica[] }) {
  const [activa, setActiva] = useState<string | null>(null)
  const tap = useRef<{ x: number; y: number } | null>(null)

  return (
    <section style={{ background: 'linear-gradient(180deg, #0d0a1f 0%, #140d2e 100%)', padding: '70px 24px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: '#E85D20', marginBottom: 12 }}>
            FECHA · CIUDAD, ESTADO
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(40px, 8vw, 80px)', letterSpacing: '-0.02em', textTransform: 'uppercase', margin: '0 0 20px', lineHeight: 1 }}>
            <span style={{ color: '#fff' }}>EL </span>
            <span style={{ color: '#E85D20' }}>LINEUP</span>
          </h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', marginBottom: 48 }}>
            <span>⏱</span> ELIGE UNA CARTA PARA CONOCER LOS DETALLES
          </div>
        </div>

        {/* Grid de cartas */}
        <div className="lp-lineup-grid">
          {sesiones.map((s) => {
            const flipped = activa === s.id
            const meta = TIPO_META[s.tipo] ?? TIPO_META.conferencia
            const hue = meta.hue
            const bg = `linear-gradient(150deg, oklch(0.38 0.18 ${hue}), oklch(0.25 0.14 ${hue + 20}))`
            const visibles = (s.ponentes ?? []).filter((p) => p.visible)
            const badge = s.etiqueta || meta.label

            return (
              <div
                key={s.id}
                onPointerDown={(e) => { tap.current = { x: e.clientX, y: e.clientY } }}
                onPointerUp={(e) => {
                  const d = tap.current
                  tap.current = null
                  if (d && Math.abs(e.clientX - d.x) < 12 && Math.abs(e.clientY - d.y) < 12) {
                    setActiva(flipped ? null : s.id)
                  }
                }}
                style={{ cursor: 'pointer', perspective: 1000, touchAction: 'manipulation' }}
              >
                <div style={{
                  position: 'relative',
                  aspectRatio: '3/4',
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                  transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  WebkitTransform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}>

                  {/* FRENTE */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                    borderRadius: 16, overflow: 'hidden', background: bg,
                    border: s.highlight ? '2px solid #E85D20' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: s.highlight ? '0 0 28px rgba(232,93,32,0.45)' : 'none',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  }}>
                    <div style={{ padding: '14px 14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                        {meta.label}
                      </span>
                      {s.horario && (
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          🕐 {s.horario}
                        </span>
                      )}
                    </div>

                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />

                    <div style={{ padding: '0 14px 14px', position: 'relative' }}>
                      <div style={{ marginBottom: 10, padding: '5px 10px', borderRadius: 20, background: 'rgba(232,93,32,0.25)', border: '1px solid rgba(232,93,32,0.4)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', color: '#E85D20', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                        + TOCA PARA REVELAR +
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', color: '#fff', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.15 }}>{badge}</div>
                      <div style={{ fontSize: 9, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>NOMBRE EVENTO · CIUDAD</div>
                    </div>
                  </div>

                  {/* REVERSO */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)', WebkitTransform: 'rotateY(180deg)',
                    borderRadius: 16, overflow: 'hidden', background: '#111',
                    border: s.highlight ? '2px solid #E85D20' : '1px solid rgba(232,93,32,0.4)',
                    display: 'flex', flexDirection: 'column', padding: '18px 16px',
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#E85D20', marginBottom: 8, textTransform: 'uppercase' }}>{badge}</div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 16, color: '#fff', textTransform: 'uppercase', lineHeight: 1.2, marginBottom: 6 }}>
                      {s.titulo}
                    </div>
                    {s.subtitulo && (
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#E85D20', marginBottom: 12, textTransform: 'uppercase' }}>{s.subtitulo}</div>
                    )}
                    {s.horario && (
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>🕐 {s.horario}</div>
                    )}

                    {visibles.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                        {visibles.map((p, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {p.imagen ? (
                              <div style={{ width: 30, height: 30, borderRadius: 7, background: '#fff', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              </div>
                            ) : (
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                                {p.nombre.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{p.nombre}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); setActiva(null) }}
                      style={{ marginTop: 14, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                    >
                      ↩ OCULTAR DETALLES
                    </button>
                  </div>

                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <a
            href="#boletos"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '18px 44px', borderRadius: 10, background: '#E85D20', color: '#fff', fontSize: 15, fontWeight: 800, letterSpacing: '0.1em', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 8px 32px rgba(232,93,32,0.4)' }}
          >
            ADQUIRIR MI BOLETO →
          </a>
        </div>
      </div>
    </section>
  )
}

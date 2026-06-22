'use client'

import { useRef, useState } from 'react'

const HUES = [22, 38, 200, 260, 15, 180, 45, 280]

const CARDS = [
  {
    id: 1,
    label: 'REGISTRO',
    tipo: null,
    hora: '7:30 - 8:50 AM',
    titulo: 'NOMBRE DEL SEGMENTO',
    subtitulo: 'SUBTÍTULO O LEMA DEL SEGMENTO',
    cita: '"Texto de impacto o cita relacionada con este momento del evento."',
    impacto: 'Descripción del impacto o beneficio que tendrá este segmento para los asistentes.',
    ponentes: [
      { iniciales: 'P1', nombre: 'Nombre Ponente 1', rol: 'Cargo / Empresa' },
    ],
    hue: 22,
  },
  {
    id: 2,
    label: 'CONFERENCIA 1',
    tipo: 'CONFERENCIA 1',
    hora: '9:00 - 10:00 AM',
    titulo: 'TÍTULO DE LA CONFERENCIA',
    subtitulo: 'TAGLINE O SUBTÍTULO DE LA CONFERENCIA',
    cita: '"Frase o pregunta que describe el tema central de esta conferencia."',
    impacto: 'Descripción breve de lo que aprenderán o experimentarán los asistentes en esta conferencia.',
    ponentes: [
      { iniciales: 'P1', nombre: 'Nombre Ponente 1', rol: 'Cargo / Empresa' },
      { iniciales: 'P2', nombre: 'Nombre Ponente 2', rol: 'Cargo / Empresa' },
    ],
    hue: 38,
  },
  {
    id: 3,
    label: 'CONVERSATORIO 1',
    tipo: 'CONVERSATORIO',
    hora: '10:15 - 11:15 AM',
    titulo: 'TÍTULO DEL CONVERSATORIO',
    subtitulo: 'TEMA CENTRAL A DEBATIR',
    cita: '"Pregunta o afirmación que guiará la conversación entre los panelistas."',
    impacto: 'Lo que los asistentes llevarán de este conversatorio — perspectivas, debates, conclusiones.',
    ponentes: [
      { iniciales: 'P1', nombre: 'Nombre Ponente 1', rol: 'Cargo / Empresa' },
      { iniciales: 'P2', nombre: 'Nombre Ponente 2', rol: 'Cargo / Empresa' },
    ],
    hue: 200,
  },
  {
    id: 4,
    label: 'CONFERENCIA 2',
    tipo: 'CONFERENCIA 2',
    hora: '11:30 - 12:30 PM',
    titulo: 'TÍTULO DE LA SEGUNDA CONFERENCIA',
    subtitulo: 'TAGLINE DE ESTA CONFERENCIA',
    cita: '"Frase motivacional o de impacto que resume la charla."',
    impacto: 'Descripción del contenido y valor que aportará esta conferencia al asistente.',
    ponentes: [
      { iniciales: 'P1', nombre: 'Nombre Ponente', rol: 'Cargo / Empresa' },
    ],
    hue: 260,
  },
  {
    id: 5,
    label: 'PROYECTO SORPRESA',
    tipo: '???',
    hora: null,
    titulo: '???',
    subtitulo: 'ALGO QUE NO PODRÁS CONTAR',
    cita: '"Algunas experiencias no se describen. Solo se viven."',
    impacto: 'Este segmento es una sorpresa. Tendrás que estar ahí para descubrirlo.',
    ponentes: [],
    hue: 280,
  },
  {
    id: 6,
    label: 'INAUGURACIÓN OFICIAL',
    tipo: 'INAUGURACIÓN',
    hora: '8:50 - 9:00 AM',
    titulo: 'BIENVENIDA OFICIAL AL EVENTO',
    subtitulo: 'EL INICIO DE TODO',
    cita: '"El momento en que todo cobra vida."',
    impacto: 'Apertura oficial del evento con palabras de bienvenida de los organizadores y patrocinadores principales.',
    ponentes: [
      { iniciales: 'OR', nombre: 'Organización', rol: 'Organizador del evento' },
    ],
    hue: 15,
  },
  {
    id: 7,
    label: 'CONVERSATORIO 2',
    tipo: 'CONVERSATORIO',
    hora: '12:45 - 1:45 PM',
    titulo: 'TÍTULO DEL SEGUNDO CONVERSATORIO',
    subtitulo: 'TEMA DEL PANEL',
    cita: '"Pregunta o afirmación central de este conversatorio."',
    impacto: 'Descripción del valor que aportará este segundo conversatorio y qué debates se esperan.',
    ponentes: [
      { iniciales: 'P1', nombre: 'Nombre Ponente 1', rol: 'Cargo / Empresa' },
      { iniciales: 'P2', nombre: 'Nombre Ponente 2', rol: 'Cargo / Empresa' },
    ],
    hue: 180,
  },
  {
    id: 8,
    label: 'EL AFTER',
    tipo: 'AFTER',
    hora: '2:00 - 3:00 PM',
    titulo: 'CIERRE Y NETWORKING',
    subtitulo: 'LAS CONVERSACIONES QUE IMPORTAN',
    cita: '"Los mejores negocios empiezan después del último ponente."',
    impacto: 'Espacio de networking libre para conectar con ponentes, organizadores y asistentes.',
    ponentes: [],
    hue: 45,
  },
]

export default function LineupCards() {
  const [activa, setActiva] = useState<number | null>(null)
  // Posición inicial del toque para distinguir "tap" de "deslizar" (táctil).
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
          {CARDS.map((card) => {
            const flipped = activa === card.id
            const bg = `linear-gradient(150deg, oklch(0.38 0.18 ${card.hue}), oklch(0.25 0.14 ${card.hue + 20}))`

            return (
              <div
                key={card.id}
                onPointerDown={(e) => { tap.current = { x: e.clientX, y: e.clientY } }}
                onPointerUp={(e) => {
                  const d = tap.current
                  tap.current = null
                  if (d && Math.abs(e.clientX - d.x) < 12 && Math.abs(e.clientY - d.y) < 12) {
                    setActiva(flipped ? null : card.id)
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
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: bg,
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  }}>
                    {/* Tipo badge */}
                    <div style={{ padding: '14px 14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      {card.tipo && (
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: 4 }}>
                          {card.tipo}
                        </span>
                      )}
                      {card.hora && (
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          🕐 {card.hora}
                        </span>
                      )}
                    </div>

                    {/* Fondo decorativo */}
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />

                    {/* Footer de la carta */}
                    <div style={{ padding: '0 14px 14px', position: 'relative' }}>
                      <div style={{ marginBottom: 10, padding: '5px 10px', borderRadius: 20, background: 'rgba(232,93,32,0.25)', border: '1px solid rgba(232,93,32,0.4)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', color: '#E85D20', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                        + TOCA PARA REVELAR +
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#fff', textTransform: 'uppercase' }}>{card.label}</div>
                      <div style={{ fontSize: 9, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>NOMBRE EVENTO · CIUDAD</div>
                    </div>
                  </div>

                  {/* REVERSO */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: '#111',
                    border: '1px solid rgba(232,93,32,0.4)',
                    display: 'flex', flexDirection: 'column',
                    padding: '16px 14px',
                  }}>
                    {card.tipo && (
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#E85D20', marginBottom: 8 }}>{card.tipo}</div>
                    )}
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 14, color: '#fff', textTransform: 'uppercase', lineHeight: 1.2, marginBottom: 4 }}>
                      {card.titulo}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#E85D20', marginBottom: 10 }}>{card.subtitulo}</div>

                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 10, borderLeft: '2px solid #E85D20', paddingLeft: 8 }}>
                      {card.cita}
                    </div>

                    {card.impacto && (
                      <div style={{ background: 'rgba(232,93,32,0.1)', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 6, padding: '6px 8px', marginBottom: 10 }}>
                        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: '#E85D20', marginBottom: 3 }}>IMPACTO:</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{card.impacto}</div>
                      </div>
                    )}

                    {card.ponentes.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
                        {card.ponentes.map((p) => (
                          <div key={p.iniciales} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                              {p.iniciales}
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{p.nombre}</div>
                              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', lineHeight: 1.1 }}>{p.rol}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); setActiva(null) }}
                      style={{ marginTop: 10, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
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

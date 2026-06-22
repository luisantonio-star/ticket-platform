'use client'

import { useEffect, useRef, useState } from 'react'

export type ImagenPasada = {
  id: string
  titulo: string | null
  image_url: string
}

export default function GaleriaEventos({ imagenes }: { imagenes: ImagenPasada[] }) {
  const [abierta, setAbierta] = useState<ImagenPasada | null>(null)
  // En móvil no hay hover: pausamos el carrusel al tocarlo para que la imagen
  // quede quieta y el tap caiga sobre ella (si no, se mueve y el toque falla).
  const [pausa, setPausa] = useState(false)
  // Posición inicial del toque para distinguir "tap" de "deslizar".
  const tap = useRef<{ x: number; y: number } | null>(null)

  // Cerrar con Escape y bloquear scroll del fondo mientras está abierto
  useEffect(() => {
    if (!abierta) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierta(null) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [abierta])

  // Con 5+ imágenes se vuelve carrusel en movimiento; con pocas, grid estático.
  const enMovimiento = imagenes.length >= 5
  // Duración proporcional a la cantidad para que la velocidad sea pareja.
  const duracion = imagenes.length * 5

  const Card = ({ img }: { img: ImagenPasada }) => (
    <button
      onPointerDown={(e) => { tap.current = { x: e.clientX, y: e.clientY }; setPausa(true) }}
      onPointerUp={(e) => {
        setPausa(false)
        const d = tap.current
        tap.current = null
        if (d && Math.abs(e.clientX - d.x) < 12 && Math.abs(e.clientY - d.y) < 12) setAbierta(img)
      }}
      onPointerCancel={() => { setPausa(false); tap.current = null }}
      className="galeria-item"
      style={{
        position: 'relative',
        aspectRatio: '4 / 3',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
        padding: 0,
        cursor: 'pointer',
        display: 'block',
        width: enMovimiento ? 320 : '100%',
        flexShrink: enMovimiento ? 0 : undefined,
        touchAction: 'manipulation',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.image_url}
        alt={img.titulo ?? 'Evento pasado'}
        className="galeria-img"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .45s ease' }}
      />
      {img.titulo && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            padding: '28px 16px 14px',
            background: 'linear-gradient(0deg, rgba(0,0,0,0.78), transparent)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 14, letterSpacing: '0.04em',
            color: '#fff', textTransform: 'uppercase', textAlign: 'left',
          }}
        >
          {img.titulo}
        </div>
      )}
    </button>
  )

  return (
    <>
      {enMovimiento ? (
        <div
          className="galeria-marquee"
          style={{ overflow: 'hidden', position: 'relative' }}
          onPointerDown={() => setPausa(true)}
          onPointerUp={() => setPausa(false)}
          onPointerCancel={() => setPausa(false)}
          onPointerLeave={() => setPausa(false)}
        >
          <div
            className="galeria-track"
            style={{ display: 'flex', gap: 18, width: 'max-content', animation: `galeria-scroll ${duracion}s linear infinite`, animationPlayState: pausa ? 'paused' : 'running' }}
          >
            {imagenes.map((img) => <Card key={img.id} img={img} />)}
            {/* Copia para bucle continuo */}
            {imagenes.map((img) => <Card key={`dup-${img.id}`} img={img} />)}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
          {imagenes.map((img) => <Card key={img.id} img={img} />)}
        </div>
      )}

      {/* Lightbox */}
      {abierta && (
        <div
          onClick={() => setAbierta(null)}
          className="lightbox-overlay"
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, cursor: 'zoom-out',
          }}
        >
          {/* Botón cerrar */}
          <button
            onClick={(e) => { e.stopPropagation(); setAbierta(null) }}
            aria-label="Cerrar"
            style={{
              position: 'absolute', top: 20, right: 24,
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontSize: 22, cursor: 'pointer', lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="lightbox-content"
            style={{ maxWidth: '92vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'default' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={abierta.image_url}
              alt={abierta.titulo ?? 'Evento pasado'}
              style={{ maxWidth: '92vw', maxHeight: abierta.titulo ? '80vh' : '88vh', objectFit: 'contain', borderRadius: 14, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
            />
            {abierta.titulo && (
              <div
                style={{
                  marginTop: 16, fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: 18, letterSpacing: '0.04em',
                  color: '#fff', textTransform: 'uppercase', textAlign: 'center',
                }}
              >
                {abierta.titulo}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .galeria-item:hover .galeria-img { transform: scale(1.07); }
        @keyframes galeria-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .galeria-marquee:hover .galeria-track { animation-play-state: paused; }
        .lightbox-overlay { animation: lb-fade .22s ease; }
        .lightbox-content { animation: lb-zoom .3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes lb-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lb-zoom { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </>
  )
}

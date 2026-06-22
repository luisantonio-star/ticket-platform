'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { guardarSesion, eliminarSesion, subirImagenPonente, type SesionInput, type Ponente } from '@/lib/actions/sesiones'
import { Zap, Users, Star, Clock, Lock, Eye, EyeOff, Plus, X, Pencil, Trash2, GripVertical, ImagePlus } from 'lucide-react'

export type Sesion = {
  id: string
  titulo: string
  subtitulo: string | null
  etiqueta: string | null
  horario: string | null
  tipo: string
  imagen: string | null
  ponentes: Ponente[]
  publica: boolean
  highlight: boolean
}

const TIPOS = [
  { v: 'conferencia', label: 'Conferencia', icon: Zap },
  { v: 'conversatorio', label: 'Conversatorio', icon: Users },
  { v: 'especial', label: 'Especial', icon: Star },
  { v: 'registro', label: 'Registro / Break', icon: Clock },
  { v: 'sorpresa', label: 'Sorpresa', icon: Lock },
] as const

const NARANJA = '#E85D20'

function vacia(): SesionInput {
  return { titulo: '', subtitulo: '', etiqueta: '', horario: '', tipo: 'conferencia', imagen: null, ponentes: [], publica: true, highlight: false }
}

export default function SesionesAdmin({ sesiones }: { sesiones: Sesion[] }) {
  const router = useRouter()
  const [editando, setEditando] = useState<SesionInput | null>(null)

  const abrirNueva = () => setEditando(vacia())
  const abrirEditar = (s: Sesion) =>
    setEditando({
      id: s.id, titulo: s.titulo, subtitulo: s.subtitulo ?? '', etiqueta: s.etiqueta ?? '',
      horario: s.horario ?? '', tipo: s.tipo, imagen: s.imagen ?? null, ponentes: s.ponentes ?? [], publica: s.publica, highlight: s.highlight,
    })

  const borrar = async (id: string) => {
    if (!confirm('¿Eliminar esta sesión del lineup?')) return
    await eliminarSesion(id)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-lg">Sesiones del lineup <span className="text-foreground/45 font-medium">({sesiones.length})</span></h2>
        <button
          onClick={abrirNueva}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-[0_10px_24px_-10px_rgba(16,44,140,0.7)] cursor-pointer"
        >
          <Plus size={18} /> Nueva sesión
        </button>
      </div>

      {sesiones.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl py-14 text-center text-foreground/55 shadow-[0_10px_30px_-18px_rgba(16,24,48,0.4)]">
          <div className="text-4xl mb-3">🎤</div>
          Aún no hay sesiones. Crea la primera con “Nueva sesión”.
        </div>
      ) : (
        <div className="grid gap-3">
          {sesiones.map((s) => {
            const tipoMeta = TIPOS.find((t) => t.v === s.tipo) ?? TIPOS[0]
            const Icon = tipoMeta.icon
            return (
              <div key={s.id} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 shadow-[0_10px_30px_-20px_rgba(16,24,48,0.45)]">
                <GripVertical size={18} className="text-foreground/25 shrink-0" />
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon size={19} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{s.titulo || 'Sin título'}</span>
                    {s.highlight && <Star size={14} className="text-amber-500 shrink-0" fill="currentColor" />}
                    {!s.publica && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-foreground/50 shrink-0">OCULTA</span>}
                  </div>
                  <div className="text-sm text-foreground/55 truncate">
                    {tipoMeta.label}{s.horario ? ` · ${s.horario}` : ''}{s.ponentes.length ? ` · ${s.ponentes.length} ponente(s)` : ''}
                  </div>
                </div>
                <button onClick={() => abrirEditar(s)} title="Editar" className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition cursor-pointer shrink-0">
                  <Pencil size={16} />
                </button>
                <button onClick={() => borrar(s.id)} title="Eliminar" className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition cursor-pointer shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {editando && (
        <Modal
          inicial={editando}
          onClose={() => setEditando(null)}
          onSaved={() => { setEditando(null); router.refresh() }}
        />
      )}
    </div>
  )
}

function Modal({ inicial, onClose, onSaved }: { inicial: SesionInput; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<SesionInput>(inicial)
  const [nuevoPonente, setNuevoPonente] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState<number | null>(null)
  const [subiendoPortada, setSubiendoPortada] = useState(false)

  const set = <K extends keyof SesionInput>(k: K, v: SesionInput[K]) => setForm((f) => ({ ...f, [k]: v }))

  const agregarPonente = () => {
    const n = nuevoPonente.trim()
    if (!n) return
    set('ponentes', [...form.ponentes, { nombre: n, visible: true, imagen: null }])
    setNuevoPonente('')
  }
  const togglePonente = (i: number) =>
    set('ponentes', form.ponentes.map((p, j) => (j === i ? { ...p, visible: !p.visible } : p)))
  const quitarPonente = (i: number) => set('ponentes', form.ponentes.filter((_, j) => j !== i))
  const setImagenPonente = (i: number, imagen: string | null) =>
    set('ponentes', form.ponentes.map((p, j) => (j === i ? { ...p, imagen } : p)))

  const subirImagen = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(''); setSubiendo(i)
    const fd = new FormData()
    fd.append('imagen', file)
    const res = await subirImagenPonente(fd)
    setSubiendo(null)
    if (res.error) { setError(res.error); return }
    if (res.url) setImagenPonente(i, res.url)
  }

  const subirPortada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(''); setSubiendoPortada(true)
    const fd = new FormData()
    fd.append('imagen', file)
    const res = await subirImagenPonente(fd)
    setSubiendoPortada(false)
    if (res.error) { setError(res.error); return }
    if (res.url) set('imagen', res.url)
  }

  const guardar = async () => {
    setError(''); setGuardando(true)
    const res = await guardarSesion(form)
    setGuardando(false)
    if (res.error) { setError(res.error); return }
    onSaved()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '13px 16px', borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)',
    color: '#fff', fontFamily: 'inherit', fontSize: 14, outline: 'none',
  }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', marginBottom: 7, textTransform: 'uppercase' }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 720, background: '#15171E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, fontFamily: "'Instrument Sans', system-ui, sans-serif", color: '#fff', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 5, height: 24, borderRadius: 3, background: NARANJA }} />
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 19, letterSpacing: '0.04em', margin: 0, textTransform: 'uppercase' }}>
              {form.id ? 'Editar sesión' : 'Nueva sesión'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 4 }}><X size={22} /></button>
        </div>

        <div style={{ padding: '24px 28px 28px' }}>
          {/* Portada */}
          <label style={labelStyle}>Imagen de portada</label>
          <label style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '3 / 1', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', marginBottom: 20, background: form.imagen ? '#000' : 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)' }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={subirPortada} />
            {subiendoPortada ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Subiendo…</div>
            ) : form.imagen ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imagen} alt="Portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  onClick={(e) => { e.preventDefault(); set('imagen', null) }}
                  style={{ position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Quitar imagen"
                ><X size={16} /></button>
              </>
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'rgba(255,255,255,0.45)' }}>
                <ImagePlus size={26} />
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>Subir imagen de portada</span>
              </div>
            )}
          </label>

          {/* Título + Subtítulo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Título *</label>
              <input value={form.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Ej. El after" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Subtítulo</label>
              <input value={form.subtitulo} onChange={(e) => set('subtitulo', e.target.value)} placeholder="Ej. Lo hecho en Sonora se hace bien" style={inputStyle} />
            </div>
          </div>

          {/* Etiqueta + Horario */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Etiqueta / Badge</label>
              <input value={form.etiqueta} onChange={(e) => set('etiqueta', e.target.value)} placeholder="Ej. EL AFTER" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Horario</label>
              <input value={form.horario} onChange={(e) => set('horario', e.target.value)} placeholder="Ej. 14:00 – 17:00" style={inputStyle} />
            </div>
          </div>

          {/* Tipo */}
          <label style={labelStyle}>Tipo de sesión</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
            {TIPOS.map(({ v, label, icon: Icon }) => {
              const activo = form.tipo === v
              return (
                <button key={v} onClick={() => set('tipo', v)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
                    border: `1px solid ${activo ? '#16B45855' : 'rgba(255,255,255,0.12)'}`,
                    background: activo ? 'rgba(22,180,88,0.12)' : 'rgba(255,255,255,0.04)',
                    color: activo ? '#5BE3A0' : 'rgba(255,255,255,0.7)' }}>
                  <Icon size={15} /> {label}
                </button>
              )
            })}
          </div>

          {/* Ponentes */}
          <label style={labelStyle}>Ponentes / Participantes</label>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <input
              value={nuevoPonente}
              onChange={(e) => setNuevoPonente(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarPonente() } }}
              placeholder="Nombre del ponente — Enter para agregar"
              style={inputStyle}
            />
            <button onClick={agregarPonente} style={{ flexShrink: 0, width: 50, borderRadius: 12, border: 'none', background: NARANJA, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={20} /></button>
          </div>
          {form.ponentes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {form.ponentes.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {/* Miniatura / subir imagen */}
                  <label style={{ position: 'relative', width: 42, height: 42, borderRadius: 8, flexShrink: 0, cursor: 'pointer', background: p.imagen ? '#fff' : 'rgba(255,255,255,0.08)', border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => subirImagen(i, e)} />
                    {subiendo === i ? (
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>…</span>
                    ) : p.imagen ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <ImagePlus size={16} color="rgba(255,255,255,0.45)" />
                    )}
                  </label>

                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: p.visible ? '#fff' : 'rgba(255,255,255,0.4)' }}>{p.nombre}</span>

                  <button onClick={() => togglePonente(i)} title={p.visible ? 'Visible (clic para ocultar)' : 'Oculto (clic para mostrar)'} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: p.visible ? '#5BE3A0' : 'rgba(255,255,255,0.35)' }}>
                    {p.visible ? <Eye size={17} /> : <EyeOff size={17} />}
                  </button>
                  <button onClick={() => quitarPonente(i)} title="Quitar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                </div>
              ))}
            </div>
          )}

          {error && <p style={{ color: '#FCA5A5', fontSize: 13, marginBottom: 14 }}>{error}</p>}

          {/* Toggles + acciones */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            <Toggle activo={form.publica} onClick={() => set('publica', !form.publica)} icon={<Eye size={16} />} label="Pública" />
            <Toggle activo={form.highlight} onClick={() => set('highlight', !form.highlight)} icon={<Star size={16} />} label="Highlight" naranja />
            <div style={{ flex: 1 }} />
            <button onClick={onClose} style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={guardar} disabled={guardando} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: NARANJA, color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.6 : 1 }}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Toggle({ activo, onClick, icon, label, naranja }: { activo: boolean; onClick: () => void; icon: React.ReactNode; label: string; naranja?: boolean }) {
  const color = naranja ? '#E85D20' : '#16B458'
  return (
    <button onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
        border: `1px solid ${activo ? color + '66' : 'rgba(255,255,255,0.12)'}`,
        background: activo ? (naranja ? 'rgba(232,93,32,0.16)' : 'rgba(22,180,88,0.12)') : 'rgba(255,255,255,0.04)',
        color: activo ? (naranja ? '#F6A37B' : '#5BE3A0') : 'rgba(255,255,255,0.6)' }}>
      {icon} {label}
    </button>
  )
}

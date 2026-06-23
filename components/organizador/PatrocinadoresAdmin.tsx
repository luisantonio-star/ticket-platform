'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { guardarPatrocinador, eliminarPatrocinador, subirLogoPatrocinador, type PatrocinadorInput } from '@/lib/actions/patrocinadores'
import { Plus, X, Pencil, Trash2, ImageOff, Upload, Check } from 'lucide-react'

export type Patrocinador = {
  id: string
  nombre: string
  logo_url: string | null
  paquete: string
  detalle: string | null
}

export const PAQUETES = [
  { v: 'expansion', label: 'Expansión', sub: '$25,000 MXN' },
  { v: 'sonora', label: 'Sonora', sub: '$10,000 MXN' },
  { v: 'compa', label: 'Compa', sub: 'En especie' },
  { v: 'medios', label: 'Medios', sub: 'Difusión' },
] as const

const NARANJA = '#E85D20'

function vacio(): PatrocinadorInput {
  return { nombre: '', logo_url: null, paquete: '', detalle: '' }
}

export default function PatrocinadoresAdmin({ patrocinadores }: { patrocinadores: Patrocinador[] }) {
  const router = useRouter()
  const [editando, setEditando] = useState<PatrocinadorInput | null>(null)

  const abrirNuevo = () => setEditando(vacio())
  const abrirEditar = (p: Patrocinador) =>
    setEditando({ id: p.id, nombre: p.nombre, logo_url: p.logo_url, paquete: p.paquete, detalle: p.detalle ?? '' })

  const borrar = async (id: string) => {
    if (!confirm('¿Eliminar este patrocinador?')) return
    await eliminarPatrocinador(id)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-lg">Patrocinadores <span className="text-foreground/45 font-medium">({patrocinadores.length})</span></h2>
        <button onClick={abrirNuevo} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-[0_10px_24px_-10px_rgba(16,44,140,0.7)] cursor-pointer">
          <Plus size={18} /> Agregar patrocinador
        </button>
      </div>

      {patrocinadores.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl py-14 text-center text-foreground/55 shadow-[0_10px_30px_-18px_rgba(16,24,48,0.4)]">
          <div className="text-4xl mb-3">🤝</div>
          Aún no hay patrocinadores. Agrega el primero.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {patrocinadores.map((p) => {
            const paq = PAQUETES.find((x) => x.v === p.paquete) ?? PAQUETES[0]
            return (
              <div key={p.id} className="group relative bg-card border border-border rounded-2xl p-4 shadow-[0_10px_30px_-20px_rgba(16,24,48,0.45)]">
                <div className="h-20 rounded-xl bg-muted/50 flex items-center justify-center mb-3 overflow-hidden">
                  {p.logo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.logo_url} alt={p.nombre} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <ImageOff size={24} className="text-foreground/25" />
                  )}
                </div>
                <div className="font-semibold text-sm truncate">{p.nombre}</div>
                <div className="text-xs text-foreground/50">{paq.label} · {paq.sub}</div>

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => abrirEditar(p)} title="Editar" className="w-8 h-8 rounded-lg bg-white/90 text-primary flex items-center justify-center shadow hover:bg-primary hover:text-on-primary transition cursor-pointer"><Pencil size={15} /></button>
                  <button onClick={() => borrar(p.id)} title="Eliminar" className="w-8 h-8 rounded-lg bg-white/90 text-red-600 flex items-center justify-center shadow hover:bg-red-600 hover:text-white transition cursor-pointer"><Trash2 size={15} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editando && <Modal inicial={editando} onClose={() => setEditando(null)} onSaved={() => { setEditando(null); router.refresh() }} />}
    </div>
  )
}

function Modal({ inicial, onClose, onSaved }: { inicial: PatrocinadorInput; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<PatrocinadorInput>(inicial)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)

  const set = <K extends keyof PatrocinadorInput>(k: K, v: PatrocinadorInput[K]) => setForm((f) => ({ ...f, [k]: v }))

  const subirLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(''); setSubiendo(true)
    const fd = new FormData()
    fd.append('logo', file)
    const res = await subirLogoPatrocinador(fd)
    setSubiendo(false)
    if (res.error) { setError(res.error); return }
    if (res.url) set('logo_url', res.url)
  }

  const guardar = async () => {
    setError(''); setGuardando(true)
    const res = await guardarPatrocinador(form)
    setGuardando(false)
    if (res.error) { setError(res.error); return }
    onSaved()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '13px 16px', borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)',
    color: '#fff', fontFamily: 'inherit', fontSize: 14, outline: 'none',
  }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase' }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 640, background: '#15171E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, fontFamily: "'Instrument Sans', system-ui, sans-serif", color: '#fff', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 5, height: 24, borderRadius: 3, background: NARANJA }} />
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 19, letterSpacing: '0.04em', margin: 0, textTransform: 'uppercase' }}>
              {form.id ? 'Editar patrocinador' : 'Nuevo patrocinador'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 4 }}><X size={22} /></button>
        </div>

        <div style={{ padding: '24px 28px 28px' }}>
          {/* Logo */}
          <label style={labelStyle}>Logo de la empresa</label>
          <div style={{ display: 'flex', gap: 14, marginBottom: 6 }}>
            <div style={{ width: 96, height: 70, borderRadius: 12, flexShrink: 0, background: form.logo_url ? '#fff' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {form.logo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={form.logo_url} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <ImageOff size={22} color="rgba(255,255,255,0.35)" />
              )}
            </div>
            <label style={{ flex: 1, borderRadius: 12, border: '1px dashed rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 600 }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={subirLogo} />
              <Upload size={17} /> {subiendo ? 'Subiendo…' : form.logo_url ? 'Cambiar logo' : 'Subir logo (PNG/SVG)'}
            </label>
          </div>
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>Fondo transparente recomendado. Máx. 5 MB.</p>

          {/* Nombre */}
          <label style={labelStyle}>Nombre de la empresa *</label>
          <input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej. Nissauto, Gasolineras ARCO…" style={{ ...inputStyle, marginBottom: 20 }} />

          {/* Paquete */}
          <label style={labelStyle}>Paquete de patrocinio *</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
            {PAQUETES.map((p) => {
              const activo = form.paquete === p.v
              return (
                <button key={p.v} onClick={() => set('paquete', p.v)}
                  style={{ position: 'relative', textAlign: 'left', padding: '16px 18px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
                    border: `1px solid ${activo ? '#16B45577' : 'rgba(255,255,255,0.12)'}`,
                    background: activo ? 'rgba(22,180,88,0.1)' : 'rgba(255,255,255,0.04)' }}>
                  {activo && <Check size={16} color="#5BE3A0" style={{ position: 'absolute', top: 12, right: 12 }} />}
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{p.label}</div>
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{p.sub}</div>
                </button>
              )
            })}
          </div>

          {/* Detalle */}
          <label style={labelStyle}>Detalle de aportación (opcional)</label>
          <input value={form.detalle} onChange={(e) => set('detalle', e.target.value)} placeholder="Ej. Stand 3x3 + Roll-up + Mochila promo…" style={{ ...inputStyle, marginBottom: 18 }} />

          {error && <p style={{ color: '#FCA5A5', fontSize: 13, marginBottom: 14 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={guardar} disabled={guardando} style={{ flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: NARANJA, color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.6 : 1 }}>
              {guardando ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Agregar patrocinador'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

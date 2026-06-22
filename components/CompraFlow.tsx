'use client'

import { useState } from 'react'
import { crearCheckout } from '@/lib/actions/checkout'

type TipoBoleto = {
  id: string
  nombre: string
  descripcion?: string | null
  precio: number
  cantidad_disponible: number
}

type Evento = {
  id: string
  nombre: string
  fecha: string
  ubicacion: string
  tipos_boleto: TipoBoleto[]
} | null

const REGIMENES = [
  '601 - General de Ley Personas Morales',
  '603 - Personas Morales con Fines no Lucrativos',
  '605 - Sueldos y Salarios',
  '606 - Arrendamiento',
  '608 - Demás ingresos',
  '611 - Ingresos por Dividendos',
  '612 - Personas Físicas con Actividades Empresariales',
  '614 - Ingresos por intereses',
  '616 - Sin obligaciones fiscales',
  '621 - Incorporación Fiscal',
  '625 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
  '626 - Régimen Simplificado de Confianza',
]

export default function CompraFlow({ evento }: { evento: Evento }) {
  const [paso, setPaso] = useState(1)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoBoleto | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [asistentes, setAsistentes] = useState<{ nombre: string; email: string; telefono: string }[]>([
    { nombre: '', email: '', telefono: '' },
  ])
  const [fiscal, setFiscal] = useState({ rfc: '', razonSocial: '', cp: '', regimen: '', emailFiscal: '' })
  const [quiereFactura, setQuiereFactura] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tipos = evento?.tipos_boleto ?? []
  const total = tipoSeleccionado ? tipoSeleccionado.precio * cantidad : 0

  const setAsistente = (i: number, campo: 'nombre' | 'email' | 'telefono', valor: string) => {
    setAsistentes((prev) => prev.map((a, idx) => (idx === i ? { ...a, [campo]: valor } : a)))
  }

  const irPaso2 = () => {
    if (!tipoSeleccionado) return
    // Ajusta el arreglo de asistentes a la cantidad elegida (conserva lo ya escrito)
    setAsistentes((prev) => {
      const next = [...prev]
      while (next.length < cantidad) next.push({ nombre: '', email: '', telefono: '' })
      return next.slice(0, cantidad)
    })
    setPaso(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const irPaso3 = async () => {
    const incompleto = asistentes.findIndex((a) => !a.nombre || !a.email)
    if (incompleto !== -1) { setError(`Completa nombre y correo del asistente #${incompleto + 1}`); return }
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('eventoId', evento!.id)
      fd.append('tipoBoletoId', tipoSeleccionado!.id)
      fd.append('cantidad', String(cantidad))
      fd.append('asistentes', JSON.stringify(asistentes))
      fd.append('nombreComprador', asistentes[0].nombre)
      fd.append('emailComprador', asistentes[0].email)
      if (quiereFactura) {
        fd.append('facturaRfc', fiscal.rfc)
        fd.append('facturaRazonSocial', fiscal.razonSocial)
        fd.append('facturaCp', fiscal.cp)
        fd.append('facturaRegimen', fiscal.regimen)
        fd.append('facturaEmail', fiscal.emailFiscal)
      }
      await crearCheckout(fd)
    } catch {
      setError('Error al procesar. Intenta de nuevo.')
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '13px 15px',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
    background: 'rgba(255,255,255,0.06)', color: '#fff',
    fontFamily: 'inherit', fontSize: 14, outline: 'none',
  }

  const PASOS = ['CARNETS', 'REGISTRO', 'PAGO']

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
        {PASOS.map((label, i) => {
          const num = i + 1
          const activo = paso === num
          const done = paso > num
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, background: activo ? '#E85D20' : done ? 'rgba(232,93,32,0.3)' : 'rgba(255,255,255,0.08)', color: activo ? '#fff' : done ? '#E85D20' : 'rgba(255,255,255,0.3)', border: activo ? 'none' : done ? '2px solid #E85D20' : '2px solid rgba(255,255,255,0.12)' }}>
                  {done ? '✓' : num}
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: activo ? '#E85D20' : 'rgba(255,255,255,0.3)' }}>{label}</span>
              </div>
              {i < PASOS.length - 1 && (
                <div style={{ width: 80, height: 1, background: done ? 'rgba(232,93,32,0.4)' : 'rgba(255,255,255,0.1)', margin: '0 8px', marginBottom: 20 }} />
              )}
            </div>
          )
        })}
      </div>

      {/* ── PASO 1: SELECCIONAR BOLETO ── */}
      {paso === 1 && (
        <>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 6vw, 42px)', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '0 0 8px', textAlign: 'center' }}>
            SELECCIONA TUS <span style={{ color: '#E85D20' }}>BOLETOS</span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontStyle: 'italic', margin: '0 0 32px' }}>
            {evento?.nombre ?? 'Cargando evento...'}
          </p>

          {tipos.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 40 }}>No hay boletos disponibles.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {tipos.map((tipo) => {
                const sel = tipoSeleccionado?.id === tipo.id
                const agotado = tipo.cantidad_disponible === 0
                return (
                  <div
                    key={tipo.id}
                    onClick={() => !agotado && setTipoSeleccionado(tipo)}
                    style={{ padding: '20px 22px', borderRadius: 14, border: `2px solid ${sel ? '#E85D20' : 'rgba(255,255,255,0.1)'}`, background: sel ? 'rgba(232,93,32,0.08)' : 'rgba(255,255,255,0.03)', cursor: agotado ? 'not-allowed' : 'pointer', opacity: agotado ? 0.4 : 1 }}
                  >
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 17, textTransform: 'uppercase', marginBottom: 4 }}>{tipo.nombre}</div>
                    {tipo.descripcion && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>{tipo.descripcion}</div>}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 26, color: '#E85D20' }}>${tipo.precio.toLocaleString('es-MX')}</span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>MXN</span>
                    </div>
                    {agotado && <div style={{ fontSize: 11, color: '#E85D20', fontWeight: 700, marginTop: 4 }}>AGOTADO</div>}
                  </div>
                )
              })}
            </div>
          )}

          {/* Cantidad */}
          {tipoSeleccionado && (
            <div style={{ padding: '18px 22px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, textTransform: 'uppercase', marginBottom: 2 }}>CANTIDAD DE PERSONAS</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Puedes registrar hasta 10 asistentes por compra.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '4px 6px' }}>
                <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 20, cursor: 'pointer', fontWeight: 700 }}>−</button>
                <span style={{ minWidth: 32, textAlign: 'center', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18 }}>{cantidad}</span>
                <button onClick={() => setCantidad(Math.min(10, cantidad + 1))} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: '#E85D20', color: '#fff', fontSize: 20, cursor: 'pointer', fontWeight: 700 }}>+</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={irPaso2}
              disabled={!tipoSeleccionado}
              style={{ padding: '16px 36px', borderRadius: 12, border: 'none', background: tipoSeleccionado ? '#E85D20' : 'rgba(255,255,255,0.1)', color: tipoSeleccionado ? '#fff' : 'rgba(255,255,255,0.3)', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, letterSpacing: '0.06em', cursor: tipoSeleccionado ? 'pointer' : 'not-allowed', boxShadow: tipoSeleccionado ? '0 8px 28px rgba(232,93,32,0.4)' : 'none' }}
            >
              Siguiente Paso →
            </button>
          </div>
        </>
      )}

      {/* ── PASO 2: REGISTRO ── */}
      {paso === 2 && (
        <>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 6vw, 40px)', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '0 0 6px', textAlign: 'center' }}>
            DATOS DE <span style={{ color: '#E85D20' }}>REGISTRO</span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', fontStyle: 'italic', margin: '0 0 32px' }}>
            Información individual de cada asistente.
          </p>

          {/* Una card por asistente */}
          {asistentes.map((asistente, i) => (
            <div key={i} style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', padding: '22px 22px 24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E85D20' }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff' }}>ASISTENTE #{i + 1}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase' }}>Nombre Completo</div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.4 }}>👤</span>
                    <input
                      placeholder="Como aparecerá en el carnet"
                      value={asistente.nombre}
                      onChange={e => setAsistente(i, 'nombre', e.target.value)}
                      style={{ ...inputStyle, paddingLeft: 40 }}
                    />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase' }}>Correo Electrónico</div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.4 }}>✉️</span>
                    <input
                      placeholder="Para enviar el boleto digital"
                      type="email"
                      value={asistente.email}
                      onChange={e => setAsistente(i, 'email', e.target.value)}
                      style={{ ...inputStyle, paddingLeft: 40 }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase' }}>Teléfono Celular</div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.4 }}>📱</span>
                  <input
                    placeholder="WhatsApp para notificaciones importantes"
                    type="tel"
                    value={asistente.telefono}
                    onChange={e => setAsistente(i, 'telefono', e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 40 }}
                  />
                </div>
              </div>
            </div>
          ))}
          <div style={{ height: 12 }} />

          {/* ¿Necesitas factura? */}
          {!quiereFactura ? (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 16, textTransform: 'uppercase', marginBottom: 6 }}>¿Necesitas factura?</div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 16px', lineHeight: 1.5 }}>
                Si requieres comprobante fiscal, selecciona esta opción para ingresar tus datos.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                  onClick={() => setQuiereFactura(true)}
                  style={{ padding: '18px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', textAlign: 'left', letterSpacing: '0.04em' }}
                >
                  Sí, llenar datos de facturación →
                </button>
                <button
                  onClick={irPaso3}
                  disabled={loading}
                  style={{ padding: '18px 14px', borderRadius: 12, border: 'none', background: loading ? 'rgba(255,255,255,0.1)' : '#E85D20', color: loading ? 'rgba(255,255,255,0.4)' : '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.04em', boxShadow: loading ? 'none' : '0 8px 24px rgba(232,93,32,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  No, ir al pago 🪙
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Datos fiscales */}
              <div style={{ marginBottom: 24, padding: '20px', borderRadius: 14, border: '1px solid rgba(232,93,32,0.35)', background: 'rgba(232,93,32,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#E85D20', textTransform: 'uppercase' }}>Información Fiscal</div>
                  <button onClick={() => setQuiereFactura(false)} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>✕ Cancelar</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <input placeholder="RFC" value={fiscal.rfc} onChange={e => setFiscal({ ...fiscal, rfc: e.target.value.toUpperCase() })} style={{ ...inputStyle, fontFamily: "'Space Grotesk', monospace", letterSpacing: '0.06em' }} />
                  <input placeholder="Razón Social" value={fiscal.razonSocial} onChange={e => setFiscal({ ...fiscal, razonSocial: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 10, marginBottom: 10 }}>
                  <input placeholder="Código Postal" value={fiscal.cp} onChange={e => setFiscal({ ...fiscal, cp: e.target.value })} style={inputStyle} maxLength={5} />
                  <select value={fiscal.regimen} onChange={e => setFiscal({ ...fiscal, regimen: e.target.value })} style={{ ...inputStyle, appearance: 'none' as const }}>
                    <option value="" style={{ color: '#15181F' }}>Régimen Fiscal</option>
                    {REGIMENES.map(r => <option key={r} value={r} style={{ color: '#15181F' }}>{r}</option>)}
                  </select>
                </div>
                <input placeholder="Correo para facturación" type="email" value={fiscal.emailFiscal} onChange={e => setFiscal({ ...fiscal, emailFiscal: e.target.value })} style={inputStyle} />
              </div>

              {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5', fontSize: 13, marginBottom: 16 }}>{error}</div>}

              <button
                onClick={irPaso3}
                disabled={loading}
                style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: loading ? 'rgba(255,255,255,0.1)' : '#E85D20', color: loading ? 'rgba(255,255,255,0.4)' : '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, letterSpacing: '0.06em', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 8px 28px rgba(232,93,32,0.4)', marginBottom: 12 }}
              >
                {loading ? 'Procesando...' : 'Ir al Pago →'}
              </button>
            </>
          )}

          {error && !quiereFactura && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5', fontSize: 13, marginBottom: 16 }}>{error}</div>}

          {/* Regresar */}
          <button onClick={() => setPaso(1)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 0', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            ← REGRESAR
          </button>
        </>
      )}

    </div>
  )
}

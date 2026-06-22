import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'

export default async function BoletoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Acceso público por enlace: leemos con la clave del servidor (los boletos
  // ya no son legibles con la clave pública por seguridad de datos).
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: boleto } = await supabase
    .from('boletos')
    .select(`
      id,
      codigo_qr,
      estado,
      asistente_nombre,
      tipos_boleto (
        nombre,
        precio,
        eventos ( nombre, fecha, hora, ubicacion )
      )
    `)
    .eq('id', id)
    .single()

  if (!boleto) notFound()

  // Supabase devuelve las relaciones anidadas; normalizamos a objeto
  const tipoRaw = Array.isArray(boleto.tipos_boleto) ? boleto.tipos_boleto[0] : boleto.tipos_boleto
  const tipo = tipoRaw as { nombre: string; precio: number; eventos: unknown } | undefined
  const eventoRaw = tipo ? (Array.isArray(tipo.eventos) ? tipo.eventos[0] : tipo.eventos) : null
  const evento = eventoRaw as { nombre: string; fecha: string; hora: string; ubicacion: string } | null

  const activo = boleto.estado === 'activo'
  const estadoColor = activo ? '#22c55e' : boleto.estado === 'usado' ? 'rgba(255,255,255,0.4)' : '#ef4444'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0d0a1f 0%, #12102a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Instrument Sans', system-ui, sans-serif", color: '#fff' }}>
      <div style={{ width: '100%', maxWidth: 380, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(12px)' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #E85D20 0%, #c04515 100%)', padding: '22px 24px', color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.8, margin: '0 0 4px' }}>Tu boleto</p>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 22, lineHeight: 1.1, margin: 0, textTransform: 'uppercase' }}>{evento?.nombre ?? 'Evento'}</h1>
          <p style={{ fontSize: 13, opacity: 0.9, margin: '6px 0 0' }}>{tipo?.nombre}{boleto.asistente_nombre ? ` · ${boleto.asistente_nombre}` : ''}</p>
        </div>

        {/* QR */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 24px 20px' }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 16, opacity: activo ? 1 : 0.35, filter: activo ? 'none' : 'grayscale(1)' }}>
            <QRCodeSVG value={boleto.codigo_qr} size={200} level="H" />
          </div>
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', letterSpacing: '0.05em' }}>{boleto.codigo_qr}</p>

        {/* Info */}
        <div style={{ padding: '0 24px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 18 }}>
            {evento?.fecha && <Campo label="Fecha" valor={formatFecha(evento.fecha)} />}
            {evento?.hora && <Campo label="Hora" valor={evento.hora.slice(0, 5)} />}
            {evento?.ubicacion && <Campo label="Ubicación" valor={evento.ubicacion} full />}
            <Campo label="Precio" valor={`$${Number(tipo?.precio ?? 0).toLocaleString('es-MX')} MXN`} />
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: '0 0 4px' }}>Estado</p>
              <span style={{ fontSize: 11, fontWeight: 700, color: estadoColor, textTransform: 'uppercase' }}>{boleto.estado}</span>
            </div>
          </div>

          {!activo && (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#ef4444', marginTop: 16 }}>Este boleto ya no es válido</p>
          )}
        </div>
      </div>
    </div>
  )
}

function Campo({ label, valor, full }: { label: string; valor: string; full?: boolean }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>{valor}</p>
    </div>
  )
}

function formatFecha(fecha: string) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

import { stripe } from '@/lib/stripe'
import { crearOrdenInvitado } from '@/lib/actions/ordenes'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PagoExitosoPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  if (!session_id) redirect('/')

  const session = await stripe.checkout.sessions.retrieve(session_id)

  const wrap = (children: React.ReactNode, maxWidth = 440) => (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% -10%, #2a1206 0%, #12102a 45%, #0d0a1f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Instrument Sans', system-ui, sans-serif", color: '#fff' }}>
      <div style={{ width: '100%', maxWidth, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '40px 32px', textAlign: 'center', backdropFilter: 'blur(12px)', boxShadow: '0 24px 70px rgba(0,0,0,0.5)' }}>
        {children}
      </div>
    </div>
  )

  if (session.payment_status !== 'paid') {
    return wrap(
      <>
        <p style={{ fontSize: 44, margin: '0 0 12px' }}>❌</p>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 22, textTransform: 'uppercase', margin: '0 0 8px' }}>Pago no completado</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 24px' }}>El pago no fue procesado correctamente.</p>
        <Link href="/comprar" style={{ display: 'inline-block', padding: '12px 24px', background: '#E85D20', color: '#fff', fontSize: 14, fontWeight: 800, borderRadius: 12, textDecoration: 'none' }}>
          Intentar de nuevo
        </Link>
      </>
    )
  }

  const m = session.metadata!
  const cantidad = Number(m.cantidad ?? 0)
  const asistentes = Array.from({ length: cantidad }).map((_, i) => {
    const a = JSON.parse(m[`a${i}`] ?? '{}')
    return { nombre: a.n ?? '', email: a.e ?? '', telefono: a.t ?? '' }
  })

  const fiscal = m.factura === '1'
    ? { rfc: m.f_rfc, razonSocial: m.f_razon, cp: m.f_cp, regimen: m.f_regimen, emailFiscal: m.f_email }
    : undefined

  const result = await crearOrdenInvitado({
    eventoId: m.eventoId,
    tipoBoletoId: m.tipoBoletoId,
    precio: Number(m.precio),
    comprador: { nombre: m.compradorNombre, email: m.compradorEmail },
    asistentes,
    fiscal,
    stripeSessionId: session.id,
  })

  if (result.error) {
    return wrap(
      <>
        <p style={{ fontSize: 44, margin: '0 0 12px' }}>⚠️</p>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 22, textTransform: 'uppercase', margin: '0 0 8px' }}>Error al generar boletos</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 16px' }}>Tu pago fue exitoso pero hubo un error. Guarda este código y contacta a soporte.</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{session.id}</p>
      </>
    )
  }

  const total = session.amount_total! / 100
  const boletos = result.boletos ?? []

  return wrap(
    <>
      {/* Check celebratorio */}
      <div style={{ position: 'relative', width: 84, height: 84, margin: '0 auto 22px' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.35), transparent 70%)' }} />
        <div style={{ position: 'relative', width: 84, height: 84, borderRadius: '50%', background: 'rgba(34,197,94,0.16)', border: '2px solid rgba(34,197,94,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42 }}>✅</div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#22C55E', marginBottom: 10, textTransform: 'uppercase' }}>Pago confirmado</div>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 28, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '0 0 10px', lineHeight: 1.1 }}>
        ¡Ya tienes tus <span style={{ color: '#E85D20' }}>boletos</span>!
      </h1>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: '0 0 4px', lineHeight: 1.5 }}>
        Enviamos la confirmación a
      </p>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 26px', wordBreak: 'break-all' }}>{m.compradorEmail}</p>

      {/* Lista de boletos con acceso directo al QR */}
      {boletos.length > 0 && (
        <div style={{ textAlign: 'left', marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 12 }}>
            {boletos.length === 1 ? 'Tu boleto' : `Tus ${boletos.length} boletos`}
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {boletos.map((b, i) => (
              <Link
                key={b.id}
                href={`/boleto/${b.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #E85D20', borderRadius: 12, textDecoration: 'none', color: '#fff' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#E85D20', textTransform: 'uppercase', marginBottom: 2 }}>Boleto {i + 1}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.nombre || 'Asistente'}</div>
                </div>
                <span style={{ flexShrink: 0, padding: '8px 14px', background: '#E85D20', color: '#fff', fontSize: 12, fontWeight: 800, borderRadius: 8, whiteSpace: 'nowrap' }}>
                  Ver QR →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: 24 }}>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Total pagado</span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 24, color: '#E85D20' }}>
          ${total.toLocaleString('es-MX')} <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>MXN</span>
        </span>
      </div>

      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 20px', lineHeight: 1.6 }}>
        💡 Presenta el QR de cada boleto en la entrada. Guarda este correo o los enlaces para acceder cuando quieras.
      </p>

      <Link href="/" style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 12, textDecoration: 'none' }}>
        Volver al inicio
      </Link>
    </>
  )
}

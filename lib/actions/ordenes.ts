'use server'

import { Resend } from 'resend'
import { emailConfirmacionCompra } from '@/lib/emails/confirmacion-compra'

const resend = new Resend(process.env.RESEND_API_KEY)

// ── Compra de invitado (sin cuenta) ──
type Asistente = { nombre: string; email: string; telefono: string }
type Fiscal = { rfc?: string; razonSocial?: string; cp?: string; regimen?: string; emailFiscal?: string }

export async function crearOrdenInvitado({
  eventoId,
  tipoBoletoId,
  precio,
  comprador,
  asistentes,
  fiscal,
  stripeSessionId,
}: {
  eventoId: string
  tipoBoletoId: string
  precio: number
  comprador: { nombre: string; email: string }
  asistentes: Asistente[]
  fiscal?: Fiscal
  stripeSessionId: string
}): Promise<{
  ordenId?: string
  error?: string
  boletos?: { id: string; codigo_qr: string; nombre: string }[]
}> {
  // Cliente con service role para poder escribir sin sesión de usuario
  const { createClient: createAdmin } = await import('@supabase/supabase-js')
  const supabase = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Idempotencia: si ya existe una orden con este session_id, no dupliques
  const { data: existente } = await supabase
    .from('ordenes')
    .select('id')
    .eq('stripe_session_id', stripeSessionId)
    .maybeSingle()
  if (existente) {
    // Recarga de la página: recuperamos los boletos ya creados
    const { data: bs } = await supabase
      .from('boletos')
      .select('id, codigo_qr, asistente_nombre')
      .eq('orden_id', existente.id)
    return {
      ordenId: existente.id,
      boletos: (bs ?? []).map((b) => ({ id: b.id, codigo_qr: b.codigo_qr, nombre: b.asistente_nombre ?? '' })),
    }
  }

  const cantidad = asistentes.length
  const total = precio * cantidad

  const { data: tipo } = await supabase
    .from('tipos_boleto')
    .select('cantidad_disponible, nombre')
    .eq('id', tipoBoletoId)
    .single()

  if (!tipo || tipo.cantidad_disponible < cantidad) {
    return { error: 'No hay suficientes boletos disponibles' }
  }

  const { data: orden, error: ordenError } = await supabase
    .from('ordenes')
    .insert({
      cliente_id: null,
      evento_id: eventoId,
      total,
      estado: 'completada',
      comprador_nombre: comprador.nombre,
      comprador_email: comprador.email,
      stripe_session_id: stripeSessionId,
      factura_rfc: fiscal?.rfc ?? null,
      factura_razon_social: fiscal?.razonSocial ?? null,
      factura_cp: fiscal?.cp ?? null,
      factura_regimen: fiscal?.regimen ?? null,
      factura_email: fiscal?.emailFiscal ?? null,
    })
    .select()
    .single()

  if (ordenError || !orden) {
    return { error: 'Error al crear la orden. Intenta de nuevo.' }
  }

  const boletos = asistentes.map((a) => ({
    orden_id: orden.id,
    tipo_boleto_id: tipoBoletoId,
    cliente_id: null,
    codigo_qr: generarCodigoQR(),
    estado: 'activo',
    asistente_nombre: a.nombre,
    asistente_email: a.email,
    asistente_telefono: a.telefono,
  }))

  const { data: boletosInsertados, error: boletosError } = await supabase
    .from('boletos')
    .insert(boletos)
    .select('id, codigo_qr')

  if (boletosError || !boletosInsertados) {
    await supabase.from('ordenes').delete().eq('id', orden.id)
    return { error: 'Error al generar los boletos. Intenta de nuevo.' }
  }

  // Descontar disponibilidad
  await supabase
    .from('tipos_boleto')
    .update({ cantidad_disponible: tipo.cantidad_disponible - cantidad })
    .eq('id', tipoBoletoId)

  // Correo de confirmación al comprador
  const { data: evento } = await supabase
    .from('eventos')
    .select('nombre, fecha, hora, ubicacion')
    .eq('id', eventoId)
    .single()

  if (comprador.email && evento) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: comprador.email,
      subject: `✅ Tus boletos para ${evento.nombre}`,
      html: emailConfirmacionCompra({
        nombreCliente: comprador.nombre,
        nombreEvento: evento.nombre,
        fecha: formatFecha(evento.fecha),
        hora: evento.hora?.slice(0, 5) ?? '',
        ubicacion: evento.ubicacion,
        total,
        boletos: boletosInsertados.map((b) => ({ id: b.id, codigo_qr: b.codigo_qr, tipo_nombre: tipo.nombre })),
        baseUrl,
      }),
    })
  }

  // Nota: la facturación NO es automática. Los datos fiscales quedan guardados en
  // la orden (factura_*) y el encargado los procesa manualmente desde el panel.

  // Los boletos se insertan en el mismo orden que los asistentes
  return {
    ordenId: orden.id,
    boletos: boletosInsertados.map((b, i) => ({
      id: b.id,
      codigo_qr: b.codigo_qr,
      nombre: asistentes[i]?.nombre ?? '',
    })),
  }
}

function generarCodigoQR(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const random = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `TKT-${random}-${Date.now().toString(36).toUpperCase()}`
}

function formatFecha(fecha: string) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

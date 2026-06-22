'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

type Asistente = { nombre: string; email: string; telefono: string }

type Fiscal = {
  rfc: string
  razonSocial: string
  cp: string
  regimen: string
  emailFiscal: string
}

export async function crearCheckout(fd: FormData) {
  const eventoId = String(fd.get('eventoId') ?? '')
  const tipoBoletoId = String(fd.get('tipoBoletoId') ?? '')
  const asistentes = JSON.parse(String(fd.get('asistentes') ?? '[]')) as Asistente[]
  const compradorNombre = String(fd.get('nombreComprador') ?? '')
  const compradorEmail = String(fd.get('emailComprador') ?? '')

  const quiereFactura = fd.get('facturaRfc') != null

  if (!eventoId || !tipoBoletoId || asistentes.length === 0) {
    throw new Error('Datos de compra incompletos')
  }

  // Cliente público (sin sesión, la compra es de invitado)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [{ data: evento }, { data: tipo }] = await Promise.all([
    supabase.from('eventos').select('nombre').eq('id', eventoId).single(),
    supabase.from('tipos_boleto').select('nombre, precio, cantidad_disponible').eq('id', tipoBoletoId).single(),
  ])

  if (!tipo) throw new Error('Tipo de boleto no encontrado')
  if (tipo.cantidad_disponible < asistentes.length) {
    throw new Error('No hay suficientes boletos disponibles')
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Cada asistente en su propia llave de metadata (límite de Stripe: 500 chars/valor)
  const metaAsistentes: Record<string, string> = {}
  asistentes.forEach((a, i) => {
    metaAsistentes[`a${i}`] = JSON.stringify({ n: a.nombre, e: a.email, t: a.telefono })
  })

  const metaFiscal: Record<string, string> = {}
  if (quiereFactura) {
    const f: Fiscal = {
      rfc: String(fd.get('facturaRfc') ?? ''),
      razonSocial: String(fd.get('facturaRazonSocial') ?? ''),
      cp: String(fd.get('facturaCp') ?? ''),
      regimen: String(fd.get('facturaRegimen') ?? ''),
      emailFiscal: String(fd.get('facturaEmail') ?? ''),
    }
    metaFiscal.factura = '1'
    metaFiscal.f_rfc = f.rfc
    metaFiscal.f_razon = f.razonSocial
    metaFiscal.f_cp = f.cp
    metaFiscal.f_regimen = f.regimen
    metaFiscal.f_email = f.emailFiscal
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'mxn',
    customer_email: compradorEmail || undefined,
    line_items: [
      {
        quantity: asistentes.length,
        price_data: {
          currency: 'mxn',
          unit_amount: Math.round(Number(tipo.precio) * 100), // Stripe usa centavos
          product_data: {
            name: `${tipo.nombre} — ${evento?.nombre ?? 'Evento'}`,
          },
        },
      },
    ],
    metadata: {
      eventoId,
      tipoBoletoId,
      precio: String(tipo.precio),
      compradorNombre,
      compradorEmail,
      cantidad: String(asistentes.length),
      ...metaAsistentes,
      ...metaFiscal,
    },
    success_url: `${baseUrl}/pago/exitoso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/comprar`,
  })

  redirect(session.url!)
}

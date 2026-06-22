'use server'

import { createClient } from '@/lib/supabase-server'
import { createClient as createAdmin } from '@supabase/supabase-js'

export type ScanResult =
  | { ok: true; evento: string; tipo: string; titular: string; codigo: string }
  | { ok: false; razon: string }

function adminClient() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function validarBoleto(codigo: string): Promise<ScanResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, razon: 'No autenticado' }

  const clean = codigo.trim().toUpperCase()

  // Las acreditaciones (patrocinadores/medios) usan el prefijo ACR-
  if (clean.startsWith('ACR-')) {
    return validarAcreditacion(clean)
  }

  const { data: boleto } = await supabase
    .from('boletos')
    .select(`
      id, codigo_qr, estado, asistente_nombre,
      tipos_boleto ( nombre, eventos ( nombre, organizador_id ) )
    `)
    .eq('codigo_qr', clean)
    .single()

  if (!boleto) return { ok: false, razon: 'Boleto no encontrado' }

  // Supabase devuelve relaciones anidadas; normalizamos a objeto
  const tipoRaw = Array.isArray(boleto.tipos_boleto) ? boleto.tipos_boleto[0] : boleto.tipos_boleto
  const tipo = tipoRaw as { nombre: string; eventos: unknown } | undefined
  const eventoRaw = tipo ? (Array.isArray(tipo.eventos) ? tipo.eventos[0] : tipo.eventos) : null
  const evento = eventoRaw as { nombre: string; organizador_id: string } | null

  // Verificar que el evento pertenece al organizador
  if (!evento || evento.organizador_id !== user.id) {
    return { ok: false, razon: 'Este boleto no pertenece a tus eventos' }
  }

  if (boleto.estado === 'usado') {
    return { ok: false, razon: 'Boleto ya fue utilizado' }
  }
  if (boleto.estado !== 'activo') {
    return { ok: false, razon: 'Boleto no válido' }
  }

  // Marcar como usado
  await supabase.from('boletos').update({ estado: 'usado' }).eq('id', boleto.id)

  return {
    ok: true,
    evento: evento.nombre,
    tipo: tipo?.nombre ?? '',
    titular: boleto.asistente_nombre ?? '',
    codigo: clean,
  }
}

async function validarAcreditacion(clean: string): Promise<ScanResult> {
  const admin = adminClient()
  if (!admin) return { ok: false, razon: 'Configuración del servidor incompleta' }

  const { data: acr } = await admin
    .from('acreditaciones')
    .select('id, estado, nombre, tipo_carnet')
    .eq('codigo_qr', clean)
    .single()

  if (!acr) return { ok: false, razon: 'Acreditación no encontrada' }
  if (acr.estado === 'usado') return { ok: false, razon: 'Acreditación ya utilizada' }
  if (acr.estado !== 'activo') return { ok: false, razon: 'Acreditación no válida' }

  await admin.from('acreditaciones').update({ estado: 'usado' }).eq('id', acr.id)

  return {
    ok: true,
    evento: 'Acreditación',
    tipo: acr.tipo_carnet === 'patrocinador' ? 'Patrocinador' : 'Medio de comunicación',
    titular: acr.nombre,
    codigo: clean,
  }
}

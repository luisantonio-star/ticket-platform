'use server'

import { createClient } from '@/lib/supabase-server'

export type ScanResult =
  | { ok: true; evento: string; tipo: string; titular: string; codigo: string }
  | { ok: false; razon: string }

export async function validarBoleto(codigo: string): Promise<ScanResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, razon: 'No autenticado' }

  const clean = codigo.trim().toUpperCase()

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

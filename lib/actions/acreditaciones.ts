'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// Cliente admin (service role) — solo servidor. Para escribir saltándose RLS.
function adminClient() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function requireOrganizador() {
  const server = await createServer()
  const { data: { user } } = await server.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const { data: perfil } = await server
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()
  if (perfil?.rol !== 'organizador') return { error: 'Sin permiso' }
  return { userId: user.id }
}

function generarCodigoQR(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const random = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `ACR-${random}-${Date.now().toString(36).toUpperCase()}`
}

export async function crearAcreditacion(
  _prev: { ok?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const auth = await requireOrganizador()
  if (auth.error) return { error: auth.error }

  const nombre = String(formData.get('nombre') ?? '').trim()
  const correo = String(formData.get('correo') ?? '').trim().toLowerCase()
  const telefono = String(formData.get('telefono') ?? '').trim()
  const tipoCarnet = String(formData.get('tipo_carnet') ?? '')

  if (!nombre || !correo) return { error: 'Nombre y correo son obligatorios' }
  if (!['patrocinador', 'medio', 'general', 'cortesia'].includes(tipoCarnet)) {
    return { error: 'Selecciona el tipo de carnet' }
  }

  const admin = adminClient()
  if (!admin) return { error: 'Falta configurar SUPABASE_SECRET_KEY en el servidor' }

  const { error } = await admin.from('acreditaciones').insert({
    nombre,
    correo,
    telefono: telefono || null,
    tipo_carnet: tipoCarnet,
    codigo_qr: generarCodigoQR(),
    estado: 'activo',
  })

  if (error) return { error: 'No se pudo registrar. Intenta de nuevo.' }

  revalidatePath('/dashboard/organizador/acreditaciones')
  return { ok: true }
}

export async function eliminarAcreditacion(formData: FormData): Promise<void> {
  const auth = await requireOrganizador()
  if (auth.error) return

  const id = String(formData.get('id') ?? '')
  if (!id) return

  const admin = adminClient()
  if (!admin) return

  await admin.from('acreditaciones').delete().eq('id', id)
  revalidatePath('/dashboard/organizador/acreditaciones')
}

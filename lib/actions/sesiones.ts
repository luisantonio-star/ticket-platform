'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export type Ponente = { nombre: string; visible: boolean }

export type SesionInput = {
  id?: string
  titulo: string
  subtitulo: string
  etiqueta: string
  horario: string
  tipo: string
  ponentes: Ponente[]
  publica: boolean
  highlight: boolean
}

const TIPOS = ['conferencia', 'conversatorio', 'especial', 'registro', 'sorpresa']

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

function limpiar(input: SesionInput) {
  const tipo = TIPOS.includes(input.tipo) ? input.tipo : 'conferencia'
  const ponentes = (input.ponentes ?? [])
    .map((p) => ({ nombre: String(p.nombre ?? '').trim(), visible: p.visible !== false }))
    .filter((p) => p.nombre)
  return {
    titulo: String(input.titulo ?? '').trim(),
    subtitulo: String(input.subtitulo ?? '').trim() || null,
    etiqueta: String(input.etiqueta ?? '').trim() || null,
    horario: String(input.horario ?? '').trim() || null,
    tipo,
    ponentes,
    publica: input.publica !== false,
    highlight: input.highlight === true,
  }
}

export async function guardarSesion(
  input: SesionInput
): Promise<{ ok?: boolean; error?: string }> {
  const auth = await requireOrganizador()
  if (auth.error) return { error: auth.error }

  const datos = limpiar(input)
  if (!datos.titulo) return { error: 'El título es obligatorio' }

  const admin = adminClient()
  if (!admin) return { error: 'Falta configurar SUPABASE_SECRET_KEY en el servidor' }

  if (input.id) {
    const { error } = await admin.from('sesiones').update(datos).eq('id', input.id)
    if (error) return { error: 'No se pudo guardar. Intenta de nuevo.' }
  } else {
    const { error } = await admin.from('sesiones').insert(datos)
    if (error) return { error: 'No se pudo crear. Intenta de nuevo.' }
  }

  revalidatePath('/dashboard/organizador/lineup')
  revalidatePath('/')
  return { ok: true }
}

export async function eliminarSesion(id: string): Promise<{ ok?: boolean; error?: string }> {
  const auth = await requireOrganizador()
  if (auth.error) return { error: auth.error }

  const admin = adminClient()
  if (!admin) return { error: 'Configuración del servidor incompleta' }

  await admin.from('sesiones').delete().eq('id', id)
  revalidatePath('/dashboard/organizador/lineup')
  revalidatePath('/')
  return { ok: true }
}

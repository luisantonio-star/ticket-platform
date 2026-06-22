'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// Cliente admin (service role) — solo en el servidor. Permite crear/eliminar
// usuarios de auth sin que la persona tenga que registrarse.
function adminClient() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Verifica que quien llama sea un organizador con sesión
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

export async function crearOrganizador(
  _prev: { ok?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const auth = await requireOrganizador()
  if (auth.error) return { error: auth.error }

  const nombre = String(formData.get('nombre') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!nombre || !email || !password) return { error: 'Completa todos los campos' }
  if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres' }

  const admin = adminClient()
  if (!admin) return { error: 'Falta configurar SUPABASE_SECRET_KEY en el servidor' }

  // Crear el usuario de auth ya confirmado (no necesita verificar correo)
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre },
  })

  if (error || !data.user) {
    const msg = error?.message ?? 'No se pudo crear la cuenta'
    if (msg.toLowerCase().includes('already')) return { error: 'Ese correo ya está registrado' }
    return { error: msg }
  }

  // Crear su perfil como organizador
  const { error: perfilError } = await admin.from('perfiles').insert({
    id: data.user.id,
    nombre,
    email,
    rol: 'organizador',
  })

  if (perfilError) {
    // Revertir el usuario de auth si el perfil falla
    await admin.auth.admin.deleteUser(data.user.id)
    return { error: 'Error al guardar el perfil. Intenta de nuevo.' }
  }

  revalidatePath('/dashboard/organizador/personal')
  return { ok: true }
}

export async function eliminarOrganizador(formData: FormData): Promise<void> {
  const auth = await requireOrganizador()
  if (auth.error) return

  const id = String(formData.get('id') ?? '')
  // No permitir auto-eliminarse
  if (!id || id === auth.userId) return

  const admin = adminClient()
  if (!admin) return

  await admin.from('perfiles').delete().eq('id', id)
  await admin.auth.admin.deleteUser(id)

  revalidatePath('/dashboard/organizador/personal')
}

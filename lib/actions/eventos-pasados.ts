'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

const BUCKET = 'eventos-pasados'

// Cliente admin (service role) — solo servidor. Necesario para subir/borrar en
// Storage y escribir en la tabla saltándose RLS.
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

// Crea el bucket público la primera vez (idempotente).
async function asegurarBucket(admin: NonNullable<ReturnType<typeof adminClient>>) {
  const { data } = await admin.storage.getBucket(BUCKET)
  if (data) return
  await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024, // 8 MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
  })
}

export async function subirEventoPasado(
  _prev: { ok?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const auth = await requireOrganizador()
  if (auth.error) return { error: auth.error }

  const titulo = String(formData.get('titulo') ?? '').trim()
  const file = formData.get('imagen') as File | null

  if (!file || file.size === 0) return { error: 'Selecciona una imagen' }
  if (file.size > 8 * 1024 * 1024) return { error: 'La imagen no debe pesar más de 8 MB' }
  if (!file.type.startsWith('image/')) return { error: 'El archivo debe ser una imagen' }

  const admin = adminClient()
  if (!admin) return { error: 'Falta configurar SUPABASE_SECRET_KEY en el servidor' }

  await asegurarBucket(admin)

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error: upErr } = await admin.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (upErr) return { error: 'No se pudo subir la imagen. Intenta de nuevo.' }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path)

  const { error: dbErr } = await admin.from('eventos_pasados').insert({
    titulo: titulo || null,
    image_url: pub.publicUrl,
    storage_path: path,
  })

  if (dbErr) {
    // Limpiar el archivo huérfano si la fila falla
    await admin.storage.from(BUCKET).remove([path])
    return { error: 'No se pudo guardar la imagen. Intenta de nuevo.' }
  }

  revalidatePath('/dashboard/organizador/eventos-pasados')
  revalidatePath('/')
  return { ok: true }
}

export async function eliminarEventoPasado(formData: FormData): Promise<void> {
  const auth = await requireOrganizador()
  if (auth.error) return

  const id = String(formData.get('id') ?? '')
  const path = String(formData.get('storage_path') ?? '')
  if (!id) return

  const admin = adminClient()
  if (!admin) return

  await admin.from('eventos_pasados').delete().eq('id', id)
  if (path) await admin.storage.from(BUCKET).remove([path])

  revalidatePath('/dashboard/organizador/eventos-pasados')
  revalidatePath('/')
}

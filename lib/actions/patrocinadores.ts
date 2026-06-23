'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export type PatrocinadorInput = {
  id?: string
  nombre: string
  logo_url: string | null
  paquete: string
  detalle: string
}

const PAQUETES = ['expansion', 'sonora', 'compa', 'medios']

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
  const { data: perfil } = await server.from('perfiles').select('rol').eq('id', user.id).single()
  if (perfil?.rol !== 'organizador') return { error: 'Sin permiso' }
  return { userId: user.id }
}

export async function subirLogoPatrocinador(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const auth = await requireOrganizador()
  if (auth.error) return { error: auth.error }

  const file = formData.get('logo') as File | null
  if (!file || file.size === 0) return { error: 'Selecciona una imagen' }
  if (file.size > 5 * 1024 * 1024) return { error: 'El logo no debe pesar más de 5 MB' }
  if (!file.type.startsWith('image/')) return { error: 'El archivo debe ser una imagen' }

  const admin = adminClient()
  if (!admin) return { error: 'Falta configurar SUPABASE_SECRET_KEY en el servidor' }

  const BUCKET = 'patrocinadores'
  const { data: bucket } = await admin.storage.getBucket(BUCKET)
  if (!bucket) {
    await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'],
    })
  }

  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await admin.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (error) return { error: 'No se pudo subir el logo. Intenta de nuevo.' }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path)
  return { url: pub.publicUrl }
}

export async function guardarPatrocinador(
  input: PatrocinadorInput
): Promise<{ ok?: boolean; error?: string }> {
  const auth = await requireOrganizador()
  if (auth.error) return { error: auth.error }

  const nombre = String(input.nombre ?? '').trim()
  if (!nombre) return { error: 'El nombre de la empresa es obligatorio' }
  if (!PAQUETES.includes(input.paquete)) return { error: 'Selecciona un paquete de patrocinio' }

  const admin = adminClient()
  if (!admin) return { error: 'Falta configurar SUPABASE_SECRET_KEY en el servidor' }

  const datos = {
    nombre,
    logo_url: input.logo_url || null,
    paquete: input.paquete,
    detalle: String(input.detalle ?? '').trim() || null,
  }

  if (input.id) {
    const { error } = await admin.from('patrocinadores').update(datos).eq('id', input.id)
    if (error) return { error: 'No se pudo guardar. Intenta de nuevo.' }
  } else {
    const { error } = await admin.from('patrocinadores').insert(datos)
    if (error) return { error: 'No se pudo agregar. Intenta de nuevo.' }
  }

  revalidatePath('/dashboard/organizador/patrocinadores')
  revalidatePath('/')
  return { ok: true }
}

export async function eliminarPatrocinador(id: string): Promise<void> {
  const auth = await requireOrganizador()
  if (auth.error) return
  const admin = adminClient()
  if (!admin) return
  await admin.from('patrocinadores').delete().eq('id', id)
  revalidatePath('/dashboard/organizador/patrocinadores')
  revalidatePath('/')
}

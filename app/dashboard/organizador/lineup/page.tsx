import { createClient } from '@/lib/supabase-server'
import SesionesAdmin, { type Sesion } from '@/components/organizador/SesionesAdmin'

export const dynamic = 'force-dynamic'

export default async function LineupPage() {
  // El organizador (autenticado) ve TODAS las sesiones, incluidas las ocultas
  const supabase = await createClient()
  const { data } = await supabase
    .from('sesiones')
    .select('*')
    .order('orden', { ascending: true })
    .order('created_at', { ascending: true })

  const sesiones = (data ?? []) as Sesion[]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="mb-7">
        <span className="text-sm font-semibold text-primary">Sitio público</span>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Lineup</h1>
        <p className="text-foreground/55 mt-1.5">
          Administra las sesiones que aparecen en el lineup de la página principal.
        </p>
      </div>

      <SesionesAdmin sesiones={sesiones} />
    </div>
  )
}

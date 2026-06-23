import { createClient } from '@/lib/supabase-server'
import PatrocinadoresAdmin, { type Patrocinador } from '@/components/organizador/PatrocinadoresAdmin'

export const dynamic = 'force-dynamic'

export default async function PatrocinadoresPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('patrocinadores')
    .select('*')
    .order('orden', { ascending: true })
    .order('created_at', { ascending: true })

  const patrocinadores = (data ?? []) as Patrocinador[]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="mb-7">
        <span className="text-sm font-semibold text-primary">Sitio público</span>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Patrocinadores</h1>
        <p className="text-foreground/55 mt-1.5">
          Administra los patrocinadores y medios que aparecen en la barra del sitio. Los de paquete “Medios” van a la barra de medios.
        </p>
      </div>

      <PatrocinadoresAdmin patrocinadores={patrocinadores} />
    </div>
  )
}

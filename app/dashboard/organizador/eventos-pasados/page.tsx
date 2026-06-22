import { createClient } from '@/lib/supabase-server'
import SubirEventoPasado from '@/components/organizador/SubirEventoPasado'
import { eliminarEventoPasado } from '@/lib/actions/eventos-pasados'
import { Trash2, Images } from 'lucide-react'

export const dynamic = 'force-dynamic'

type EventoPasado = {
  id: string
  titulo: string | null
  image_url: string
  storage_path: string
  created_at: string
}

export default async function EventosPasadosPage() {
  const supabase = await createClient()
  const { data: imagenes } = await supabase
    .from('eventos_pasados')
    .select('*')
    .order('created_at', { ascending: false })

  const lista = (imagenes ?? []) as EventoPasado[]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="mb-7">
        <span className="text-sm font-semibold text-primary">Sitio público</span>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Eventos anteriores</h1>
        <p className="text-foreground/55 mt-1.5">
          Galería de ediciones anteriores que se muestra en la página principal.
        </p>
      </div>

      <div className="mb-8">
        <SubirEventoPasado />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Images size={18} className="text-primary" />
        <h2 className="font-bold text-lg">
          Imágenes publicadas{' '}
          <span className="text-foreground/45 font-medium">({lista.length})</span>
        </h2>
      </div>

      {lista.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl py-16 text-center text-foreground/55 shadow-[0_10px_30px_-18px_rgba(16,24,48,0.4)]">
          <div className="text-4xl mb-3">🖼️</div>
          Aún no has subido imágenes de eventos pasados.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {lista.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-2xl overflow-hidden border border-border bg-card shadow-[0_10px_30px_-20px_rgba(16,24,48,0.45)]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={img.titulo ?? 'Evento pasado'}
                  className="w-full h-full object-cover"
                />
              </div>
              {img.titulo && (
                <div className="px-3 py-2.5 text-sm font-semibold truncate">{img.titulo}</div>
              )}

              <form action={eliminarEventoPasado}>
                <input type="hidden" name="id" value={img.id} />
                <input type="hidden" name="storage_path" value={img.storage_path} />
                <button
                  type="submit"
                  title="Eliminar"
                  className="absolute top-2 right-2 w-9 h-9 rounded-lg bg-white/90 backdrop-blur text-red-600 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition hover:bg-red-600 hover:text-white cursor-pointer"
                >
                  <Trash2 size={17} />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

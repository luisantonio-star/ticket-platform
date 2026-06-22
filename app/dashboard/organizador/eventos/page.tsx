import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Ticket } from 'lucide-react'

export default async function EventosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: eventos } = await supabase
    .from('eventos')
    .select('*')
    .eq('organizador_id', user!.id)
    .order('fecha', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Evento</h1>
      </div>

      {!eventos || eventos.length === 0 ? (
        <div className="bg-background rounded-xl border border-border p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Ticket size={24} className="text-primary" strokeWidth={1.5} />
          </div>
          <p className="text-foreground font-medium mb-1">Sin evento configurado</p>
          <p className="text-foreground/50 text-sm">Aún no hay un evento registrado.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {eventos.map((evento) => (
            <div
              key={evento.id}
              className="bg-background rounded-xl border border-border p-5 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-foreground">{evento.nombre}</h2>
                  <EstadoBadge estado={evento.estado} />
                </div>
                <p className="text-sm text-foreground/50">
                  {formatFecha(evento.fecha)} · {evento.hora?.slice(0, 5)} · {evento.ubicacion}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/organizador/eventos/${evento.id}`}
                  className="px-3 py-1.5 text-sm border border-border text-foreground/70 rounded-lg hover:bg-muted transition-colors duration-200 cursor-pointer"
                >
                  Ver
                </Link>
                <Link
                  href={`/dashboard/organizador/eventos/${evento.id}/editar`}
                  className="px-3 py-1.5 text-sm border border-accent/20 text-accent rounded-lg hover:bg-accent/10 transition-colors duration-200 cursor-pointer"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    activo: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
    finalizado: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[estado] ?? 'bg-gray-100 text-gray-600'}`}>
      {estado}
    </span>
  )
}

function formatFecha(fecha: string) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

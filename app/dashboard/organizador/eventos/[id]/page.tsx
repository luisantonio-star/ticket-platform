import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function EventoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: evento } = await supabase
    .from('eventos')
    .select('*')
    .eq('id', id)
    .eq('organizador_id', user!.id)
    .single()

  if (!evento) notFound()

  const { data: tipos } = await supabase
    .from('tipos_boleto')
    .select('*')
    .eq('evento_id', id)
    .order('precio', { ascending: true })

  const { count: totalOrdenes } = await supabase
    .from('ordenes')
    .select('*', { count: 'exact', head: true })
    .eq('evento_id', id)
    .eq('estado', 'completada')

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/dashboard/organizador/eventos" className="text-sm text-gray-500 hover:text-indigo-600 mb-1 inline-block">
            ← Mis eventos
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{evento.nombre}</h1>
        </div>
        <Link
          href={`/dashboard/organizador/eventos/${id}/editar`}
          className="px-4 py-2 text-sm border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
        >
          Editar
        </Link>
      </div>

      {/* Info del evento */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Fecha</dt>
            <dd className="font-medium text-gray-900">{formatFecha(evento.fecha)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Hora</dt>
            <dd className="font-medium text-gray-900">{evento.hora?.slice(0, 5)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Ubicación</dt>
            <dd className="font-medium text-gray-900">{evento.ubicacion}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Estado</dt>
            <dd className="font-medium text-gray-900 capitalize">{evento.estado}</dd>
          </div>
          {evento.descripcion && (
            <div className="col-span-2">
              <dt className="text-gray-500">Descripción</dt>
              <dd className="font-medium text-gray-900">{evento.descripcion}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500">Órdenes completadas</dt>
            <dd className="font-medium text-gray-900">{totalOrdenes ?? 0}</dd>
          </div>
        </dl>
      </div>

      {/* Tipos de boleto */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Tipos de boleto</h2>
        {!tipos || tipos.length === 0 ? (
          <p className="text-sm text-gray-500">No hay tipos de boleto definidos.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {tipos.map((t) => (
              <div key={t.id} className="py-3 flex justify-between text-sm">
                <span className="font-medium text-gray-900">{t.nombre}</span>
                <div className="flex gap-6 text-gray-500">
                  <span>${Number(t.precio).toFixed(2)}</span>
                  <span>{t.cantidad_disponible}/{t.cantidad_total} disponibles</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatFecha(fecha: string) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

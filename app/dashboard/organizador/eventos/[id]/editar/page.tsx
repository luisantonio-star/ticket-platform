import { createClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import EventoForm from '@/components/organizador/EventoForm'

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: tiposExistentes } = await supabase
    .from('tipos_boleto')
    .select('*')
    .eq('evento_id', id)

  async function editarEvento(formData: FormData) {
    'use server'
    const supabase = await createClient()

    const tiposBoleto = JSON.parse(formData.get('tipos_boleto') as string) as {
      id?: string; nombre: string; precio: number; cantidad_total: number
    }[]

    await supabase.from('eventos').update({
      nombre: formData.get('nombre'),
      fecha: formData.get('fecha'),
      hora: formData.get('hora'),
      ubicacion: formData.get('ubicacion'),
      estado: formData.get('estado'),
    }).eq('id', id)

    // Tipos actuales en la BD (para conservar lo ya vendido)
    const { data: actuales } = await supabase
      .from('tipos_boleto')
      .select('id, cantidad_total, cantidad_disponible')
      .eq('evento_id', id)

    const idsEnviados = tiposBoleto.filter((t) => t.id).map((t) => t.id)

    // 1) Actualizar los existentes sin tocar lo vendido
    for (const t of tiposBoleto) {
      if (!t.id) continue
      const prev = actuales?.find((a) => a.id === t.id)
      const vendidos = prev ? prev.cantidad_total - prev.cantidad_disponible : 0
      const nuevaDisponible = Math.max(0, t.cantidad_total - vendidos)
      await supabase
        .from('tipos_boleto')
        .update({
          nombre: t.nombre,
          precio: t.precio,
          cantidad_total: t.cantidad_total,
          cantidad_disponible: nuevaDisponible,
        })
        .eq('id', t.id)
    }

    // 2) Insertar los nuevos (sin id)
    const nuevos = tiposBoleto.filter((t) => !t.id)
    if (nuevos.length > 0) {
      await supabase.from('tipos_boleto').insert(
        nuevos.map((t) => ({
          evento_id: id,
          nombre: t.nombre,
          precio: t.precio,
          cantidad_total: t.cantidad_total,
          cantidad_disponible: t.cantidad_total,
        }))
      )
    }

    // 3) Eliminar los que el organizador quitó, solo si NO tienen ventas
    for (const a of actuales ?? []) {
      if (idsEnviados.includes(a.id)) continue
      const vendidos = a.cantidad_total - a.cantidad_disponible
      if (vendidos === 0) {
        await supabase.from('tipos_boleto').delete().eq('id', a.id)
      }
      // si tiene ventas, se conserva para no romper los boletos vendidos
    }

    redirect(`/dashboard/organizador/eventos/${id}`)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar evento</h1>
      <EventoForm
        action={editarEvento}
        submitLabel="Guardar cambios"
        defaultValues={{
          nombre: evento.nombre,
          fecha: evento.fecha,
          hora: evento.hora?.slice(0, 5) ?? '',
          ubicacion: evento.ubicacion,
          estado: evento.estado,
          tipos_boleto: tiposExistentes ?? [],
        }}
      />
    </div>
  )
}

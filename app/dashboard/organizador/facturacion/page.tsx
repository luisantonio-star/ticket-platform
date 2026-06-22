import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

type Orden = {
  id: string
  total: number
  created_at: string
  comprador_nombre: string | null
  comprador_email: string | null
  factura_rfc: string | null
  factura_razon_social: string | null
  factura_cp: string | null
  factura_regimen: string | null
  factura_email: string | null
  factura_emitida: boolean | null
}

export default async function FacturacionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Eventos del organizador
  const { data: eventos } = await supabase
    .from('eventos')
    .select('id')
    .eq('organizador_id', user!.id)
  const eventoIds = (eventos ?? []).map((e) => e.id)

  // Órdenes que pidieron factura
  const { data } = await supabase
    .from('ordenes')
    .select('id, total, created_at, comprador_nombre, comprador_email, factura_rfc, factura_razon_social, factura_cp, factura_regimen, factura_email, factura_emitida')
    .in('evento_id', eventoIds.length ? eventoIds : ['00000000-0000-0000-0000-000000000000'])
    .not('factura_rfc', 'is', null)
    .order('created_at', { ascending: false })

  const ordenes = (data ?? []) as Orden[]
  const pendientes = ordenes.filter((o) => !o.factura_emitida)
  const emitidas = ordenes.filter((o) => o.factura_emitida)

  async function marcarFacturada(formData: FormData) {
    'use server'
    const ordenId = String(formData.get('ordenId'))
    const supabase = await createClient()
    await supabase.from('ordenes').update({ factura_emitida: true }).eq('id', ordenId)
    revalidatePath('/dashboard/organizador/facturacion')
  }

  async function desmarcarFacturada(formData: FormData) {
    'use server'
    const ordenId = String(formData.get('ordenId'))
    const supabase = await createClient()
    await supabase.from('ordenes').update({ factura_emitida: false }).eq('id', ordenId)
    revalidatePath('/dashboard/organizador/facturacion')
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Facturación</h1>
      <p className="text-foreground/50 text-sm mb-6">
        Solicitudes de factura de los compradores. Emite el CFDI por tu cuenta y marca cada una como facturada.
      </p>

      {/* Pendientes */}
      <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-3">
        Pendientes ({pendientes.length})
      </h2>
      {pendientes.length === 0 ? (
        <div className="bg-background rounded-xl border border-border p-8 text-center text-foreground/50 text-sm mb-8">
          No hay solicitudes pendientes. 🎉
        </div>
      ) : (
        <div className="grid gap-3 mb-8">
          {pendientes.map((o) => (
            <FacturaCard key={o.id} orden={o} action={marcarFacturada} accionLabel="Marcar como facturada" />
          ))}
        </div>
      )}

      {/* Ya facturadas */}
      {emitidas.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-3">
            Facturadas ({emitidas.length})
          </h2>
          <div className="grid gap-3">
            {emitidas.map((o) => (
              <FacturaCard key={o.id} orden={o} action={desmarcarFacturada} accionLabel="Deshacer" facturada />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function FacturaCard({
  orden,
  action,
  accionLabel,
  facturada,
}: {
  orden: Orden
  action: (formData: FormData) => Promise<void>
  accionLabel: string
  facturada?: boolean
}) {
  return (
    <div className={`bg-background rounded-xl border p-5 ${facturada ? 'border-green-200 opacity-80' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground truncate">{orden.factura_razon_social ?? 'Sin razón social'}</h3>
            {facturada && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">Facturada</span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
            <Campo label="RFC" valor={orden.factura_rfc} mono />
            <Campo label="Régimen" valor={orden.factura_regimen} />
            <Campo label="C.P." valor={orden.factura_cp} />
            <Campo label="Correo fiscal" valor={orden.factura_email} />
            <Campo label="Comprador" valor={orden.comprador_nombre} />
            <Campo label="Total" valor={`$${Number(orden.total).toLocaleString('es-MX')} MXN`} />
          </div>
          <p className="text-xs text-foreground/40 mt-3">{formatFecha(orden.created_at)}</p>
        </div>
        <form action={action} className="shrink-0">
          <input type="hidden" name="ordenId" value={orden.id} />
          <button
            type="submit"
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              facturada
                ? 'border border-border text-foreground/60 hover:bg-muted'
                : 'bg-primary text-on-primary hover:bg-secondary'
            }`}
          >
            {accionLabel}
          </button>
        </form>
      </div>
    </div>
  )
}

function Campo({ label, valor, mono }: { label: string; valor: string | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-foreground/40 mb-0.5">{label}</p>
      <p className={`text-foreground/90 truncate ${mono ? 'font-mono' : ''}`}>{valor || '—'}</p>
    </div>
  )
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

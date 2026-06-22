import { createClient } from '@/lib/supabase-server'
import AgregarAcreditacion from '@/components/organizador/AgregarAcreditacion'
import { eliminarAcreditacion } from '@/lib/actions/acreditaciones'
import { Trash2, QrCode, Handshake, Radio } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Acreditacion = {
  id: string
  nombre: string
  correo: string
  telefono: string | null
  tipo_carnet: string
  codigo_qr: string
  estado: string
}

export default async function AcreditacionesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('acreditaciones')
    .select('*')
    .order('created_at', { ascending: false })

  const lista = (data ?? []) as Acreditacion[]
  const patrocinadores = lista.filter((a) => a.tipo_carnet === 'patrocinador')
  const medios = lista.filter((a) => a.tipo_carnet === 'medio')

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="mb-7">
        <span className="text-sm font-semibold text-primary">Control de acceso</span>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Acreditaciones</h1>
        <p className="text-foreground/55 mt-1.5">
          Registra patrocinadores y medios de comunicación. Cada uno recibe un carnet con QR para entrar.
        </p>
      </div>

      <div className="mb-8">
        <AgregarAcreditacion />
      </div>

      <Seccion titulo="Patrocinadores" icono={<Handshake size={18} className="text-primary" />} lista={patrocinadores} />
      <div className="h-8" />
      <Seccion titulo="Medios de comunicación" icono={<Radio size={18} className="text-primary" />} lista={medios} />
    </div>
  )
}

function Seccion({ titulo, icono, lista }: { titulo: string; icono: React.ReactNode; lista: Acreditacion[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {icono}
        <h2 className="font-bold text-lg">
          {titulo} <span className="text-foreground/45 font-medium">({lista.length})</span>
        </h2>
      </div>

      {lista.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl py-10 text-center text-foreground/55 shadow-[0_10px_30px_-18px_rgba(16,24,48,0.4)]">
          Aún no hay registros.
        </div>
      ) : (
        <div className="grid gap-3">
          {lista.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 shadow-[0_10px_30px_-20px_rgba(16,24,48,0.45)]"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{a.nombre}</div>
                <div className="text-sm text-foreground/55 truncate">
                  {a.correo}{a.telefono ? ` · ${a.telefono}` : ''}
                </div>
                <div className="text-xs font-mono text-foreground/40 mt-0.5">{a.codigo_qr}</div>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  a.estado === 'usado' ? 'bg-muted text-foreground/50' : 'bg-green-100 text-green-700'
                }`}
              >
                {a.estado === 'usado' ? 'Usado' : 'Activo'}
              </span>

              <Link
                href={`/acreditacion/${a.id}`}
                target="_blank"
                title="Ver carnet con QR"
                className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition shrink-0"
              >
                <QrCode size={17} />
              </Link>

              <form action={eliminarAcreditacion}>
                <input type="hidden" name="id" value={a.id} />
                <button
                  type="submit" title="Eliminar"
                  className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition cursor-pointer shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

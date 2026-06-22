import { createClient } from '@/lib/supabase-server'
import AgregarOrganizador from '@/components/organizador/AgregarOrganizador'
import { eliminarOrganizador } from '@/lib/actions/personal'

export const dynamic = 'force-dynamic'

type Perfil = { id: string; nombre: string | null; email: string; created_at: string | null }

export default async function PersonalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('perfiles')
    .select('id, nombre, email, created_at')
    .eq('rol', 'organizador')
    .order('created_at', { ascending: true })

  const personal = (data ?? []) as Perfil[]

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto' }}>
      <h1 className="font-heading text-3xl font-bold text-foreground mb-1">Personal</h1>
      <p className="text-foreground/50 text-sm mb-7">
        Organizadores con acceso al panel. Todos tienen los mismos permisos.
      </p>

      <div className="mb-8">
        <AgregarOrganizador />
      </div>

      <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-3">
        Equipo ({personal.length})
      </h2>

      <div className="grid gap-3">
        {personal.map((p) => {
          const esTu = p.id === user!.id
          return (
            <div
              key={p.id}
              className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between shadow-[0_10px_30px_-22px_rgba(16,24,48,0.45)]"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0"
                  style={{ background: 'linear-gradient(150deg, #1F3AA6, #102C8C)' }}
                >
                  {(p.nombre ?? p.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    <span className="truncate">{p.nombre ?? 'Sin nombre'}</span>
                    {esTu && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-primary-soft text-primary shrink-0">Tú</span>
                    )}
                  </div>
                  <div className="text-sm text-foreground/50 truncate">{p.email}</div>
                </div>
              </div>

              {!esTu && (
                <form action={eliminarOrganizador} className="shrink-0">
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm rounded-lg border border-border text-foreground/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer"
                  >
                    Eliminar
                  </button>
                </form>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

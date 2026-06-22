import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import SidebarNav from '@/components/organizador/SidebarNav'

export default async function OrganizadorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, rol')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'organizador') redirect('/')

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Barra superior */}
      <header className="h-20 flex items-center justify-between px-8 text-white shrink-0 shadow-lg" style={{ background: 'linear-gradient(90deg, #16181D 0%, #1d2230 100%)' }}>
        <Link href="/" className="flex items-center gap-3.5 cursor-pointer">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-heading font-bold text-base shadow-[0_8px_20px_-6px_rgba(16,44,140,0.8)]" style={{ background: 'linear-gradient(150deg, #1F3AA6, #102C8C)' }}>
            TP
          </div>
          <div className="leading-tight">
            <div className="font-heading font-bold text-lg tracking-tight">TicketPlatform</div>
            <div className="text-xs text-white/45">Panel del organizador</div>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-right leading-tight hidden sm:block">
            <div className="text-[15px] font-semibold">{perfil?.nombre}</div>
            <div className="text-xs text-white/45">Organizador</div>
          </div>
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base shadow-[0_8px_20px_-6px_rgba(16,44,140,0.8)]" style={{ background: 'linear-gradient(150deg, #1F3AA6, #102C8C)' }}>
            {(perfil?.nombre ?? 'O').charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-72 bg-card border-r border-border flex flex-col shrink-0">
          <SidebarNav />
          <div className="px-4 py-4 border-t border-border mt-auto">
            <LogoutButton />
          </div>
        </aside>

        {/* Contenido principal */}
        <main
          className="flex-1 p-10 overflow-auto"
          style={{ background: 'radial-gradient(1200px 600px at 0% -10%, rgba(16,44,140,0.10), transparent 60%), linear-gradient(180deg, #EEF1FA 0%, #F3F4F7 55%)' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Ticket, ScanLine, FileText, Users, Images, IdCard, Mic, Handshake } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/dashboard/organizador', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/organizador/eventos', label: 'Evento', icon: Ticket },
  { href: '/dashboard/organizador/lineup', label: 'Lineup', icon: Mic },
  { href: '/dashboard/organizador/facturacion', label: 'Facturación', icon: FileText },
  { href: '/dashboard/organizador/acreditaciones', label: 'Acreditaciones', icon: IdCard },
  { href: '/dashboard/organizador/patrocinadores', label: 'Patrocinadores', icon: Handshake },
  { href: '/dashboard/organizador/eventos-pasados', label: 'Eventos anteriores', icon: Images },
  { href: '/dashboard/organizador/personal', label: 'Personal', icon: Users },
  { href: '/dashboard/organizador/escaner', label: 'Escáner', icon: ScanLine },
]

export default function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-4 py-7 space-y-2">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href !== '/dashboard/organizador' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-primary text-on-primary shadow-[0_10px_24px_-10px_rgba(16,44,140,0.7)]'
                : 'text-foreground/55 hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon size={21} strokeWidth={isActive ? 2.4 : 1.8} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

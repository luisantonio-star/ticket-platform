'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 w-full text-sm text-foreground/50 hover:text-destructive transition-colors duration-200 cursor-pointer"
    >
      <LogOut size={14} strokeWidth={1.5} />
      Cerrar sesión
    </button>
  )
}

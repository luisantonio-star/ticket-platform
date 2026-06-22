'use client'

import { useActionState, useEffect, useRef } from 'react'
import { crearOrganizador } from '@/lib/actions/personal'
import { UserPlus } from 'lucide-react'

export default function AgregarOrganizador() {
  const [state, formAction, pending] = useActionState(crearOrganizador, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-[0_10px_30px_-20px_rgba(16,24,48,0.45)]">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-soft text-primary">
          <UserPlus size={20} />
        </div>
        <div>
          <h2 className="font-heading font-bold text-lg leading-tight">Agregar personal</h2>
          <p className="text-sm text-foreground/50">Crea una cuenta para tu equipo (escáner, facturación, etc.)</p>
        </div>
      </div>

      <form ref={formRef} action={formAction} className="grid sm:grid-cols-3 gap-3">
        <input
          name="nombre"
          placeholder="Nombre completo"
          required
          className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          name="email"
          type="email"
          placeholder="Correo"
          required
          className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          name="password"
          type="text"
          placeholder="Contraseña (mín. 6)"
          required
          minLength={6}
          className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <div className="sm:col-span-3 flex items-center justify-between gap-4 mt-1">
          <div className="text-sm">
            {state?.error && <span className="text-destructive font-medium">{state.error}</span>}
            {state?.ok && <span className="text-success font-medium">✓ Cuenta creada correctamente</span>}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            {pending ? 'Creando...' : 'Crear cuenta'}
          </button>
        </div>
      </form>

      <p className="text-xs text-foreground/40 mt-4">
        La contraseña la defines tú y se la compartes a la persona. Podrá iniciar sesión con su correo y esa contraseña.
      </p>
    </div>
  )
}

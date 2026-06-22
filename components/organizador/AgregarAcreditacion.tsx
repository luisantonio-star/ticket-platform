'use client'

import { useActionState, useEffect, useRef } from 'react'
import { crearAcreditacion } from '@/lib/actions/acreditaciones'
import { UserPlus } from 'lucide-react'

export default function AgregarAcreditacion() {
  const [state, formAction, pending] = useActionState(crearAcreditacion, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-card rounded-2xl border border-border p-6 shadow-[0_10px_30px_-18px_rgba(16,24,48,0.4)]"
    >
      <h2 className="font-bold text-lg mb-1">Registrar acreditación</h2>
      <p className="text-sm text-foreground/55 mb-5">
        Da de alta a un patrocinador o medio de comunicación. Se genera su carnet con QR de acceso.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5">Nombre completo *</label>
          <input
            type="text" name="nombre" required maxLength={120}
            placeholder="Ej. María González"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted/40 text-sm outline-none focus:border-primary/60 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Tipo de carnet *</label>
          <select
            name="tipo_carnet" required defaultValue=""
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted/40 text-sm outline-none focus:border-primary/60 transition"
          >
            <option value="" disabled style={{ color: '#15181F' }}>Selecciona…</option>
            <option value="patrocinador" style={{ color: '#15181F' }}>Patrocinador</option>
            <option value="medio" style={{ color: '#15181F' }}>Medio de comunicación</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Correo *</label>
          <input
            type="email" name="correo" required maxLength={120}
            placeholder="correo@ejemplo.com"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted/40 text-sm outline-none focus:border-primary/60 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Teléfono <span className="text-foreground/40 font-normal">(opcional)</span></label>
          <input
            type="tel" name="telefono" maxLength={20}
            placeholder="Ej. 662 123 4567"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted/40 text-sm outline-none focus:border-primary/60 transition"
          />
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-4">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-4">
          ✓ Acreditación registrada. Aparece abajo en la lista.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 mt-5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-[0_10px_24px_-10px_rgba(16,44,140,0.7)] disabled:opacity-60 cursor-pointer"
      >
        <UserPlus size={18} />
        {pending ? 'Registrando…' : 'Registrar y generar carnet'}
      </button>
    </form>
  )
}

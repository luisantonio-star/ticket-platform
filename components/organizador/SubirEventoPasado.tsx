'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { subirEventoPasado } from '@/lib/actions/eventos-pasados'
import { ImagePlus, UploadCloud } from 'lucide-react'

export default function SubirEventoPasado() {
  const [state, formAction, pending] = useActionState(subirEventoPasado, null)
  const [preview, setPreview] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset()
      setPreview(null)
    }
  }, [state])

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-card rounded-2xl border border-border p-6 shadow-[0_10px_30px_-18px_rgba(16,24,48,0.4)]"
    >
      <h2 className="font-bold text-lg mb-1">Agregar imagen</h2>
      <p className="text-sm text-foreground/55 mb-5">
        Sube fotos de ediciones anteriores. Aparecerán en la galería del sitio público.
      </p>

      <div className="grid md:grid-cols-[200px_1fr] gap-5 items-start">
        {/* Dropzone / preview */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-full aspect-square rounded-xl border-2 border-dashed border-border bg-muted/50 overflow-hidden flex flex-col items-center justify-center gap-2 text-foreground/45 hover:border-primary/50 hover:text-primary transition cursor-pointer"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Vista previa" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <ImagePlus size={32} strokeWidth={1.6} />
              <span className="text-xs font-semibold">Elegir imagen</span>
            </>
          )}
        </button>

        <div className="flex flex-col gap-4">
          <input
            ref={fileRef}
            type="file"
            name="imagen"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={onFile}
            className="hidden"
            required
          />

          <div>
            <label className="block text-sm font-semibold mb-1.5">Título (opcional)</label>
            <input
              type="text"
              name="titulo"
              placeholder="Ej. Edición 2024"
              maxLength={80}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted/40 text-sm outline-none focus:border-primary/60 transition"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-[0_10px_24px_-10px_rgba(16,44,140,0.7)] disabled:opacity-60 cursor-pointer w-fit"
          >
            <UploadCloud size={18} />
            {pending ? 'Subiendo…' : 'Subir imagen'}
          </button>
        </div>
      </div>
    </form>
  )
}

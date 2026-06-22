'use client'

import { useState } from 'react'

type TipoBoleto = {
  id?: string
  nombre: string
  precio: number
  cantidad_total: number
}

type DefaultValues = {
  nombre?: string
  fecha?: string
  hora?: string
  ubicacion?: string
  estado?: string
  tipos_boleto?: TipoBoleto[]
}

type Props = {
  action: (formData: FormData) => Promise<void>
  submitLabel: string
  defaultValues?: DefaultValues
}

export default function EventoForm({ action, submitLabel, defaultValues }: Props) {
  const [tipos, setTipos] = useState<TipoBoleto[]>(
    defaultValues?.tipos_boleto ?? []
  )
  const [pending, setPending] = useState(false)

  const agregarTipo = () => {
    setTipos([...tipos, { nombre: '', precio: 0, cantidad_total: 1 }]) // sin id = nuevo
  }

  const actualizarTipo = (index: number, campo: keyof TipoBoleto, valor: string | number) => {
    const nuevos = [...tipos]
    nuevos[index] = { ...nuevos[index], [campo]: valor }
    setTipos(nuevos)
  }

  const eliminarTipo = (index: number) => {
    setTipos(tipos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    const formData = new FormData(e.currentTarget)
    formData.set('tipos_boleto', JSON.stringify(tipos))
    await action(formData)
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} action="#" className="space-y-5">
      {/* Datos del evento */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Datos del evento</h2>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Nombre *</label>
          <input
            name="nombre"
            required
            defaultValue={defaultValues?.nombre}
            placeholder="Ej. Festival de verano 2026"
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Fecha *</label>
            <input
              name="fecha"
              type="date"
              required
              defaultValue={defaultValues?.fecha}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Hora *</label>
            <input
              name="hora"
              type="time"
              required
              defaultValue={defaultValues?.hora}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Ubicación *</label>
          <input
            name="ubicacion"
            required
            defaultValue={defaultValues?.ubicacion}
            placeholder="Ej. Auditorio Nacional, CDMX"
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {defaultValues?.estado && (
          <div>
            <label className="block text-sm text-gray-700 mb-1">Estado</label>
            <select
              name="estado"
              defaultValue={defaultValues.estado}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="activo">Activo</option>
              <option value="cancelado">Cancelado</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
        )}
      </div>

      {/* Tipos de boleto */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Tipos de boleto</h2>
          <button
            type="button"
            onClick={agregarTipo}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Agregar tipo
          </button>
        </div>

        {tipos.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            Agrega al menos un tipo de boleto
          </p>
        )}

        <div className="space-y-3">
          {tipos.map((tipo, i) => (
            <div key={i} className="grid grid-cols-[1fr_110px_110px_36px] gap-2 items-center">
              <input
                placeholder="Nombre (Ej. General)"
                value={tipo.nombre}
                onChange={(e) => actualizarTipo(i, 'nombre', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                placeholder="Precio"
                min={0}
                step={0.01}
                value={tipo.precio}
                onChange={(e) => actualizarTipo(i, 'precio', parseFloat(e.target.value) || 0)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                placeholder="Cantidad"
                min={1}
                value={tipo.cantidad_total}
                onChange={(e) => actualizarTipo(i, 'cantidad_total', parseInt(e.target.value) || 1)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => eliminarTipo(i)}
                className="text-gray-400 hover:text-red-500 text-lg leading-none transition"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {tipos.length > 0 && (
          <p className="text-xs text-gray-400 mt-3">Nombre · Precio (MXN) · Cantidad</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {pending ? 'Guardando...' : submitLabel}
      </button>
    </form>
  )
}

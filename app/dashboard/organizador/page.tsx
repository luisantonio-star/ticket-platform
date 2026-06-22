import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { DollarSign, Ticket, CalendarCheck, TrendingUp } from 'lucide-react'
import VentasMes from '@/components/organizador/VentasMes'

export default async function OrganizadorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Eventos del organizador con tipos de boleto y boletos vendidos
  const { data: eventos } = await supabase
    .from('eventos')
    .select(`
      id, nombre, fecha, ubicacion, estado,
      tipos_boleto (
        id,
        cantidad_total,
        cantidad_disponible,
        precio
      )
    `)
    .eq('organizador_id', user!.id)
    .order('fecha', { ascending: true })

  // ── Ventas de boletos del mes en curso (por día) ──
  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  const diaActual = ahora.getDate()
  const nombreMes = ahora.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  const tipoIds = (eventos ?? []).flatMap((ev) =>
    (ev.tipos_boleto ?? []).map((t: { id: string }) => t.id)
  )

  const { data: boletosMes } = await supabase
    .from('boletos')
    .select('created_at')
    .in('tipo_boleto_id', tipoIds.length ? tipoIds : ['00000000-0000-0000-0000-000000000000'])
    .gte('created_at', inicioMes.toISOString())

  // Conteo por día (índice 0 = día 1 del mes, hasta hoy)
  const ventasDiarias = new Array(diaActual).fill(0)
  for (const b of boletosMes ?? []) {
    const d = new Date(b.created_at).getDate()
    if (d >= 1 && d <= diaActual) ventasDiarias[d - 1] += 1
  }

  // Calcular stats
  const rows = (eventos ?? []).map((ev) => {
    const tipos = ev.tipos_boleto ?? []
    const capacidad = tipos.reduce((s: number, t: { cantidad_total: number }) => s + t.cantidad_total, 0)
    const disponibles = tipos.reduce((s: number, t: { cantidad_disponible: number }) => s + t.cantidad_disponible, 0)
    const vendidos = capacidad - disponibles
    const ingresos = tipos.reduce((s: number, t: { cantidad_total: number; cantidad_disponible: number; precio: number }) => {
      return s + (t.cantidad_total - t.cantidad_disponible) * t.precio
    }, 0)
    const pct = capacidad > 0 ? Math.round((vendidos / capacidad) * 100) : 0
    const agotado = disponibles === 0 && capacidad > 0
    return { ev, capacidad, vendidos, ingresos, pct, agotado }
  })

  const totalIngresos = rows.reduce((s, r) => s + r.ingresos, 0)
  const totalVendidos = rows.reduce((s, r) => s + r.vendidos, 0)
  const eventosActivos = rows.filter(r => r.ev.estado === 'activo').length
  const ocupacionProm = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.pct, 0) / rows.length) : 0

  const HUES = [258, 250, 230, 264, 240, 270]

  const stats = [
    { label: 'Ingresos totales', valor: `$${totalIngresos.toLocaleString('es-MX')}`, sub: eventosActivos > 0 ? `${eventosActivos} evento${eventosActivos > 1 ? 's' : ''} activo${eventosActivos > 1 ? 's' : ''}` : 'Sin eventos activos', icon: DollarSign, destacado: true },
    { label: 'Boletos vendidos', valor: totalVendidos.toLocaleString('es-MX'), sub: `en ${rows.length} evento${rows.length !== 1 ? 's' : ''}`, icon: Ticket },
    { label: 'Eventos en venta', valor: String(eventosActivos), sub: 'activos ahora', icon: CalendarCheck },
    { label: 'Ocupación prom.', valor: `${ocupacionProm}%`, sub: 'de la capacidad', icon: TrendingUp },
  ]

  return (
    <div style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif", color: '#15181F', maxWidth: 1180, margin: '0 auto' }}>
      {/* Hero header */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 26, padding: '38px 40px', marginBottom: 30, background: 'linear-gradient(125deg, #102C8C 0%, #0B1E63 55%, #16181D 130%)', color: '#fff', boxShadow: '0 24px 60px -22px rgba(11,30,99,0.55)' }}>
        {/* Glows decorativos */}
        <div style={{ position: 'absolute', top: -80, right: -40, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(95,130,255,0.35), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -120, right: 160, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(31,58,166,0.4), transparent 70%)' }} />
        <div style={{ position: 'relative' }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>Panel del organizador</span>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 40, letterSpacing: '-0.03em', margin: '10px 0 8px' }}>Tu evento</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: 0, maxWidth: 460 }}>Resumen de ventas, ingresos y ocupación en tiempo real.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 34 }}>
        {stats.map(({ label, valor, sub, icon: Icon, destacado }) => (
          <div
            key={label}
            style={{
              position: 'relative', overflow: 'hidden', borderRadius: 22, padding: '24px 22px',
              background: destacado ? 'linear-gradient(155deg, #1F3AA6, #0B1E63)' : '#fff',
              color: destacado ? '#fff' : '#15181F',
              border: destacado ? 'none' : '1px solid rgba(16,24,48,0.08)',
              boxShadow: destacado ? '0 18px 40px -16px rgba(11,30,99,0.5)' : '0 10px 30px -18px rgba(16,24,48,0.4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: destacado ? 'rgba(255,255,255,0.7)' : '#5A6072' }}>{label}</span>
              <div style={{ width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: destacado ? 'rgba(255,255,255,0.16)' : '#E8ECFA', color: destacado ? '#fff' : '#102C8C' }}>
                <Icon size={19} strokeWidth={2} />
              </div>
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 32, letterSpacing: '-0.02em', lineHeight: 1 }}>{valor}</div>
            <div style={{ fontSize: 12.5, color: destacado ? '#9DBBFF' : '#8A90A0', marginTop: 9 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Gráfica de ventas del mes */}
      <VentasMes mes={nombreMes} diario={ventasDiarias} />

      {/* Eventos */}
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, letterSpacing: '-0.01em', margin: '0 0 16px' }}>Detalle del evento</h2>

      {rows.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid rgba(16,24,48,0.08)', borderRadius: 22, padding: '70px 20px', textAlign: 'center', boxShadow: '0 10px 30px -18px rgba(16,24,48,0.4)' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🎟️</div>
          <p style={{ color: '#5A6072', fontSize: 15, margin: 0 }}>Aún no hay un evento configurado.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {rows.map(({ ev, capacidad, vendidos, ingresos, pct, agotado }, i) => {
            const hue = HUES[i % HUES.length]
            const poster = `linear-gradient(150deg, oklch(0.5 0.19 ${hue}), oklch(0.34 0.15 ${hue + 18}))`

            return (
              <Link
                key={ev.id}
                href={`/dashboard/organizador/eventos/${ev.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 22, padding: 20, borderRadius: 22, background: '#fff', border: '1px solid rgba(16,24,48,0.08)', textDecoration: 'none', color: 'inherit', boxShadow: '0 10px 30px -20px rgba(16,24,48,0.45)' }}
              >
                {/* Poster */}
                <div style={{ width: 76, height: 76, borderRadius: 16, background: poster, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)', boxShadow: '0 8px 20px -8px rgba(16,24,48,0.5)' }}>
                  <Ticket size={28} strokeWidth={2} />
                </div>

                {/* Nombre */}
                <div style={{ width: 220, flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 3 }}>{ev.nombre}</div>
                  <div style={{ fontSize: 12.5, color: '#8A90A0' }}>{formatFecha(ev.fecha)} · {ev.ubicacion}</div>
                </div>

                {/* Ventas */}
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 7 }}>
                    <span style={{ color: '#5A6072' }}>{vendidos.toLocaleString('es-MX')} / {capacidad.toLocaleString('es-MX')} boletos</span>
                    <span style={{ fontWeight: 700, color: '#102C8C' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 9, background: 'rgba(16,24,48,0.07)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 6, background: agotado ? '#167A47' : 'linear-gradient(90deg, #1F3AA6, #102C8C)' }} />
                  </div>
                </div>

                {/* Ingresos */}
                <div style={{ textAlign: 'right', width: 120, flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: '#8A90A0', marginBottom: 2 }}>Ingresos</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19 }}>${ingresos.toLocaleString('es-MX')}</div>
                </div>

                {/* Estado */}
                <div style={{ width: 92, flexShrink: 0, textAlign: 'right' }}>
                  <span style={{ padding: '6px 13px', borderRadius: 14, fontSize: 11.5, fontWeight: 700, background: agotado ? '#E7F8EE' : ev.estado === 'activo' ? '#E8ECFA' : 'rgba(16,24,48,0.07)', color: agotado ? '#167A47' : ev.estado === 'activo' ? '#102C8C' : '#5A6072' }}>
                    {agotado ? 'Agotado' : ev.estado === 'activo' ? 'En venta' : ev.estado}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function formatFecha(fecha: string) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short',
  })
}

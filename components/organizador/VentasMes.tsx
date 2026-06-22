// Gráfica del acumulado de boletos vendidos en el mes en curso.
// Recibe el conteo diario y dibuja una curva de área (SVG) que sube con las ventas.

type Props = {
  mes: string
  diario: number[] // ventas por día, índice 0 = día 1 del mes (hasta hoy)
}

export default function VentasMes({ mes, diario }: Props) {
  const W = 720
  const H = 240
  const padX = 18
  const padTop = 24
  const padBottom = 26

  // Acumulado
  const acumulado: number[] = []
  diario.reduce((s, v, i) => (acumulado[i] = s + v), 0)

  const totalMes = acumulado.length ? acumulado[acumulado.length - 1] : 0
  const hoy = diario.length ? diario[diario.length - 1] : 0
  const maxY = Math.max(totalMes, 1)
  const n = acumulado.length

  // Coordenadas
  const innerW = W - padX * 2
  const innerH = H - padTop - padBottom
  const x = (i: number) => padX + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const y = (v: number) => padTop + innerH - (v / maxY) * innerH

  const linePoints = acumulado.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const areaPath =
    n > 0
      ? `M ${x(0)},${padTop + innerH} L ${acumulado.map((v, i) => `${x(i)},${y(v)}`).join(' L ')} L ${x(n - 1)},${padTop + innerH} Z`
      : ''

  // Etiquetas del eje X (algunos días)
  const ticks = n > 0 ? [0, Math.floor((n - 1) / 2), n - 1].filter((v, i, a) => a.indexOf(v) === i) : []

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(16,24,48,0.08)',
        borderRadius: 22,
        padding: '24px 24px 14px',
        boxShadow: '0 10px 30px -18px rgba(16,24,48,0.4)',
        marginBottom: 34,
      }}
    >
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: '#5A6072' }}>Ventas de boletos</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 4 }}>
            {totalMes.toLocaleString('es-MX')} <span style={{ fontSize: 15, fontWeight: 500, color: '#8A90A0' }}>este mes</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: '#8A90A0', textTransform: 'capitalize' }}>{mes}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#167A47', marginTop: 4 }}>
            +{hoy.toLocaleString('es-MX')} hoy
          </div>
        </div>
      </div>

      {/* Gráfica */}
      {totalMes === 0 ? (
        <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A90A0', fontSize: 14 }}>
          Aún no hay ventas este mes.
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
          <defs>
            <linearGradient id="areaVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1F3AA6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#1F3AA6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Líneas guía horizontales */}
          {[0, 0.5, 1].map((f) => (
            <line
              key={f}
              x1={padX}
              x2={W - padX}
              y1={padTop + innerH - f * innerH}
              y2={padTop + innerH - f * innerH}
              stroke="rgba(16,24,48,0.06)"
              strokeWidth={1}
            />
          ))}

          {/* Área */}
          <path d={areaPath} fill="url(#areaVentas)" />

          {/* Línea */}
          <polyline points={linePoints} fill="none" stroke="#102C8C" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />

          {/* Punto final */}
          {n > 0 && (
            <circle cx={x(n - 1)} cy={y(acumulado[n - 1])} r={5} fill="#102C8C" stroke="#fff" strokeWidth={2.5} />
          )}

          {/* Etiquetas eje X */}
          {ticks.map((i) => (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={11} fill="#8A90A0">
              {i + 1}
            </text>
          ))}
        </svg>
      )}
    </div>
  )
}

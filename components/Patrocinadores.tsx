import { createClient } from '@supabase/supabase-js'

type Patrocinador = {
  id: string
  nombre: string
  logo_url: string | null
  paquete: string
}

export default async function Patrocinadores() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase
    .from('patrocinadores')
    .select('id, nombre, logo_url, paquete')
    .order('orden', { ascending: true })
    .order('created_at', { ascending: true })

  const lista = (data ?? []) as Patrocinador[]
  if (lista.length === 0) return null

  const filas = [
    { label: 'Paquete Expansión', color: '#E85D20', items: lista.filter((p) => p.paquete === 'expansion') },
    { label: 'Paquete Compa', color: '#E85D20', items: lista.filter((p) => p.paquete === 'compa') },
    { label: 'Patrocinadores Sonora', color: '#E85D20', items: lista.filter((p) => p.paquete === 'sonora') },
    { label: 'Medios de comunicación', color: '#2DD4BF', items: lista.filter((p) => p.paquete === 'medios') },
  ].filter((f) => f.items.length > 0)

  const anims = ['scroll-left 22s linear infinite', 'scroll-right 26s linear infinite', 'scroll-left 24s linear infinite', 'scroll-right 28s linear infinite']

  return (
    <section style={{ background: 'linear-gradient(180deg, #0d0a1f 0%, #0a0a14 100%)', padding: '70px 0 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48, padding: '0 24px' }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(32px, 6vw, 60px)', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
          <span style={{ color: '#fff' }}>NUESTROS</span><br />
          <span style={{ color: '#E85D20' }}>PATROCINADORES</span>
        </h2>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.35)', margin: '12px 0 0', textTransform: 'uppercase' }}>
          EMPRESAS CON VISIÓN DE FUTURO
        </p>
      </div>

      {filas.map((fila, idx) => (
        <div key={fila.label} style={{ marginBottom: idx < filas.length - 1 ? 32 : 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: fila.color,
              background: `${fila.color}1f`,
              border: `1px solid ${fila.color}4d`,
              padding: '4px 14px', borderRadius: 4 }}>
              {fila.label}
            </span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 50, alignItems: 'center', padding: '16px 40px', animation: anims[idx % anims.length], width: 'max-content' }}>
              {[...fila.items, ...fila.items, ...fila.items].map((p, i) => (
                <Logo key={`${p.id}-${i}`} p={p} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

function Logo({ p }: { p: Patrocinador }) {
  return (
    <div style={{ width: 150, height: 60, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 10, overflow: 'hidden' }}>
      {p.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.logo_url} alt={p.nombre} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      ) : (
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.1 }}>{p.nombre}</span>
      )}
    </div>
  )
}

import { createClient } from '@supabase/supabase-js'
import GaleriaEventos, { type ImagenPasada } from '@/components/GaleriaEventos'

export default async function EventosPasados() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase
    .from('eventos_pasados')
    .select('id, titulo, image_url')
    .order('created_at', { ascending: false })
    .limit(12)

  const imagenes = (data ?? []) as ImagenPasada[]
  if (imagenes.length === 0) return null

  return (
    <section style={{ background: 'linear-gradient(180deg, #0a0a14 0%, #0d0a1f 100%)', padding: '80px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: '#E85D20', marginBottom: 12, textTransform: 'uppercase' }}>
            LO QUE YA VIVIMOS
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(32px, 6vw, 60px)', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
            <span style={{ color: '#fff' }}>EVENTOS </span>
            <span style={{ color: '#E85D20' }}>ANTERIORES</span>
          </h2>
        </div>

        <GaleriaEventos imagenes={imagenes} />

        <p style={{ textAlign: 'center', marginTop: 26, fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
          Haz clic en una imagen para ampliarla
        </p>
      </div>
    </section>
  )
}

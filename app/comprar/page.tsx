import { createClient as createServerClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import CompraFlow from '@/components/CompraFlow'

export default async function ComprarPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Trae el primer evento activo (cuando fijes el evento, cambia esto)
  const { data: evento, error } = await supabase
    .from('eventos')
    .select('id, nombre, fecha, ubicacion, tipos_boleto(id, nombre, precio, cantidad_disponible)')
    .eq('estado', 'activo')
    .order('fecha', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) console.error('Error cargando evento:', error.message)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0d0a1f 0%, #12102a 100%)', fontFamily: "'Instrument Sans', system-ui, sans-serif", color: '#fff' }}>
      <CompraFlow evento={evento} />
    </div>
  )
}

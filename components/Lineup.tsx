import { createClient } from '@supabase/supabase-js'
import LineupCards, { type SesionPublica } from './LineupCards'

export default async function Lineup() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase
    .from('sesiones')
    .select('id, titulo, subtitulo, etiqueta, horario, tipo, imagen, ponentes, highlight')
    .eq('publica', true)
    .order('orden', { ascending: true })
    .order('created_at', { ascending: true })

  const sesiones = (data ?? []) as SesionPublica[]
  if (sesiones.length === 0) return null

  return <LineupCards sesiones={sesiones} />
}

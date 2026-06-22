import Link from 'next/link'
import Countdown from '@/components/Countdown'
import Lineup from '@/components/Lineup'
import AdminAcceso from '@/components/AdminAcceso'
import EventosPasados from '@/components/EventosPasados'

export default function HomePage() {
  return (
    <div className="lp-root" style={{ minHeight: '100vh', fontFamily: "'Instrument Sans', system-ui, sans-serif", color: '#fff', background: '#1a0a00' }}>

      {/* NAVBAR */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px clamp(16px, 5vw, 40px)', background: 'rgba(15,8,0,0.75)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>◈</div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '0.1em', lineHeight: 1 }}>NOMBRE EVENTO</div>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', lineHeight: 1, marginTop: 2 }}>ORGANIZACIÓN</div>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px, 4vw, 32px)' }}>
          <a href="#inicio" className="lp-nav-hide-mobile" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#fff', textDecoration: 'none' }}>INICIO</a>
          <Link
            href="/comprar"
            style={{ padding: '11px 24px', borderRadius: 8, background: '#E85D20', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textDecoration: 'none' }}
          >
            ADQUIRIR BOLETO
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section
        id="inicio"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #3B1A08 0%, #7C2E0A 25%, #C45515 50%, #E07830 70%, #8B3A1A 100%)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, padding: '120px 24px 60px' }}>
          {/* Logo evento */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 10px', backdropFilter: 'blur(4px)' }}>◈</div>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.14em' }}>NOMBRE ORGANIZACIÓN</div>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>SUBTÍTULO ORGANIZACIÓN</div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: '#E85D20', marginBottom: 16 }}>· · · PRESENTA · · ·</div>

          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(36px, 7vw, 80px)', lineHeight: 1.0, letterSpacing: '-0.02em', margin: '0 0 20px', textTransform: 'uppercase' }}>
            <span style={{ color: '#fff' }}>NOMBRE DEL EVENTO</span>
            <br />
            <span style={{ color: '#E85D20', fontStyle: 'italic' }}>SUBTÍTULO </span>
            <span style={{ color: '#fff' }}>DEL EVENTO</span>
          </h1>

          <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.75)', marginBottom: 32, textTransform: 'uppercase' }}>
            DESCRIPCIÓN CORTA DEL EVENTO
          </p>

          {/* Pills */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
            {[
              { icon: '📅', label: 'FECHA' },
              { icon: '🕐', label: 'HORA INICIO - HORA FIN' },
              { icon: '📍', label: 'CIUDAD, ESTADO' },
            ].map((p) => (
              <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 30, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' }}>
                <span>{p.icon}</span><span>{p.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 30, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' }}>
              <span>🏛️</span><span>NOMBRE DEL VENUE</span>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/comprar"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '18px 44px', borderRadius: 10, background: '#E85D20', color: '#fff', fontSize: 15, fontWeight: 800, letterSpacing: '0.1em', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 8px 32px rgba(232,93,32,0.5)' }}
          >
            ADQUIRIR MI BOLETO →
          </Link>
        </div>
      </section>

      {/* COUNTDOWN */}
      <Countdown />

      {/* LINEUP */}
      <Lineup />

      {/* PROYECTO SORPRESA */}
      <section style={{ background: '#080808', padding: '90px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {/* Ícono candado */}
          <div style={{ width: 64, height: 64, borderRadius: 16, border: '2px solid #E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>
            🔒
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: '#E85D20', marginBottom: 16 }}>
            CIERRE DEL ENCUENTRO
          </div>

          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(52px, 10vw, 100px)', textTransform: 'uppercase', lineHeight: 0.95, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
            <span style={{ display: 'block', color: '#fff' }}>PROYECTO</span>
            <span style={{ display: 'block', color: 'transparent', WebkitTextStroke: '2px #E85D20' }}>SORPRESA</span>
          </h2>

          <p style={{ fontSize: 17, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', margin: '0 0 12px', lineHeight: 1.5 }}>
            "FRASE DE IMPACTO SOBRE LA SORPRESA DEL EVENTO."
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: '0 0 32px', lineHeight: 1.7 }}>
            Descripción misteriosa del cierre del evento. Solo los que estén<br />en la sala lo sabrán. Y no podrán contarlo todo.
          </p>

          {/* Pills censuradas */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
            {['██████████', '████', '██████████████', '██', '████████████'].map((txt, i) => (
              <div key={i} style={{ padding: '7px 14px', borderRadius: 6, background: 'rgba(255,255,255,0.07)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.15)', userSelect: 'none' }}>
                {txt}
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="#boletos"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '20px 48px', borderRadius: 12, background: '#E85D20', color: '#fff', fontSize: 15, fontWeight: 800, letterSpacing: '0.12em', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 10px 40px rgba(232,93,32,0.5)' }}
          >
            ESTAR AHÍ CUANDO SUCEDA →
          </a>

          <div style={{ marginTop: 20, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.25)' }}>
            BOLETOS LIMITADOS · FECHA · VENUE
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #12102a 100%)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 5vw, 56px)', letterSpacing: '-0.02em', textTransform: 'uppercase', margin: '0 0 14px', color: '#fff' }}>
            TÍTULO QUE <span style={{ color: '#E85D20' }}>IMPACTA</span> AL ASISTENTE
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: '0 0 52px' }}>
            Subtítulo descriptivo del evento o propuesta de valor.
          </p>

          <div className="lp-features-grid">
            {[
              { color: '#E85D20', title: 'BENEFICIO 1', desc: 'Descripción del primer beneficio o propuesta de valor que obtendrá el asistente al ir al evento.' },
              { color: '#4A90D9', title: 'BENEFICIO 2', desc: 'Descripción del segundo beneficio o propuesta de valor que obtendrá el asistente al ir al evento.' },
              { color: '#8B5CF6', title: 'BENEFICIO 3', desc: 'Descripción del tercer beneficio o propuesta de valor. Puede ser algo sorpresa o exclusivo.' },
            ].map((card) => (
              <div key={card.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 120, height: 120, borderRadius: '50%', background: card.color, filter: 'blur(60px)', opacity: 0.2 }} />
                <div style={{ width: 36, height: 36, borderRadius: 10, background: card.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: card.color }} />
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: '0.04em', color: '#fff', margin: '0 0 10px', textTransform: 'uppercase' }}>{card.title}</h3>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PATROCINADORES */}
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

        {/* Fila 1 */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: '#E85D20', background: 'rgba(232,93,32,0.12)', border: '1px solid rgba(232,93,32,0.3)', padding: '4px 14px', borderRadius: 4 }}>
              PAQUETE PRINCIPAL
            </span>
          </div>
          <div style={{ overflow: 'hidden', position: 'relative' }}>
            <div style={{ display: 'flex', gap: 60, alignItems: 'center', padding: '20px 40px', animation: 'scroll-left 18s linear infinite', width: 'max-content' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ width: 140, height: 52, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>LOGO</span>
                </div>
              ))}
              {[...Array(8)].map((_, i) => (
                <div key={`dup-${i}`} style={{ width: 140, height: 52, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>LOGO</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fila 2 */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 14px', borderRadius: 4 }}>
              PATROCINADORES
            </span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 50, alignItems: 'center', padding: '16px 40px', animation: 'scroll-right 22s linear infinite', width: 'max-content' }}>
              {[...Array(10)].map((_, i) => (
                <div key={i} style={{ width: 120, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.15)' }}>LOGO</span>
                </div>
              ))}
              {[...Array(10)].map((_, i) => (
                <div key={`dup-${i}`} style={{ width: 120, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.15)' }}>LOGO</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fila 3 - Medios */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 14px', borderRadius: 4 }}>
              MEDIOS DE COMUNICACIÓN
            </span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 50, alignItems: 'center', padding: '16px 40px', animation: 'scroll-left 20s linear infinite', width: 'max-content' }}>
              {[...Array(9)].map((_, i) => (
                <div key={i} style={{ width: 110, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.15)' }}>LOGO</span>
                </div>
              ))}
              {[...Array(9)].map((_, i) => (
                <div key={`dup-${i}`} style={{ width: 110, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.15)' }}>LOGO</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GUÍA DE VIAJE */}
      <section style={{ background: '#0a0a0a', padding: '60px clamp(20px, 5vw, 40px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: '#E85D20', marginBottom: 6, textTransform: 'uppercase' }}>Logística y Estancia</div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 4vw, 48px)', textTransform: 'uppercase', margin: 0, letterSpacing: '-0.02em' }}>
                <span style={{ color: '#fff' }}>GUÍA DE </span><span style={{ color: '#E85D20' }}>VIAJE</span>
              </h2>
            </div>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
              VER GUÍA COMPLETA
              <span style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</span>
            </a>
          </div>

          <div className="lp-guia-grid">
            {[
              { tipo: 'SEDE DEL EVENTO', nombre: 'NOMBRE DEL VENUE', dir: 'DIRECCIÓN DEL VENUE', emoji: '🏛️' },
              { tipo: 'HOSPEDAJE RECOMENDADO', nombre: 'HOTEL 1', dir: 'DIRECCIÓN, CIUDAD', emoji: '🏨' },
              { tipo: 'HOSPEDAJE RECOMENDADO', nombre: 'HOTEL 2', dir: 'DIRECCIÓN, CIUDAD', emoji: '🏨' },
              { tipo: 'HOSPEDAJE RECOMENDADO', nombre: 'HOTEL 3', dir: 'DIRECCIÓN, CIUDAD', emoji: '🏨' },
            ].map((lugar) => (
              <div key={lugar.nombre} style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                {/* Imagen placeholder */}
                <div style={{ height: 130, background: 'linear-gradient(135deg, rgba(232,93,32,0.15), rgba(255,255,255,0.03))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                  {lugar.emoji}
                </div>
                <div style={{ padding: '14px 16px 18px' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: '#E85D20', marginBottom: 6, textTransform: 'uppercase' }}>{lugar.tipo}</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', textTransform: 'uppercase', marginBottom: 8, lineHeight: 1.2 }}>{lugar.nombre}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                    <span>📍</span><span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lugar.dir}</span>
                  </div>
                  <a href="#" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#E85D20', textDecoration: 'none', textTransform: 'uppercase' }}>CONTACTO</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTOS PASADOS (galería editable por el organizador) */}
      <EventosPasados />

      {/* CTA FINAL */}
      <section id="boletos" style={{ background: '#E85D20', padding: '70px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 5vw, 52px)', color: '#fff', margin: '0 0 28px', letterSpacing: '-0.02em' }}>
          ¿LISTO PARA EL SIGUIENTE NIVEL?
        </h2>
        <a
          href="/comprar"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '20px 52px', borderRadius: 50, background: '#fff', color: '#E85D20', fontSize: 15, fontWeight: 800, letterSpacing: '0.12em', textDecoration: 'none', textTransform: 'uppercase' }}
        >
          COMPRAR BOLETOS AHORA
        </a>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#080808', padding: '50px clamp(20px, 5vw, 40px) 30px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="lp-footer-grid" style={{ maxWidth: 1100, margin: '0 auto', marginBottom: 40 }}>
          {/* Col 1 - Marca */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>◈</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', color: '#fff' }}>NOMBRE EVENTO</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>ORGANIZACIÓN</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, margin: '0 0 16px' }}>
              NOMBRE ORGANIZACIÓN<br />DESCRIPCIÓN CORTA · AÑO
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['f', 'ig', 'in', 'tw'].map((red) => (
                <a key={red} href="#" style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontWeight: 700 }}>{red}</a>
              ))}
            </div>
          </div>

          {/* Col 2 - Navegación */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', color: '#fff', marginBottom: 16, textTransform: 'uppercase' }}>Navegación</div>
            {['SOBRE EL EVENTO', 'EL LINEUP', 'PROYECTO SORPRESA', 'PATROCINADORES', 'HOSPEDAJE'].map((item) => (
              <a key={item} href="#" style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: 10, letterSpacing: '0.06em', fontWeight: 600 }}>{item}</a>
            ))}
          </div>

          {/* Col 3 - Legal */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', color: '#fff', marginBottom: 16, textTransform: 'uppercase' }}>Información Legal</div>
            {['TÉRMINOS Y CONDICIONES', 'AVISO DE PRIVACIDAD', 'CONTACTO'].map((item) => (
              <a key={item} href="#" style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: 10, letterSpacing: '0.06em', fontWeight: 600 }}>{item}</a>
            ))}
            <a href="mailto:contacto@evento.com" style={{ display: 'block', fontSize: 11, color: '#E85D20', textDecoration: 'none', marginTop: 12, letterSpacing: '0.04em' }}>contacto@evento.com</a>
          </div>

          {/* Col 4 - CTA + Lugar */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', color: '#fff', marginBottom: 14, textTransform: 'uppercase' }}>¿Listo para el impacto?</div>
            <a href="/comprar" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, background: '#E85D20', color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textDecoration: 'none', textTransform: 'uppercase', marginBottom: 14 }}>
              ADQUIRIR BOLETO →
            </a>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16 }}>📍</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 2 }}>LUGAR DEL EVENTO</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>NOMBRE DEL VENUE<br />CIUDAD, ESTADO</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
          © {new Date().getFullYear()} NOMBRE ORGANIZACIÓN · TODOS LOS DERECHOS RESERVADOS
        </div>
      </footer>

      {/* CSS animaciones scroll */}
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>

      <AdminAcceso />
    </div>
  )
}

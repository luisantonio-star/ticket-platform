'use client'

import { useEffect, useRef, useState } from 'react'
import { validarBoleto, ScanResult } from '@/lib/actions/scanner'

type Estado = 'idle' | 'scanning' | 'ok' | 'error'

export default function EscanerQR() {
  const [estado, setEstado] = useState<Estado>('idle')
  const [resultado, setResultado] = useState<ScanResult | null>(null)
  const [stats, setStats] = useState({ validos: 0, rechazados: 0, total: 0 })
  const [manualCodigo, setManualCodigo] = useState('')
  const [usarManual, setUsarManual] = useState(false)
  const [camError, setCamError] = useState('')
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null)

  const detener = async () => {
    const s = scannerRef.current
    scannerRef.current = null
    if (!s) return
    try {
      if (s.isScanning) await s.stop()
      await s.clear()
    } catch {
      /* noop */
    }
  }

  useEffect(() => {
    return () => { void detener() }
  }, [])

  const iniciarEscaneo = async () => {
    setCamError('')
    setResultado(null)
    setEstado('scanning')

    const { Html5Qrcode } = await import('html5-qrcode')
    // El div #qr-reader ya está montado (siempre presente en el DOM)
    await detener()

    try {
      const html5 = new Html5Qrcode('qr-reader')
      scannerRef.current = html5
      await html5.start(
        { facingMode: 'environment' }, // cámara trasera en móvil
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (codigo) => {
          await detener()
          await procesarCodigo(codigo)
        },
        () => {} // ignora frames sin QR
      )
    } catch (e) {
      scannerRef.current = null
      setEstado('idle')
      setCamError(
        e instanceof Error && /permission|denied|notallowed/i.test(e.message)
          ? 'No diste permiso para usar la cámara. Habilítalo en el navegador e intenta de nuevo.'
          : 'No se pudo acceder a la cámara. Revisa que ninguna otra app la esté usando, o ingresa el código manualmente.'
      )
    }
  }

  const procesarCodigo = async (codigo: string) => {
    const res = await validarBoleto(codigo)
    setResultado(res)
    setEstado(res.ok ? 'ok' : 'error')
    setStats(prev => ({
      validos: prev.validos + (res.ok ? 1 : 0),
      rechazados: prev.rechazados + (!res.ok ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  const reiniciar = async () => {
    await detener()
    setEstado('idle')
    setResultado(null)
    setManualCodigo('')
    setCamError('')
  }

  const scanCorner = estado === 'ok' ? '#8BE3B0' : estado === 'error' ? '#F87171' : '#fff'
  const scanBg = estado === 'ok' ? 'rgba(22,180,88,0.15)' : estado === 'error' ? 'rgba(220,38,38,0.15)' : 'transparent'

  return (
    <div style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif", color: '#15181F', maxWidth: 460, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', margin: '32px 0 22px' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#102C8C' }}>Control de acceso</span>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, letterSpacing: '-0.03em', margin: '6px 0 0' }}>Escáner de entrada</h1>
        <p style={{ fontSize: 14, color: '#5A6072', margin: '8px 0 0' }}>Escanea el QR del boleto para validar el acceso</p>
      </div>

      {/* Visor de cámara */}
      <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: '#16181D', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: scanBg, transition: 'background .25s ease', pointerEvents: 'none', zIndex: 2 }} />

        {/* Contenedor de video (siempre montado para que start() lo encuentre) */}
        <div id="qr-reader" style={{ width: '100%', height: '100%', display: estado === 'scanning' ? 'block' : 'none' }} />

        {/* Placeholder cuando no se está escaneando */}
        {estado !== 'scanning' && (
          <div style={{ position: 'relative', width: 180, height: 180 }}>
            {[
              { top: 0, left: 0, borderTop: `3px solid ${scanCorner}`, borderLeft: `3px solid ${scanCorner}`, borderTopLeftRadius: 8 },
              { top: 0, right: 0, borderTop: `3px solid ${scanCorner}`, borderRight: `3px solid ${scanCorner}`, borderTopRightRadius: 8 },
              { bottom: 0, left: 0, borderBottom: `3px solid ${scanCorner}`, borderLeft: `3px solid ${scanCorner}`, borderBottomLeftRadius: 8 },
              { bottom: 0, right: 0, borderBottom: `3px solid ${scanCorner}`, borderRight: `3px solid ${scanCorner}`, borderBottomRightRadius: 8 },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 38, height: 38, ...s }} />
            ))}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, zIndex: 3 }}>
              {estado === 'ok' ? '✅' : estado === 'error' ? '❌' : '📷'}
            </div>
          </div>
        )}
      </div>

      {/* Error de cámara */}
      {camError && (
        <div style={{ margin: '14px 0 0', padding: '12px 16px', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 13, color: '#991B1B' }}>
          {camError}
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div style={{ margin: '18px 0', padding: '16px 18px', borderRadius: 14, background: resultado.ok ? '#E7F8EE' : '#FEF2F2', border: `1px solid ${resultado.ok ? '#BBF7D0' : '#FECACA'}` }}>
          {resultado.ok ? (
            <>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#167A47', marginBottom: 4 }}>✓ Boleto válido</div>
              <div style={{ fontSize: 13, color: '#166534' }}>{resultado.evento} · {resultado.tipo}</div>
              <div style={{ fontSize: 12.5, color: '#15803D', marginTop: 2 }}>Titular: {resultado.titular}</div>
              <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 11, color: '#15803D', marginTop: 4, letterSpacing: '0.06em' }}>{resultado.codigo}</div>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#DC2626', marginBottom: 4 }}>✗ Acceso rechazado</div>
              <div style={{ fontSize: 13, color: '#991B1B' }}>{resultado.razon}</div>
            </>
          )}
        </div>
      )}

      {/* Status text */}
      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', color: estado === 'ok' ? '#167A47' : estado === 'error' ? '#DC2626' : '#15181F' }}>
          {estado === 'idle' ? 'Listo para escanear' : estado === 'scanning' ? 'Apunta al código QR' : estado === 'ok' ? '¡Bienvenido!' : 'Acceso rechazado'}
        </div>
        <div style={{ fontSize: 14, color: '#5A6072', marginTop: 6 }}>
          {estado === 'idle' ? 'Presiona el botón para activar la cámara' : estado === 'scanning' ? 'La cámara está activa' : 'Presiona Escanear otro para continuar'}
        </div>
      </div>

      {/* Botón principal */}
      {estado === 'idle' || estado === 'ok' || estado === 'error' ? (
        <button
          onClick={estado === 'idle' ? iniciarEscaneo : reiniciar}
          style={{ width: '100%', padding: '15px', border: 'none', borderRadius: 14, background: '#102C8C', color: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 18px rgba(16,44,140,0.3)', marginBottom: 10 }}
        >
          {estado === 'idle' ? '📷 Activar cámara' : 'Escanear otro'}
        </button>
      ) : (
        <button
          onClick={reiniciar}
          style={{ width: '100%', padding: '15px', border: '1px solid rgba(16,24,48,0.14)', borderRadius: 14, background: '#fff', color: '#5A6072', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}
        >
          Cancelar
        </button>
      )}

      {/* Entrada manual */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => setUsarManual(!usarManual)}
          style={{ width: '100%', padding: '12px', border: '1px solid rgba(16,24,48,0.14)', borderRadius: 12, background: '#fff', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: '#5A6072' }}
        >
          {usarManual ? 'Ocultar entrada manual' : 'Ingresar código manualmente'}
        </button>
        {usarManual && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <input
              value={manualCodigo}
              onChange={e => setManualCodigo(e.target.value.toUpperCase())}
              placeholder="TKT-XXXXXXXX"
              style={{ flex: 1, padding: '12px 14px', border: '1px solid rgba(16,24,48,0.14)', borderRadius: 10, fontFamily: "'Space Grotesk', monospace", fontSize: 14, outline: 'none', letterSpacing: '0.05em', color: '#15181F', background: '#F7F8FB' }}
              onKeyDown={e => { if (e.key === 'Enter' && manualCodigo) procesarCodigo(manualCodigo) }}
            />
            <button
              onClick={() => { if (manualCodigo) procesarCodigo(manualCodigo) }}
              disabled={!manualCodigo}
              style={{ padding: '12px 16px', border: 'none', borderRadius: 10, background: manualCodigo ? '#102C8C' : 'rgba(16,24,48,0.1)', color: manualCodigo ? '#fff' : '#8A90A0', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: manualCodigo ? 'pointer' : 'not-allowed' }}
            >
              Validar
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '18px', background: '#fff', border: '1px solid rgba(16,24,48,0.07)', borderRadius: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: '#167A47' }}>{stats.validos}</div>
          <div style={{ fontSize: 12, color: '#5A6072' }}>Válidos</div>
        </div>
        <div style={{ width: 1, background: 'rgba(16,24,48,0.1)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: '#C0392B' }}>{stats.rechazados}</div>
          <div style={{ fontSize: 12, color: '#5A6072' }}>Rechazados</div>
        </div>
        <div style={{ width: 1, background: 'rgba(16,24,48,0.1)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22 }}>{stats.total}</div>
          <div style={{ fontSize: 12, color: '#5A6072' }}>Total</div>
        </div>
      </div>
    </div>
  )
}

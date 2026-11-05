import { useEffect, useState, useSyncExternalStore } from 'react'
import { obtenerEspera, suscribirEspera } from '../../esperaApi.js'

const ACTUALIZACION_MS = 100

function AlertaEspera({ inicio, fin }) {
  const [ahora, setAhora] = useState(Date.now())

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), ACTUALIZACION_MS)
    return () => clearInterval(intervalo)
  }, [])

  const restante = Math.ceil((fin - ahora) / 1000)
  const progreso = Math.min(100, ((ahora - inicio) / (fin - inicio)) * 100)

  return (
    <aside className="alerta-limite">
      <div className="alerta-texto">
        {/* El error 429 no se puede leer desde el navegador (llega como fallo
            de red), así que primero se descarta que falte internet. */}
        <strong role="alert">
          {navigator.onLine ? 'Límite de la API (429)' : 'Sin conexión'}
        </strong>
        <span className="alerta-tiempo" role="timer">
          {restante > 0 ? `${restante} s` : 'Reintentando'}
        </span>
      </div>

      <div
        className="alerta-barra"
        role="progressbar"
        aria-label="Tiempo de espera"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progreso)}
      >
        <span style={{ width: `${progreso}%` }} />
      </div>
    </aside>
  )
}

function AlertaLimite() {
  const espera = useSyncExternalStore(suscribirEspera, obtenerEspera)

  if (!espera) return null
  return <AlertaEspera key={espera.inicio} {...espera} />
}

export default AlertaLimite

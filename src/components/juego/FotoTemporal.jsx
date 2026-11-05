import { useEffect, useState } from 'react'

const SEGUNDOS_VISIBLE = 2

function textoContador(restante) {
  if (restante === null) return 'Cargando...'
  return restante > 0 ? `⏱ ${restante} s` : '🔒 Oculta'
}

// Foto que se ve unos segundos y luego se desenfoca hasta que se responde.
function FotoTemporal({ src, revelada }) {
  // Vale null hasta que la imagen carga: una conexión lenta no quita tiempo.
  const [restante, setRestante] = useState(null)

  useEffect(() => {
    if (revelada || !restante) return

    const temporizador = setTimeout(() => setRestante(restante - 1), 1000)
    return () => clearTimeout(temporizador)
  }, [restante, revelada])

  const oculta = restante === 0 && !revelada

  return (
    <div className="foto-temporal">
      <img
        src={src}
        alt="Personaje por adivinar"
        className={oculta ? 'borrosa' : undefined}
        onLoad={() => setRestante(SEGUNDOS_VISIBLE)}
      />
      {!revelada && (
        <span className="contador" role="timer">
          {textoContador(restante)}
        </span>
      )}
    </div>
  )
}

export default FotoTemporal

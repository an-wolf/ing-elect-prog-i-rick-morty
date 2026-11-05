import { useState } from 'react'

// Foto cubierta por un velo oscuro: solo se ve dentro de un círculo que sigue
// al cursor (o al dedo en pantallas táctiles) hasta que se responde.
function FotoLinterna({ src, revelada }) {
  const [posicion, setPosicion] = useState(null)

  if (revelada) return <img src={src} alt="Personaje por adivinar" />

  function mover(evento) {
    const caja = evento.currentTarget.getBoundingClientRect()
    setPosicion({
      x: evento.clientX - caja.left,
      y: evento.clientY - caja.top,
    })
  }

  const estiloVelo = posicion && {
    background: `radial-gradient(circle 2.75rem at ${posicion.x}px ${posicion.y}px, transparent 92%, var(--velo) 100%)`,
  }

  return (
    <div
      className="foto-linterna"
      onPointerDown={mover}
      onPointerMove={mover}
      onPointerLeave={() => setPosicion(null)}
    >
      <img src={src} alt="Personaje por adivinar" draggable={false} />
      <div className="velo" style={estiloVelo ?? undefined}>
        {!posicion && <span>Pasa el cursor por la foto</span>}
      </div>
    </div>
  )
}

export default FotoLinterna

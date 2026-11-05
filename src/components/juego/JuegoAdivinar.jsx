import { useEffect, useRef, useState } from 'react'
import { detenerMusica, iniciarMusica } from '../../sonidos.js'
import MigasDePan from '../comunes/MigasDePan.jsx'
import RondaAdivinar from './RondaAdivinar.jsx'

const ACIERTOS_PARA_GANAR = 6

// Partida común de las modalidades "Adivina...": lleva el puntaje y recuerda
// los personajes que ya salieron.
function JuegoAdivinar({ titulo, campo, opciones, Foto }) {
  const [ronda, setRonda] = useState(1)
  const [aciertos, setAciertos] = useState(0)
  const [fallos, setFallos] = useState(0)

  // IDs que ya salieron en esta partida, para no repetir personajes.
  // Es un ref porque cambiarlo no necesita volver a dibujar la pantalla.
  const vistos = useRef(new Set())

  const gano = aciertos >= ACIERTOS_PARA_GANAR

  // La música suena mientras esta pantalla está abierta.
  useEffect(() => {
    iniciarMusica()
    return detenerMusica
  }, [])

  function registrarRespuesta(acerto) {
    if (acerto) setAciertos(aciertos + 1)
    else setFallos(fallos + 1)
  }

  function reiniciar() {
    vistos.current.clear()
    setAciertos(0)
    setFallos(0)
    setRonda(ronda + 1)
  }

  return (
    <>
      <MigasDePan intermedia={{ texto: 'Jugar', a: '/jugar' }} actual={titulo} />
      <h2 className="titulo-pantalla">{titulo}</h2>
      <p className="puntaje" role="status">
        Aciertos: {aciertos} de {ACIERTOS_PARA_GANAR} · Fallos: {fallos}
      </p>

      {/* Al cambiar la clave empieza una ronda limpia con otro personaje. */}
      <RondaAdivinar
        key={ronda}
        campo={campo}
        opciones={opciones}
        Foto={Foto}
        vistos={vistos}
        textoSiguiente={gano ? 'Jugar de nuevo' : 'Siguiente personaje'}
        mensajeVictoria={
          gano ? `🎉 ¡Ganaste en ${aciertos + fallos} intentos!` : null
        }
        onResponder={registrarRespuesta}
        onSiguiente={gano ? reiniciar : () => setRonda(ronda + 1)}
      />
    </>
  )
}

export default JuegoAdivinar

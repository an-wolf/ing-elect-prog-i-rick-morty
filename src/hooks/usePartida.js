import { useEffect, useRef, useState } from 'react'
import { detenerMusica, iniciarMusica } from '../sonidos.js'

// Lógica común de los juegos por rondas: lleva el puntaje, recuerda los
// personajes que ya salieron y mantiene la música mientras la pantalla esté
// abierta. `ronda` se usa como `key` para empezar cada ronda desde cero.
function usePartida(aciertosParaGanar) {
  const [ronda, setRonda] = useState(1)
  const [aciertos, setAciertos] = useState(0)
  const [fallos, setFallos] = useState(0)

  // IDs que ya salieron en esta partida, para no repetir personajes.
  // Es un ref porque cambiarlo no necesita volver a dibujar la pantalla.
  const vistos = useRef(new Set())

  const gano = aciertos >= aciertosParaGanar

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

  return {
    ronda,
    aciertos,
    fallos,
    gano,
    vistos,
    registrarRespuesta,
    // Al ganar, el botón de continuar empieza una partida nueva.
    continuar: gano ? reiniciar : () => setRonda(ronda + 1),
    mensajeVictoria: gano
      ? `🎉 ¡Ganaste en ${aciertos + fallos} intentos!`
      : null,
  }
}

export default usePartida

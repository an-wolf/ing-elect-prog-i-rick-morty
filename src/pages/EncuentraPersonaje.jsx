import { useRef } from 'react'
import MigasDePan from '../components/comunes/MigasDePan.jsx'
import RondaEncuentra from '../components/juego/RondaEncuentra.jsx'
import usePartida from '../hooks/usePartida.js'

const ACIERTOS_PARA_GANAR = 3

function EncuentraPersonaje() {
  const partida = usePartida(ACIERTOS_PARA_GANAR)
  const elenco = useRef(null) // Los personajes de la partida

  function continuar() {
    if (partida.gano) elenco.current = null
    partida.continuar()
  }

  return (
    <>
      <MigasDePan
        intermedia={{ texto: 'Jugar', a: '/jugar' }}
        actual="Encuentra al personaje"
      />
      <h2 className="titulo-pantalla">Encuentra al personaje</h2>
      <p className="puntaje" role="status">
        Aciertos: {partida.aciertos} de {ACIERTOS_PARA_GANAR} · Fallos:{' '}
        {partida.fallos}
      </p>

      {/* Al cambiar la clave empieza una ronda limpia con otra cuadrícula. */}
      <RondaEncuentra
        key={partida.ronda}
        elenco={elenco}
        vistos={partida.vistos}
        textoSiguiente={partida.gano ? 'Jugar de nuevo' : 'Siguiente personaje'}
        mensajeVictoria={partida.mensajeVictoria}
        onResponder={partida.registrarRespuesta}
        onSiguiente={continuar}
      />
    </>
  )
}

export default EncuentraPersonaje

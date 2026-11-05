import usePartida from '../../hooks/usePartida.js'
import MigasDePan from '../comunes/MigasDePan.jsx'
import RondaAdivinar from './RondaAdivinar.jsx'

const ACIERTOS_PARA_GANAR = 6

// Pantalla común de las modalidades "Adivina...".
function JuegoAdivinar({ titulo, campo, opciones, Foto }) {
  const partida = usePartida(ACIERTOS_PARA_GANAR)

  return (
    <>
      <MigasDePan intermedia={{ texto: 'Jugar', a: '/jugar' }} actual={titulo} />
      <h2 className="titulo-pantalla">{titulo}</h2>
      <p className="puntaje" role="status">
        Aciertos: {partida.aciertos} de {ACIERTOS_PARA_GANAR} · Fallos:{' '}
        {partida.fallos}
      </p>

      {/* Al cambiar la clave empieza una ronda limpia con otro personaje. */}
      <RondaAdivinar
        key={partida.ronda}
        campo={campo}
        opciones={opciones}
        Foto={Foto}
        vistos={partida.vistos}
        textoSiguiente={partida.gano ? 'Jugar de nuevo' : 'Siguiente personaje'}
        mensajeVictoria={partida.mensajeVictoria}
        onResponder={partida.registrarRespuesta}
        onSiguiente={partida.continuar}
      />
    </>
  )
}

export default JuegoAdivinar

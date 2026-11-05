import { useCallback, useEffect, useState } from 'react'
import { obtenerPersonajesAlAzar } from '../../api.js'
import useConsulta from '../../hooks/useConsulta.js'
import { sonidoAcierto } from '../../sonidos.js'
import { barajar } from '../../utiles.js'
import MensajeError from '../comunes/MensajeError.jsx'
import CartaMemoria from './CartaMemoria.jsx'

const PAREJAS = 12 // Tablero de 6 × 4 cartas
const ESPERA_ERROR_MS = 1000

// Cada personaje aparece en dos cartas, repartidas al azar en el tablero.
function repartirCartas(personajes) {
  return barajar([...personajes, ...personajes])
}

// Descarga las fotos por adelantado para que aparezcan al instante al voltear.
function precargarFotos(personajes) {
  personajes.forEach((personaje) => {
    new Image().src = personaje.image
  })
}

function TableroMemoria({ onNuevaPartida }) {
  const consultar = useCallback(async (signal) => {
    // El Set vacío significa que no hay personajes excluidos: el sorteo ya
    // entrega personajes distintos, así que no se repiten en la partida.
    const personajes = await obtenerPersonajesAlAzar(PAREJAS, new Set(), signal)
    precargarFotos(personajes)
    return repartirCartas(personajes)
  }, [])
  const { datos: cartas, error, reintentar } = useConsulta(consultar)

  const [volteadas, setVolteadas] = useState([]) // Posiciones, máximo dos
  const [encontrados, setEncontrados] = useState([]) // IDs de personajes
  const [fallos, setFallos] = useState(0)

  const comparando = volteadas.length === 2
  const gano = encontrados.length === PAREJAS

  // Si las dos cartas no coinciden, se dejan ver un momento y se vuelven a tapar.
  useEffect(() => {
    if (!comparando) return

    const temporizador = setTimeout(() => setVolteadas([]), ESPERA_ERROR_MS)
    return () => clearTimeout(temporizador)
  }, [comparando])

  if (error) return <MensajeError onReintentar={reintentar} />

  function voltear(posicion) {
    if (volteadas.includes(posicion)) return

    if (volteadas.length === 0) {
      setVolteadas([posicion])
      return
    }

    const primera = cartas[volteadas[0]]
    const segunda = cartas[posicion]

    if (primera.id === segunda.id) {
      setEncontrados([...encontrados, primera.id])
      setVolteadas([])
      sonidoAcierto()
    } else {
      setVolteadas([volteadas[0], posicion])
      setFallos(fallos + 1)
    }
  }

  // Mientras carga se muestran cartas vacías para que el tablero no salte.
  const lista = cartas ?? Array(PAREJAS * 2).fill(null)

  return (
    <>
      <p className="puntaje" role="status">
        Parejas: {encontrados.length} de {PAREJAS} · Fallos: {fallos}
        {gano && ' · 🎉 ¡Ganaste!'}
      </p>

      <section className="memoria" aria-label="Tablero">
        <div className="tablero">
          {lista.map((personaje, posicion) => (
            <CartaMemoria
              key={posicion}
              personaje={personaje}
              volteada={volteadas.includes(posicion)}
              encontrada={personaje && encontrados.includes(personaje.id)}
              bloqueada={comparando}
              onVoltear={() => voltear(posicion)}
            />
          ))}
        </div>

        <button
          type="button"
          className="boton boton-principal"
          onClick={onNuevaPartida}
        >
          {gano ? 'Jugar de nuevo' : 'Nueva partida'}
        </button>
      </section>
    </>
  )
}

export default TableroMemoria

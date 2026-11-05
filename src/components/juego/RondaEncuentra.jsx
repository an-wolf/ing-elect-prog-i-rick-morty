import { useCallback, useEffect, useState } from 'react'
import { obtenerPersonajesAlAzar, precargarFotos } from '../../api.js'
import useConsulta from '../../hooks/useConsulta.js'
import { sonidoAcierto, sonidoFallo } from '../../sonidos.js'
import { barajar } from '../../utiles.js'
import MensajeError from '../comunes/MensajeError.jsx'
import PanelObjetivo from './PanelObjetivo.jsx'

const PERSONAJES = 120 // Cuadrícula de 12 × 10
const VISTAS = 2
const SEGUNDOS_VISTA = 3
const SEGUNDOS_BUSQUEDA = 30
const BARAJADAS = 3
const PASO_FOTO_MS = 8 // Separación entre la aparición de una foto y la siguiente

// `elenco` guarda los personajes de la partida para no consultarlos de nuevo en
// cada ronda. `vistos` guarda los que ya se buscaron.
function RondaEncuentra({
  elenco,
  vistos,
  textoSiguiente,
  mensajeVictoria,
  onResponder,
  onSiguiente,
}) {
  const [fotosListas, setFotosListas] = useState(0)

  const consultar = useCallback(
    async (signal) => {
      if (!elenco.current) {
        const personajes = await obtenerPersonajesAlAzar(
          PERSONAJES,
          new Set(),
          signal,
        )
        const fotos = personajes.map((personaje) => personaje.image)
        await precargarFotos(fotos, signal, setFotosListas)
        elenco.current = personajes
      }

      // El objetivo se sortea aparte de la mezcla: si saliera de la misma
      // lista, siempre estaría en la primera posición de la cuadrícula.
      let candidatos = elenco.current.filter(
        (personaje) => !vistos.current.has(personaje.id),
      )
      if (candidatos.length === 0) {
        vistos.current.clear()
        candidatos = elenco.current
      }
      const [objetivo] = barajar(candidatos)
      vistos.current.add(objetivo.id)
      return {
        personajes: barajar(elenco.current, BARAJADAS),
        objetivo,
        // Cada foto recibe un turno distinto para aparecer, repartido al azar.
        retrasos: barajar(elenco.current.map((_, turno) => turno * PASO_FOTO_MS)),
      }
    },
    [elenco, vistos],
  )
  const { datos, error, reintentar } = useConsulta(consultar)

  const [segundosVista, setSegundosVista] = useState(0)
  const [vistasUsadas, setVistasUsadas] = useState(0)
  const [restante, setRestante] = useState(SEGUNDOS_BUSQUEDA)
  const [elegido, setElegido] = useState(null)

  const objetivo = datos?.objetivo ?? null
  const sinTiempo = restante === 0
  const terminada = elegido !== null || sinTiempo

  // La búsqueda empieza cuando termina la primera vista de la foto.
  const enPrimeraVista = vistasUsadas === 0 || (vistasUsadas === 1 && segundosVista > 0)
  const buscando = !enPrimeraVista && !terminada

  function verFoto() {
    setVistasUsadas(vistasUsadas + 1)
    setSegundosVista(SEGUNDOS_VISTA)
  }

  // La primera vista es automática, en cuanto el tablero está listo.
  useEffect(() => {
    if (!datos) return
    setVistasUsadas(1)
    setSegundosVista(SEGUNDOS_VISTA)
  }, [datos])

  useEffect(() => {
    if (segundosVista === 0) return

    const temporizador = setTimeout(() => setSegundosVista(segundosVista - 1), 1000)
    return () => clearTimeout(temporizador)
  }, [segundosVista])

  useEffect(() => {
    if (!buscando) return

    const temporizador = setTimeout(() => setRestante(restante - 1), 1000)
    return () => clearTimeout(temporizador)
  }, [buscando, restante])

  // Quedarse sin tiempo cuenta como fallo.
  useEffect(() => {
    if (!sinTiempo) return
    onResponder(false)
    sonidoFallo()
    // Solo debe ocurrir una vez, cuando el tiempo llega a cero.
  }, [sinTiempo]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <MensajeError onReintentar={reintentar} />

  // Cada ronda admite un solo intento: si no, bastaría pulsar todas las fotos.
  function elegir(personaje) {
    const acerto = personaje.id === objetivo.id
    setElegido(personaje.id)
    onResponder(acerto)
    if (acerto) sonidoAcierto()
    else sonidoFallo()
  }

  function textoEstado() {
    if (!datos) return `Cargando fotos: ${fotosListas} de ${PERSONAJES}`
    if (elegido === objetivo.id) return mensajeVictoria ?? '✓ ¡Lo encontraste!'
    if (terminada) return sinTiempo ? '⏰ Se acabó el tiempo' : '✗ Ese no era'
    if (enPrimeraVista) return `Memoriza la foto: ${segundosVista} s`
    return `⏱ ${restante} s para encontrarlo`
  }

  function claseEstado() {
    if (elegido !== null && elegido === objetivo.id) return 'resultado-bien'
    return terminada ? 'resultado-mal' : 'objetivo-tiempo'
  }

  function claseCelda(personaje) {
    if (!terminada) return 'celda'
    if (personaje.id === objetivo.id) return 'celda celda-correcta'
    if (personaje.id === elegido) return 'celda celda-incorrecta'
    return 'celda celda-apagada'
  }

  const vistasRestantes = VISTAS - vistasUsadas
  const lista = datos?.personajes ?? Array(PERSONAJES).fill(null)

  return (
    <section className="encuentra" aria-label="Ronda actual">
      <PanelObjetivo
        personaje={objetivo}
        fotoVisible={Boolean(objetivo) && (segundosVista > 0 || terminada)}
        textoEstado={textoEstado()}
        claseEstado={claseEstado()}
        textoVer={
          vistasRestantes > 0 ? 'Ver foto otra vez (3 s)' : 'Ya no puedes verla'
        }
        puedeVer={buscando && vistasRestantes > 0}
        onVer={verFoto}
        textoSiguiente={textoSiguiente}
        puedeSeguir={terminada}
        onSiguiente={onSiguiente}
      />

      {/* Las celdas no llevan nombres: inspeccionar la página no revela nada.
          Durante la primera vista quedan vacías para no adelantar la búsqueda. */}
      <div className="cuadricula-personajes">
        {lista.map((personaje, posicion) => (
          <button
            key={personaje?.id ?? posicion}
            type="button"
            className={personaje ? claseCelda(personaje) : 'celda'}
            aria-label={`Personaje ${posicion + 1}`}
            disabled={!buscando}
            onClick={() => elegir(personaje)}
          >
            {personaje && !enPrimeraVista && (
              <img
                src={personaje.image}
                alt=""
                draggable={false}
                style={{ animationDelay: `${datos.retrasos[posicion]}ms` }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  )
}

export default RondaEncuentra

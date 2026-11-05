import { useEffect, useRef, useState } from 'react'
import { ESPERA_CONSULTA_MS, idDesdeUrl, obtenerEpisodios } from '../../api.js'
import MensajeError from '../comunes/MensajeError.jsx'
import DetallePersonaje from './DetallePersonaje.jsx'
import ListadoEpisodios from './ListadoEpisodios.jsx'
import TarjetaPersonaje from './TarjetaPersonaje.jsx'

const EPISODIOS_POR_TARJETA = 3

function textoTotal(total) {
  return `${total} ${total === 1 ? 'personaje encontrado' : 'personajes encontrados'}`
}

// Los episodios son un dato adicional: si fallan, la tarjeta muestra solo la
// cantidad y la lista de personajes sigue funcionando.
async function cargarEpisodios(personajes, signal) {
  const ids = personajes.flatMap((personaje) =>
    personaje.episode.slice(0, EPISODIOS_POR_TARJETA).map(idDesdeUrl),
  )
  try {
    return await obtenerEpisodios(ids, signal)
  } catch (problema) {
    if (problema.name === 'AbortError') throw problema
    return {}
  }
}

// Lista con scroll infinito. `cargarPagina(pagina, signal)` debe devolver
// { personajes, total, hayMas }. Para reiniciarla se le cambia la prop `key`.
function ListaPersonajes({ cargarPagina, mensajeVacio }) {
  const [personajes, setPersonajes] = useState([])
  const [episodios, setEpisodios] = useState({})
  const [pagina, setPagina] = useState(1)
  const [total, setTotal] = useState(0)
  const [hayMas, setHayMas] = useState(true)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const [intento, setIntento] = useState(0)
  const [seleccionado, setSeleccionado] = useState(null)
  const [conEpisodios, setConEpisodios] = useState(null)
  const marcador = useRef(null)

  useEffect(() => {
    const controlador = new AbortController()
    const { signal } = controlador
    setCargando(true)
    setError(false)

    async function cargar() {
      try {
        const resultado = await cargarPagina(pagina, signal)
        setPersonajes((actuales) => [...actuales, ...resultado.personajes])
        setTotal(resultado.total)
        setHayMas(resultado.hayMas)

        const nuevos = await cargarEpisodios(resultado.personajes, signal)
        setEpisodios((actuales) => ({ ...actuales, ...nuevos }))
        setCargando(false)
      } catch (problema) {
        if (problema.name === 'AbortError') return
        setError(true)
        setCargando(false)
      }
    }

    const temporizador = setTimeout(cargar, ESPERA_CONSULTA_MS)
    return () => {
      clearTimeout(temporizador)
      controlador.abort()
    }
  }, [cargarPagina, pagina, intento])

  // Cuando el marcador del final se acerca a la pantalla, se pide otra página.
  // Solo se observa si no hay una carga en curso, para no adelantarse a ella.
  useEffect(() => {
    if (cargando || error || !hayMas) return

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          observador.disconnect()
          setPagina((actual) => actual + 1)
        }
      },
      { rootMargin: '400px' },
    )
    observador.observe(marcador.current)
    return () => observador.disconnect()
  }, [cargando, error, hayMas])

  const sinResultados = !cargando && !error && personajes.length === 0

  return (
    <>
      {personajes.length > 0 && (
        <p className="resultados" role="status">
          {textoTotal(total)}
        </p>
      )}

      <div className="cuadricula">
        {personajes.map((personaje) => (
          <TarjetaPersonaje
            key={personaje.id}
            personaje={personaje}
            episodios={episodios}
            maxEpisodios={EPISODIOS_POR_TARJETA}
            onSeleccionar={setSeleccionado}
            onVerEpisodios={setConEpisodios}
          />
        ))}
      </div>

      {sinResultados && <p className="mensaje">{mensajeVacio}</p>}
      {cargando && <p className="mensaje">Cargando personajes...</p>}
      {error && <MensajeError onReintentar={() => setIntento(intento + 1)} />}
      <div ref={marcador} aria-hidden="true" />

      {seleccionado && (
        <DetallePersonaje
          personaje={seleccionado}
          onCerrar={() => setSeleccionado(null)}
        />
      )}
      {conEpisodios && (
        <ListadoEpisodios
          personaje={conEpisodios}
          onCerrar={() => setConEpisodios(null)}
        />
      )}
    </>
  )
}

export default ListaPersonajes

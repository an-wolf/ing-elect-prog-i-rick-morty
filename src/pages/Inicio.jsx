import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { obtenerPersonajes } from '../api.js'
import MigasDePan, { CLAVE_BUSQUEDA } from '../components/comunes/MigasDePan.jsx'
import Buscador from '../components/personajes/Buscador.jsx'
import Filtros from '../components/personajes/Filtros.jsx'
import ListaPersonajes from '../components/personajes/ListaPersonajes.jsx'

function Inicio() {
  // La búsqueda y los filtros viven en la URL: así se conservan al volver
  // desde una ubicación o un episodio.
  const [parametros, setParametros] = useSearchParams()
  const nombre = parametros.get('nombre') ?? ''
  const estado = parametros.get('estado') ?? ''
  const genero = parametros.get('genero') ?? ''

  const [texto, setTexto] = useState(nombre) // Lo que se escribe en el campo

  // Se guarda para que las migas de pan puedan regresar a esta misma búsqueda.
  useEffect(() => {
    sessionStorage.setItem(CLAVE_BUSQUEDA, parametros.toString())
  }, [parametros])

  const cargarPagina = useCallback(
    (pagina, signal) =>
      obtenerPersonajes({ nombre, estado, genero }, pagina, signal),
    [nombre, estado, genero],
  )

  function actualizarUrl(cambios) {
    const nuevos = { nombre, estado, genero, ...cambios }
    // Solo se dejan en la URL los valores que tienen contenido.
    const conValor = Object.entries(nuevos).filter(([, valor]) => valor)
    setParametros(Object.fromEntries(conValor), { replace: true })
  }

  function cambiarFiltro(evento) {
    const { name, value } = evento.target
    actualizarUrl({ [name]: value })
  }

  function limpiar() {
    setTexto('')
    setParametros({}, { replace: true })
  }

  return (
    <>
      <MigasDePan />

      <section className="controles" aria-label="Búsqueda y filtros">
        <Buscador
          valor={texto}
          onCambiar={setTexto}
          onBuscar={() => actualizarUrl({ nombre: texto.trim() })}
        />
        <Filtros
          filtros={{ estado, genero }}
          onCambiar={cambiarFiltro}
          onLimpiar={limpiar}
        />
      </section>

      {/* Al cambiar la clave, la lista vuelve a empezar desde la página 1. */}
      <ListaPersonajes
        key={`${nombre}|${estado}|${genero}`}
        cargarPagina={cargarPagina}
        mensajeVacio="No se encontraron personajes con esos criterios."
      />
    </>
  )
}

export default Inicio

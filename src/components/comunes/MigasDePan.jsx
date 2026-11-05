import { Link } from 'react-router-dom'

export const CLAVE_BUSQUEDA = 'busquedaInicio'

// Sin `actual` la miga "Personajes" es la pantalla actual. El enlace conserva
// la última búsqueda y los filtros que se usaron en esa pantalla.
// `intermedia` es un paso opcional entre ambas: { texto, a }.
function MigasDePan({ actual, intermedia }) {
  const busqueda = sessionStorage.getItem(CLAVE_BUSQUEDA)

  return (
    <nav className="migas" aria-label="Migas de pan">
      <ol>
        <li>
          {actual ? (
            <Link to={busqueda ? `/?${busqueda}` : '/'}>Personajes</Link>
          ) : (
            <span aria-current="page">Personajes</span>
          )}
        </li>
        {intermedia && (
          <li>
            <Link to={intermedia.a}>{intermedia.texto}</Link>
          </li>
        )}
        {actual && (
          <li>
            <span aria-current="page">{actual}</span>
          </li>
        )}
      </ol>
    </nav>
  )
}

export default MigasDePan

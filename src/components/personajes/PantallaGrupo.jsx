import { useCallback } from 'react'
import { obtenerPersonajesPorUrls } from '../../api.js'
import useConsulta from '../../hooks/useConsulta.js'
import MensajeError from '../comunes/MensajeError.jsx'
import MigasDePan from '../comunes/MigasDePan.jsx'
import ListaPersonajes from './ListaPersonajes.jsx'

// Pantalla común de ubicación y episodio: migas de pan, un encabezado con los
// datos y la lista de los personajes relacionados.
function PantallaGrupo({
  etiqueta,
  consultar,
  obtenerUrls,
  mensajeNoExiste,
  mensajeVacio,
  children,
}) {
  const { datos, cargando, error, reintentar } = useConsulta(consultar)
  const urls = datos ? obtenerUrls(datos) : null

  const cargarPagina = useCallback(
    (pagina, signal) => obtenerPersonajesPorUrls(urls, pagina, signal),
    [urls],
  )

  return (
    <>
      <MigasDePan actual={datos ? `${etiqueta}: ${datos.name}` : etiqueta} />

      {error && <MensajeError onReintentar={reintentar} />}
      {cargando && <p className="mensaje">Cargando...</p>}
      {!cargando && !error && !datos && (
        <p className="mensaje">{mensajeNoExiste}</p>
      )}

      {datos && (
        <>
          {children(datos)}
          <ListaPersonajes
            key={datos.url}
            cargarPagina={cargarPagina}
            mensajeVacio={mensajeVacio}
          />
        </>
      )}
    </>
  )
}

export default PantallaGrupo

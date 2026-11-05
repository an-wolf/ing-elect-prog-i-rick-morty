import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { idDesdeUrl, obtenerEpisodios } from '../../api.js'
import useConsulta from '../../hooks/useConsulta.js'
import MensajeError from '../comunes/MensajeError.jsx'
import Modal from '../comunes/Modal.jsx'

function ListadoEpisodios({ personaje, onCerrar }) {
  const consultar = useCallback(
    (signal) => obtenerEpisodios(personaje.episode.map(idDesdeUrl), signal),
    [personaje],
  )
  const { datos, cargando, error, reintentar } = useConsulta(consultar)

  const episodios = personaje.episode
    .map((url) => datos?.[idDesdeUrl(url)])
    .filter(Boolean)

  return (
    <Modal
      className="modal-episodios"
      tituloId="episodios-titulo"
      onCerrar={onCerrar}
    >
      <h2 id="episodios-titulo">Episodios de {personaje.name}</h2>

      {cargando && <p className="mensaje">Cargando episodios...</p>}
      {error && <MensajeError onReintentar={reintentar} />}

      {episodios.length > 0 && (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Nombre</th>
                <th scope="col">Emisión</th>
              </tr>
            </thead>
            <tbody>
              {episodios.map((episodio) => (
                <tr key={episodio.id}>
                  <td>{episodio.episode}</td>
                  <td>
                    <Link to={`/episodio/${episodio.id}`}>{episodio.name}</Link>
                  </td>
                  <td>{episodio.air_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button type="button" className="boton" onClick={onCerrar}>
        Cerrar
      </button>
    </Modal>
  )
}

export default ListadoEpisodios

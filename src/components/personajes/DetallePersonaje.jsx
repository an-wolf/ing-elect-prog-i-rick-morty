import { ESTADOS, GENEROS } from '../../traducciones.js'
import Modal from '../comunes/Modal.jsx'
import EnlaceUbicacion from './EnlaceUbicacion.jsx'

function DetallePersonaje({ personaje, onCerrar }) {
  return (
    <Modal className="detalle" tituloId="detalle-titulo" onCerrar={onCerrar}>
      <img src={personaje.image} alt={personaje.name} />
      <div className="detalle-contenido">
        <h2 id="detalle-titulo">{personaje.name}</h2>
        <dl>
          <dt>Estado</dt>
          <dd>{ESTADOS[personaje.status]}</dd>
          <dt>Especie</dt>
          <dd>{personaje.species}</dd>
          {personaje.type && (
            <>
              <dt>Tipo</dt>
              <dd>{personaje.type}</dd>
            </>
          )}
          <dt>Género</dt>
          <dd>{GENEROS[personaje.gender]}</dd>
          <dt>Origen</dt>
          <dd>
            <EnlaceUbicacion lugar={personaje.origin} />
          </dd>
          <dt>Ubicación</dt>
          <dd>
            <EnlaceUbicacion lugar={personaje.location} />
          </dd>
          <dt>Episodios</dt>
          <dd>{personaje.episode.length}</dd>
        </dl>
        <button type="button" className="boton" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    </Modal>
  )
}

export default DetallePersonaje

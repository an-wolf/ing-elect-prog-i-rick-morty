import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { obtenerUbicacion } from '../api.js'
import PantallaGrupo from '../components/personajes/PantallaGrupo.jsx'

function Ubicacion() {
  const { id } = useParams()
  const consultar = useCallback((signal) => obtenerUbicacion(id, signal), [id])

  return (
    <PantallaGrupo
      etiqueta="Ubicación"
      consultar={consultar}
      obtenerUrls={(ubicacion) => ubicacion.residents}
      mensajeNoExiste="Esta ubicación no existe."
      mensajeVacio="Esta ubicación no tiene residentes conocidos."
    >
      {(ubicacion) => (
        <section className="ficha">
          <p className="ficha-tipo">Ubicación</p>
          <h2>{ubicacion.name}</h2>
          <p>
            {ubicacion.type || 'Tipo desconocido'} ·{' '}
            {ubicacion.dimension || 'Dimensión desconocida'}
          </p>
          <h3>Residentes</h3>
        </section>
      )}
    </PantallaGrupo>
  )
}

export default Ubicacion

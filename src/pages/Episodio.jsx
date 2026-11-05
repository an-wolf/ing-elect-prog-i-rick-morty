import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { obtenerEpisodio } from '../api.js'
import PantallaGrupo from '../components/personajes/PantallaGrupo.jsx'

function Episodio() {
  const { id } = useParams()
  const consultar = useCallback((signal) => obtenerEpisodio(id, signal), [id])

  return (
    <PantallaGrupo
      etiqueta="Episodio"
      consultar={consultar}
      obtenerUrls={(episodio) => episodio.characters}
      mensajeNoExiste="Este episodio no existe."
      mensajeVacio="Este episodio no tiene personajes registrados."
    >
      {(episodio) => (
        <section className="ficha">
          <p className="ficha-tipo">Episodio {episodio.episode}</p>
          <h2>{episodio.name}</h2>
          <p>Emitido: {episodio.air_date}</p>
          <h3>Personajes del episodio</h3>
        </section>
      )}
    </PantallaGrupo>
  )
}

export default Episodio

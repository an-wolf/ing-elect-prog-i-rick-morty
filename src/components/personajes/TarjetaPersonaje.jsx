import { Link } from 'react-router-dom'
import { idDesdeUrl } from '../../api.js'
import { ESTADOS } from '../../traducciones.js'
import EnlaceUbicacion from './EnlaceUbicacion.jsx'

function TarjetaPersonaje({
  personaje,
  episodios,
  maxEpisodios,
  onSeleccionar,
  onVerEpisodios,
}) {
  const totalEpisodios = personaje.episode.length
  const restantes = totalEpisodios - maxEpisodios
  const primeros = personaje.episode
    .slice(0, maxEpisodios)
    .map((url) => episodios[idDesdeUrl(url)])
    .filter(Boolean)

  return (
    <article className="tarjeta">
      <button
        type="button"
        className="tarjeta-abrir"
        onClick={() => onSeleccionar(personaje)}
      >
        <img src={personaje.image} alt="" loading="lazy" />
        <strong>{personaje.name}</strong>
      </button>

      <div className="tarjeta-info">
        <span className={`estado estado-${personaje.status.toLowerCase()}`}>
          {ESTADOS[personaje.status]} · {personaje.species}
        </span>
        <span className="tarjeta-lugar">
          <EnlaceUbicacion lugar={personaje.location} />
        </span>

        {primeros.length > 0 ? (
          <ul className="tarjeta-episodios">
            {primeros.map((episodio) => (
              <li key={episodio.id}>
                <Link to={`/episodio/${episodio.id}`}>
                  {episodio.episode} · {episodio.name}
                </Link>
              </li>
            ))}
            {restantes > 0 && (
              <li>
                <button
                  type="button"
                  className="mas"
                  onClick={() => onVerEpisodios(personaje)}
                >
                  ({restantes} más)
                </button>
              </li>
            )}
          </ul>
        ) : (
          <span className="tarjeta-lugar">
            {totalEpisodios} {totalEpisodios === 1 ? 'episodio' : 'episodios'}
          </span>
        )}
      </div>
    </article>
  )
}

export default TarjetaPersonaje

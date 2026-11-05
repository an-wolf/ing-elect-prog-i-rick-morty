import { Link } from 'react-router-dom'
import { idDesdeUrl } from '../../api.js'

// Cuando la ubicación es desconocida la API no entrega URL: se muestra texto.
function EnlaceUbicacion({ lugar }) {
  if (!lugar.url) return lugar.name
  return <Link to={`/ubicacion/${idDesdeUrl(lugar.url)}`}>{lugar.name}</Link>
}

export default EnlaceUbicacion

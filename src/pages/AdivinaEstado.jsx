import JuegoAdivinar from '../components/juego/JuegoAdivinar.jsx'
import { ESTADOS } from '../traducciones.js'

function AdivinaEstado() {
  return (
    <JuegoAdivinar
      titulo="Adivina el estado"
      campo="status"
      opciones={ESTADOS}
    />
  )
}

export default AdivinaEstado

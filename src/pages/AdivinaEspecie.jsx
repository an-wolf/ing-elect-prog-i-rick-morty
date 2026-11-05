import FotoTemporal from '../components/juego/FotoTemporal.jsx'
import JuegoAdivinar from '../components/juego/JuegoAdivinar.jsx'
import { ESPECIES } from '../traducciones.js'

function AdivinaEspecie() {
  return (
    <JuegoAdivinar
      titulo="Adivina la especie"
      campo="species"
      opciones={ESPECIES}
      Foto={FotoTemporal}
    />
  )
}

export default AdivinaEspecie

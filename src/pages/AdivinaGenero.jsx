import FotoLinterna from '../components/juego/FotoLinterna.jsx'
import JuegoAdivinar from '../components/juego/JuegoAdivinar.jsx'
import { GENEROS } from '../traducciones.js'

function AdivinaGenero() {
  return (
    <JuegoAdivinar
      titulo="Adivina el género"
      campo="gender"
      opciones={GENEROS}
      Foto={FotoLinterna}
    />
  )
}

export default AdivinaGenero

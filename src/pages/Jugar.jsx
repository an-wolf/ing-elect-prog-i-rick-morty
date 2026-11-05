import { Link } from 'react-router-dom'
import MigasDePan from '../components/comunes/MigasDePan.jsx'
import AnimacionModalidad from '../components/juego/AnimacionModalidad.jsx'

// Para sumar una modalidad: agregarla aquí, crear su ruta en App.jsx y su
// animación en AnimacionModalidad.jsx.
const MODALIDADES = [
  {
    ruta: '/jugar/adivina-estado',
    animacion: 'estado',
    nombre: 'Adivina el estado',
    descripcion: '¿El personaje de la foto está vivo, muerto o se desconoce?',
  },
  {
    ruta: '/jugar/adivina-genero',
    animacion: 'genero',
    nombre: 'Adivina el género',
    descripcion: 'La foto está a oscuras: explórala con un círculo de luz.',
  },
  {
    ruta: '/jugar/adivina-especie',
    animacion: 'especie',
    nombre: 'Adivina la especie',
    descripcion: 'Memoriza la foto antes de que se desenfoque.',
  },
  {
    ruta: '/jugar/memoriza',
    animacion: 'memoriza',
    nombre: 'Memoriza',
    descripcion: 'Voltea las cartas y encuentra todas las parejas.',
  },
  {
    ruta: '/jugar/encuentra',
    animacion: 'encuentra',
    nombre: 'Encuentra al personaje',
    descripcion: 'Búscalo entre 120 fotos: tienes 30 segundos.',
  },
]

function Jugar() {
  return (
    <>
      <MigasDePan actual="Jugar" />
      <h2 className="titulo-pantalla">Elige una modalidad</h2>
      <ul className="modalidades">
        {MODALIDADES.map((modalidad) => (
          <li key={modalidad.ruta}>
            <Link to={modalidad.ruta} className="modalidad">
              <AnimacionModalidad tipo={modalidad.animacion} />
              <strong>{modalidad.nombre}</strong>
              <span>{modalidad.descripcion}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

export default Jugar

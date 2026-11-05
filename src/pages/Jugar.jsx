import { Link } from 'react-router-dom'
import MigasDePan from '../components/comunes/MigasDePan.jsx'

// Para sumar una modalidad: agregarla aquí y crear su ruta en App.jsx.
const MODALIDADES = [
  {
    ruta: '/jugar/adivina-estado',
    nombre: 'Adivina el estado',
    descripcion: '¿El personaje de la foto está vivo, muerto o se desconoce?',
  },
  {
    ruta: '/jugar/adivina-genero',
    nombre: 'Adivina el género',
    descripcion: 'La foto está a oscuras: explórala con un círculo de luz.',
  },
  {
    ruta: '/jugar/adivina-especie',
    nombre: 'Adivina la especie',
    descripcion: 'Memoriza la foto antes de que se desenfoque.',
  },
  {
    ruta: '/jugar/memoriza',
    nombre: 'Memoriza',
    descripcion: 'Voltea las cartas y encuentra todas las parejas.',
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

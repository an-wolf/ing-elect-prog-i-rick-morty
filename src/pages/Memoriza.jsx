import { useEffect, useState } from 'react'
import MigasDePan from '../components/comunes/MigasDePan.jsx'
import TableroMemoria from '../components/juego/TableroMemoria.jsx'
import { detenerMusica, iniciarMusica } from '../sonidos.js'

function Memoriza() {
  const [partida, setPartida] = useState(1)

  // La música suena mientras esta pantalla está abierta.
  useEffect(() => {
    iniciarMusica()
    return detenerMusica
  }, [])

  return (
    <>
      <MigasDePan
        intermedia={{ texto: 'Jugar', a: '/jugar' }}
        actual="Memoriza"
      />
      <h2 className="titulo-pantalla">Memoriza</h2>

      {/* Al cambiar la clave se reparte un tablero nuevo. */}
      <TableroMemoria
        key={partida}
        onNuevaPartida={() => setPartida(partida + 1)}
      />
    </>
  )
}

export default Memoriza

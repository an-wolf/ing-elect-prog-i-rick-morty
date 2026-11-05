import { useEffect } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AlertaLimite from './components/comunes/AlertaLimite.jsx'
import BotonArriba from './components/comunes/BotonArriba.jsx'
import AdivinaEspecie from './pages/AdivinaEspecie.jsx'
import AdivinaEstado from './pages/AdivinaEstado.jsx'
import AdivinaGenero from './pages/AdivinaGenero.jsx'
import EncuentraPersonaje from './pages/EncuentraPersonaje.jsx'
import Episodio from './pages/Episodio.jsx'
import Inicio from './pages/Inicio.jsx'
import Jugar from './pages/Jugar.jsx'
import Memoriza from './pages/Memoriza.jsx'
import Ubicacion from './pages/Ubicacion.jsx'

function App() {
  const { pathname } = useLocation()
  const estaJugando = pathname.startsWith('/jugar')

  // Cada pantalla nueva empieza desde arriba.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <header className="encabezado">
        <h1>
          <Link to="/">Rick y Morty</Link>
        </h1>
        <p>Explorador de personajes del multiverso</p>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/ubicacion/:id" element={<Ubicacion />} />
          <Route path="/episodio/:id" element={<Episodio />} />
          <Route path="/jugar" element={<Jugar />} />
          <Route path="/jugar/adivina-estado" element={<AdivinaEstado />} />
          <Route path="/jugar/adivina-genero" element={<AdivinaGenero />} />
          <Route path="/jugar/adivina-especie" element={<AdivinaEspecie />} />
          <Route path="/jugar/memoriza" element={<Memoriza />} />
          <Route path="/jugar/encuentra" element={<EncuentraPersonaje />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <AlertaLimite />

      <div className="flotantes">
        <BotonArriba />
        {!estaJugando && (
          <Link to="/jugar" className="boton boton-principal">
            🎮 Jugar
          </Link>
        )}
      </div>
    </>
  )
}

export default App

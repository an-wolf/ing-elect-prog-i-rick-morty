import { useEffect, useState } from 'react'

const DESPLAZAMIENTO_MINIMO = 400

function BotonArriba() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function manejarScroll() {
      setVisible(window.scrollY > DESPLAZAMIENTO_MINIMO)
    }

    window.addEventListener('scroll', manejarScroll, { passive: true })
    return () => window.removeEventListener('scroll', manejarScroll)
  }, [])

  function volverArriba() {
    const sinAnimacion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: sinAnimacion ? 'auto' : 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      type="button"
      className="boton boton-principal"
      aria-label="Volver arriba"
      onClick={volverArriba}
    >
      ↑ Arriba
    </button>
  )
}

export default BotonArriba

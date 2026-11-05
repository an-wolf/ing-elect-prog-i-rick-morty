import { useEffect, useRef } from 'react'

// Ventana emergente. El elemento <dialog> ya resuelve el cierre con Escape.
function Modal({ className, tituloId, onCerrar, children }) {
  const dialogo = useRef(null)

  useEffect(() => {
    dialogo.current.showModal()
  }, [])

  // Un clic sobre el fondo oscuro o en un enlace también cierra la ventana.
  function manejarClic(evento) {
    if (evento.target === dialogo.current || evento.target.closest('a')) {
      onCerrar()
    }
  }

  return (
    <dialog
      ref={dialogo}
      className={`modal ${className}`}
      aria-labelledby={tituloId}
      onClose={onCerrar}
      onClick={manejarClic}
    >
      {children}
    </dialog>
  )
}

export default Modal

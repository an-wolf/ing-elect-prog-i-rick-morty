function MensajeError({ onReintentar }) {
  return (
    <div className="mensaje" role="alert">
      <p>
        No se pudo cargar la información. Espera unos segundos e inténtalo de
        nuevo.
      </p>
      <button type="button" className="boton" onClick={onReintentar}>
        Reintentar
      </button>
    </div>
  )
}

export default MensajeError

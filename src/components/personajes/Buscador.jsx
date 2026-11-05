function Buscador({ valor, onCambiar, onBuscar }) {
  function manejarEnvio(evento) {
    evento.preventDefault()
    onBuscar()
  }

  return (
    <form className="buscador" role="search" onSubmit={manejarEnvio}>
      <input
        type="search"
        placeholder="Buscar personaje por nombre..."
        aria-label="Buscar personaje por nombre"
        value={valor}
        onChange={(evento) => onCambiar(evento.target.value)}
      />
      <button type="submit" className="boton boton-principal">
        Buscar
      </button>
    </form>
  )
}

export default Buscador

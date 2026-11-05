// `personaje` es null mientras el tablero carga. La imagen solo existe en la
// página cuando la carta está volteada, para no revelar el tablero.
function CartaMemoria({ personaje, volteada, encontrada, bloqueada, onVoltear }) {
  const visible = volteada || encontrada

  let clase = 'carta'
  if (visible) clase += ' carta-visible'
  if (encontrada) clase += ' carta-encontrada'

  return (
    <button
      type="button"
      className={clase}
      aria-label={visible ? personaje.name : 'Carta oculta'}
      disabled={!personaje || bloqueada || encontrada}
      onClick={onVoltear}
    >
      {visible ? (
        <img src={personaje.image} alt="" draggable={false} />
      ) : (
        <span aria-hidden="true">?</span>
      )}
    </button>
  )
}

export default CartaMemoria

import { useState } from 'react'

// `personaje` es null mientras el tablero carga. La imagen solo existe en la
// página cuando la carta está volteada, para no revelar el tablero.
function CartaMemoria({ personaje, volteada, encontrada, bloqueada, onVoltear }) {
  const visible = Boolean(volteada || encontrada)

  // Al taparse, la carta gira en dos partes: `saliendo` esconde la imagen y
  // `entrando` muestra el reverso.
  const [fase, setFase] = useState(null)
  const [estabaVisible, setEstabaVisible] = useState(visible)

  // Se ajusta durante el render para que la imagen no alcance a desaparecer.
  if (visible !== estabaVisible) {
    setEstabaVisible(visible)
    setFase(visible ? null : 'saliendo')
  }

  function terminarAnimacion() {
    setFase(fase === 'saliendo' ? 'entrando' : null)
  }

  let clase = 'carta'
  if (visible) clase += ' carta-visible'
  if (encontrada) clase += ' carta-encontrada'
  if (fase) clase += ` carta-${fase}`

  return (
    <button
      type="button"
      className={clase}
      aria-label={visible ? personaje.name : 'Carta oculta'}
      disabled={!personaje || bloqueada || encontrada}
      onClick={onVoltear}
      onAnimationEnd={terminarAnimacion}
    >
      {visible || fase === 'saliendo' ? (
        <img src={personaje.image} alt="" draggable={false} />
      ) : (
        <span aria-hidden="true">?</span>
      )}
    </button>
  )
}

export default CartaMemoria

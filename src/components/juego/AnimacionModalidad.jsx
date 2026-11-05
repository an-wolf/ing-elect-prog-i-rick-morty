// Mini animaciones que explican cada juego en el menú. Son solo DOM y CSS: los
// movimientos están en index.css, en las clases que empiezan con `demo`.
function Figura() {
  return (
    <span className="demo-figura">
      <i />
      <b />
    </span>
  )
}

function DemoEstado() {
  return (
    <>
      <span className="demo-foto">
        <Figura />
      </span>
      <span className="demo-opciones">
        <span className="demo-opcion demo-opcion-elegida">Vivo</span>
        <span className="demo-opcion">Muerto</span>
        <span className="demo-opcion">Desconocido</span>
      </span>
    </>
  )
}

function DemoGenero() {
  return (
    <>
      <Figura />
      <span className="demo-linterna" />
    </>
  )
}

function DemoEspecie() {
  return (
    <>
      <span className="demo-escena">
        <Figura />
      </span>
      <span className="demo-tiempo" />
      <span className="demo-candado">🔒</span>
    </>
  )
}

function DemoMemoriza() {
  return (
    <>
      {[1, 2].map((numero) => (
        <span key={numero} className={`demo-carta demo-carta-${numero}`}>
          <span className="demo-cara">?</span>
          <span className="demo-cara demo-cara-foto">
            <Figura />
          </span>
        </span>
      ))}
      <span className="demo-check">✓</span>
    </>
  )
}

function DemoEncuentra() {
  return (
    <span className="demo-rejilla">
      {Array.from({ length: 21 }, (_, indice) => (
        <span
          key={indice}
          className={indice === 11 ? 'demo-celda demo-celda-meta' : 'demo-celda'}
        />
      ))}
      <span className="demo-lupa">🔍</span>
    </span>
  )
}

const DEMOS = {
  estado: DemoEstado,
  genero: DemoGenero,
  especie: DemoEspecie,
  memoriza: DemoMemoriza,
  encuentra: DemoEncuentra,
}

function AnimacionModalidad({ tipo }) {
  const Demo = DEMOS[tipo]

  // Es decorativa: la descripción de la modalidad ya explica lo mismo en texto.
  return (
    <span className={`demo demo-${tipo}`} aria-hidden="true">
      <Demo />
    </span>
  )
}

export default AnimacionModalidad

import { useCallback, useEffect, useRef, useState } from 'react'
import { obtenerPersonajesAlAzar } from '../../api.js'
import useConsulta from '../../hooks/useConsulta.js'
import { sonidoAcierto, sonidoFallo } from '../../sonidos.js'
import { ESPECIES, ESTADOS, GENEROS } from '../../traducciones.js'
import MensajeError from '../comunes/MensajeError.jsx'

// Foto sin efectos. El texto alternativo es genérico para no revelar el nombre.
function FotoSimple({ src }) {
  return <img src={src} alt="Personaje por adivinar" />
}

function claseSegunOpciones(cantidad) {
  if (cantidad > 4) return 'juego juego-muchas'
  return cantidad === 4 ? 'juego juego-cuatro' : 'juego'
}

// Una ronda: `campo` es el dato del personaje que se adivina, `opciones` un
// objeto { valorDeLaApi: textoEnPantalla } y `Foto` el componente que muestra
// la imagen; recibe `src` y `revelada` (si ya se respondió).
function RondaAdivinar({
  campo,
  opciones,
  Foto = FotoSimple,
  vistos,
  textoSiguiente,
  mensajeVictoria,
  onResponder,
  onSiguiente,
}) {
  const consultar = useCallback(
    async (signal) => {
      const [personaje] = await obtenerPersonajesAlAzar(
        1,
        vistos.current,
        signal,
      )
      vistos.current.add(personaje.id)
      return personaje
    },
    [vistos],
  )
  const { datos: personaje, error, reintentar } = useConsulta(consultar)
  const [elegido, setElegido] = useState(null)
  const botonSiguiente = useRef(null)

  const respondio = elegido !== null

  // Al responder, el foco pasa al botón para poder continuar con Enter, sin
  // que el navegador desplace la página para mostrarlo.
  useEffect(() => {
    if (respondio) botonSiguiente.current.focus({ preventScroll: true })
  }, [respondio])

  if (error) return <MensajeError onReintentar={reintentar} />

  const correcta = personaje?.[campo]
  const acerto = elegido === correcta

  function elegir(opcion) {
    const esCorrecta = opcion === correcta
    setElegido(opcion)
    onResponder(esCorrecta)
    if (esCorrecta) sonidoAcierto()
    else sonidoFallo()
  }

  function claseOpcion(opcion) {
    if (!respondio) return 'boton opcion'
    if (opcion === correcta) return 'boton opcion opcion-correcta'
    return opcion === elegido ? 'boton opcion opcion-incorrecta' : 'boton opcion'
  }

  function textoResultado() {
    if (!acerto) return '✗ Incorrecto'
    return mensajeVictoria ?? '✓ ¡Correcto!'
  }

  // Todos los espacios existen desde el inicio: así, al cargar o responder,
  // la pantalla no cambia de tamaño.
  return (
    <section
      className={claseSegunOpciones(Object.keys(opciones).length)}
      aria-label="Ronda actual"
    >
      <div className="juego-foto">
        {personaje && <Foto src={personaje.image} revelada={respondio} />}
      </div>

      <div className="tarjeta juego-datos" role="status">
        {/* Los datos solo existen en la página después de responder. */}
        {respondio ? (
          <div className="tarjeta-info">
            <p className={acerto ? 'resultado-bien' : 'resultado-mal'}>
              {textoResultado()}
            </p>
            <strong>{personaje.name}</strong>
            <span className={`estado estado-${personaje.status.toLowerCase()}`}>
              {ESTADOS[personaje.status]} · {ESPECIES[personaje.species]}
            </span>
            <span className="tarjeta-lugar">
              Género: {GENEROS[personaje.gender]}
            </span>
            <span className="tarjeta-lugar">{personaje.location.name}</span>
          </div>
        ) : (
          <div className="tarjeta-info">
            <strong>???</strong>
            <span className="tarjeta-lugar">
              {personaje
                ? 'Elige una opción para ver sus datos.'
                : 'Buscando un personaje...'}
            </span>
          </div>
        )}
      </div>

      <div className="opciones">
        {Object.entries(opciones).map(([valor, texto]) => (
          <button
            key={valor}
            type="button"
            className={claseOpcion(valor)}
            disabled={respondio || !personaje}
            onClick={() => elegir(valor)}
          >
            {texto}
          </button>
        ))}
      </div>

      <button
        ref={botonSiguiente}
        type="button"
        className="boton boton-principal juego-siguiente"
        disabled={!respondio}
        onClick={onSiguiente}
      >
        {textoSiguiente}
      </button>
    </section>
  )
}

export default RondaAdivinar

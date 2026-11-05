import { ESPECIES, ESTADOS, GENEROS } from '../../traducciones.js'

// Datos del personaje que se busca. La foto solo existe en la página mientras
// `fotoVisible` es verdadero.
function PanelObjetivo({
  personaje,
  fotoVisible,
  textoEstado,
  claseEstado,
  textoVer,
  puedeVer,
  onVer,
  textoSiguiente,
  puedeSeguir,
  onSiguiente,
}) {
  return (
    <aside className="tarjeta objetivo">
      <div className="objetivo-foto">
        {fotoVisible ? (
          <img src={personaje.image} alt={`Foto de ${personaje.name}`} />
        ) : (
          <span aria-hidden="true">?</span>
        )}
      </div>

      <div className="tarjeta-info objetivo-datos">
        <p className={claseEstado} role="timer">
          {textoEstado}
        </p>
        {personaje ? (
          <>
            <strong>{personaje.name}</strong>
            <span className={`estado estado-${personaje.status.toLowerCase()}`}>
              {ESTADOS[personaje.status]} · {ESPECIES[personaje.species]}
            </span>
            <span className="tarjeta-lugar">
              Género: {GENEROS[personaje.gender]}
            </span>
            <span className="tarjeta-lugar">{personaje.location.name}</span>
          </>
        ) : (
          <strong>???</strong>
        )}
      </div>

      <div className="objetivo-acciones">
        <button
          type="button"
          className="boton"
          disabled={!puedeVer}
          onClick={onVer}
        >
          {textoVer}
        </button>
        <button
          type="button"
          className="boton boton-principal"
          disabled={!puedeSeguir}
          onClick={onSiguiente}
        >
          {textoSiguiente}
        </button>
      </div>
    </aside>
  )
}

export default PanelObjetivo

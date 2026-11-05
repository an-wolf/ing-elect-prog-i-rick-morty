import { ESTADOS, GENEROS } from '../../traducciones.js'

function Selector({ etiqueta, nombre, valor, opciones, onCambiar }) {
  return (
    <label className="filtro">
      {etiqueta}
      <select name={nombre} value={valor} onChange={onCambiar}>
        <option value="">Todos</option>
        {Object.entries(opciones).map(([clave, texto]) => (
          <option key={clave} value={clave}>
            {texto}
          </option>
        ))}
      </select>
    </label>
  )
}

function Filtros({ filtros, onCambiar, onLimpiar }) {
  return (
    <div className="filtros">
      <Selector
        etiqueta="Estado"
        nombre="estado"
        valor={filtros.estado}
        opciones={ESTADOS}
        onCambiar={onCambiar}
      />
      <Selector
        etiqueta="Género"
        nombre="genero"
        valor={filtros.genero}
        opciones={GENEROS}
        onCambiar={onCambiar}
      />
      <button type="button" className="boton" onClick={onLimpiar}>
        Limpiar
      </button>
    </div>
  )
}

export default Filtros

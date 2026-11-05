import { useEffect, useState } from 'react'
import { ESPERA_CONSULTA_MS } from '../api.js'

// Ejecuta una consulta y expone su resultado. `consultar` debe estar envuelta
// en useCallback: la consulta se repite cuando esa función cambia.
function useConsulta(consultar) {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const controlador = new AbortController()
    setDatos(null)
    setCargando(true)
    setError(false)

    const temporizador = setTimeout(() => {
      consultar(controlador.signal)
        .then((respuesta) => {
          setDatos(respuesta)
          setCargando(false)
        })
        .catch((problema) => {
          if (problema.name === 'AbortError') return
          setError(true)
          setCargando(false)
        })
    }, ESPERA_CONSULTA_MS)

    return () => {
      clearTimeout(temporizador)
      controlador.abort()
    }
  }, [consultar, intento])

  return { datos, cargando, error, reintentar: () => setIntento(intento + 1) }
}

export default useConsulta

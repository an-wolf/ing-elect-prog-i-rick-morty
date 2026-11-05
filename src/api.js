import { barajar } from './utiles.js'

const URL_API = 'https://rickandmortyapi.com/api'
const INTENTOS = 4
const ESPERA_MS = 2000
const PERSONAJES_POR_PAGINA = 20

// Pausa antes de consultar: evita peticiones de más en cambios muy rápidos.
export const ESPERA_CONSULTA_MS = 300

// Guarda las respuestas para no repetir consultas: la API limita las
// peticiones y responde 429 durante unos 10 segundos si se hacen muchas.
const cache = new Map()
const episodiosConocidos = new Map()

function esperar(milisegundos) {
  return new Promise((resolver) => setTimeout(resolver, milisegundos))
}

// El error 429 llega sin cabeceras CORS, así que el navegador lo reporta como
// un fallo de red. Por eso también se reintenta cuando fetch lanza un error.
// Cada espera duplica la anterior (2, 4 y 8 segundos) para superar el bloqueo.
async function pedirConReintentos(url, signal) {
  for (let intento = 1; intento < INTENTOS; intento++) {
    try {
      const respuesta = await fetch(url, { signal })
      if (respuesta.status !== 429) return respuesta
    } catch (problema) {
      if (problema.name === 'AbortError') throw problema
    }
    await esperar(ESPERA_MS * 2 ** (intento - 1))
  }
  return fetch(url, { signal })
}

// Devuelve el JSON de la URL, o null si la API responde 404 (no hay datos).
async function pedirJson(url, signal) {
  if (cache.has(url)) return cache.get(url)

  const respuesta = await pedirConReintentos(url, signal)
  if (respuesta.status !== 404 && !respuesta.ok) {
    throw new Error(`Error ${respuesta.status} al consultar la API`)
  }

  const datos = respuesta.status === 404 ? null : await respuesta.json()
  cache.set(url, datos)
  return datos
}

// Al pedir varios IDs la API entrega una lista, pero con uno solo entrega el
// objeto directamente; concat deja ambos casos como lista.
async function pedirPorIds(recurso, ids, signal) {
  if (ids.length === 0) return []
  const datos = await pedirJson(`${URL_API}/${recurso}/${ids.join(',')}`, signal)
  return datos ? [].concat(datos) : []
}

// Las relaciones llegan como URL: ".../api/episode/28" -> "28".
export function idDesdeUrl(url) {
  return url.split('/').pop()
}

// Consulta una página de personajes con la búsqueda y los filtros aplicados.
export async function obtenerPersonajes({ nombre, estado, genero }, pagina, signal) {
  const parametros = new URLSearchParams({ page: pagina })
  if (nombre) parametros.set('name', nombre)
  if (estado) parametros.set('status', estado)
  if (genero) parametros.set('gender', genero)

  const datos = await pedirJson(`${URL_API}/character?${parametros}`, signal)
  return {
    personajes: datos?.results ?? [],
    total: datos?.info.count ?? 0,
    hayMas: Boolean(datos?.info.next),
  }
}

// Consulta por partes una lista de URL de personajes (residentes o reparto).
export async function obtenerPersonajesPorUrls(urls, pagina, signal) {
  const fin = pagina * PERSONAJES_POR_PAGINA
  const ids = urls.slice(fin - PERSONAJES_POR_PAGINA, fin).map(idDesdeUrl)
  return {
    personajes: await pedirPorIds('character', ids, signal),
    total: urls.length,
    hayMas: fin < urls.length,
  }
}

// Trae los episodios indicados en una sola petición, pidiendo solo los que
// aún no se conocen. Devuelve un objeto { id: episodio }.
export async function obtenerEpisodios(ids, signal) {
  const unicos = [...new Set(ids)]
  const faltantes = unicos.filter((id) => !episodiosConocidos.has(id))

  const nuevos = await pedirPorIds('episode', faltantes, signal)
  nuevos.forEach((episodio) => {
    episodiosConocidos.set(String(episodio.id), episodio)
  })

  return Object.fromEntries(
    unicos
      .filter((id) => episodiosConocidos.has(id))
      .map((id) => [id, episodiosConocidos.get(id)]),
  )
}

// Sortea `cantidad` personajes distintos entre los que informa la API, sin usar
// los que están en `excluidos` (un Set). Si no quedan suficientes, la lista
// vuelve a empezar.
export async function obtenerPersonajesAlAzar(cantidad, excluidos, signal) {
  const { total } = await obtenerPersonajes({}, 1, signal)

  const disponibles = []
  for (let id = 1; id <= total; id++) {
    if (!excluidos.has(id)) disponibles.push(id)
  }
  if (disponibles.length < cantidad) {
    excluidos.clear()
    return obtenerPersonajesAlAzar(cantidad, excluidos, signal)
  }

  const ids = barajar(disponibles).slice(0, cantidad)
  const personajes = await pedirPorIds('character', ids, signal)
  if (personajes.length < cantidad) {
    throw new Error('La API no entregó todos los personajes')
  }
  return personajes
}

export function obtenerUbicacion(id, signal) {
  return pedirJson(`${URL_API}/location/${id}`, signal)
}

export function obtenerEpisodio(id, signal) {
  return pedirJson(`${URL_API}/episode/${id}`, signal)
}

import avatares from './avatares.json'
import { iniciarEspera, terminarEspera } from './esperaApi.js'
import { barajar } from './utiles.js'

const URL_API = 'https://rickandmortyapi.com/api'
const ESPERAS_MS = [2000, 4000, 8000]
const ESPERA_TOTAL_MS = 14000
const PERSONAJES_POR_PAGINA = 20
const FOTOS_POR_LOTE = 15
const PAUSA_ENTRE_LOTES_MS = 500
const ESPERA_BLOQUEO_MS = 11000 // El bloqueo de la API dura unos 10 segundos
const MAX_BLOQUEOS_FOTOS = 4

// Pausa antes de consultar: evita peticiones de más en cambios muy rápidos.
export const ESPERA_CONSULTA_MS = 300

// Guarda las respuestas para no repetir consultas: la API limita las
// peticiones y responde 429 durante unos 10 segundos si se hacen muchas.
const cache = new Map()
const episodiosConocidos = new Map()

// Si la consulta se cancela, la espera termina de inmediato.
function esperar(milisegundos, signal) {
  return new Promise((resolver, rechazar) => {
    const temporizador = setTimeout(resolver, milisegundos)
    signal?.addEventListener('abort', () => {
      clearTimeout(temporizador)
      rechazar(signal.reason)
    })
  })
}

// El error 429 llega sin cabeceras CORS, así que el navegador lo reporta como
// un fallo de red. Por eso también se reintenta cuando fetch lanza un error.
// Cada espera duplica la anterior para superar el bloqueo, y esperaApi.js
// avisa a la pantalla mientras dura.
async function pedirConReintentos(url, signal) {
  let espera = null
  try {
    for (const milisegundos of ESPERAS_MS) {
      try {
        const respuesta = await fetch(url, { signal })
        if (respuesta.status !== 429) return respuesta
      } catch (problema) {
        if (problema.name === 'AbortError') throw problema
      }
      espera ??= iniciarEspera(ESPERA_TOTAL_MS)
      await esperar(milisegundos, signal)
    }
    return await fetch(url, { signal })
  } finally {
    terminarEspera(espera)
  }
}

// Usa la copia local de la foto si existe (ver scripts/descargar-avatares.mjs).
// La de la API queda como respaldo, por ejemplo para personajes nuevos.
function conFotoLocal(personaje) {
  const { total, faltantes } = avatares
  if (personaje.id > total || faltantes.includes(personaje.id)) return personaje
  return {
    ...personaje,
    image: `${import.meta.env.BASE_URL}fotos/${personaje.id}.webp`,
  }
}

function esFotoRemota(url) {
  return url.startsWith('http')
}

function cargarFoto(url) {
  return new Promise((resolver) => {
    const imagen = new Image()
    imagen.onload = () => resolver(true)
    imagen.onerror = () => resolver(false)
    imagen.src = url
  })
}

// Las fotos también cuentan para el límite de la API: pedir muchas a la vez
// deja algunas rotas. Por eso se piden por lotes y las que fallan se reintentan
// tras el bloqueo. Al terminar, el navegador las tiene todas en caché.
export async function precargarFotos(urls, signal, alAvanzar) {
  let pendientes = urls
  let bloqueos = 0

  while (pendientes.length > 0) {
    signal?.throwIfAborted()

    const lote = pendientes.slice(0, FOTOS_POR_LOTE)
    const resultados = await Promise.all(lote.map(cargarFoto))
    const fallidas = lote.filter((_, indice) => !resultados[indice])

    pendientes = [...pendientes.slice(FOTOS_POR_LOTE), ...fallidas]
    alAvanzar?.(urls.length - pendientes.length)
    if (pendientes.length === 0) return

    if (fallidas.length === 0) {
      // Las fotos locales no tienen límite: solo se espera por las de la API.
      if (lote.some(esFotoRemota)) await esperar(PAUSA_ENTRE_LOTES_MS, signal)
      continue
    }

    bloqueos++
    if (bloqueos > MAX_BLOQUEOS_FOTOS) {
      throw new Error('No se pudieron cargar todas las fotos')
    }
    const espera = iniciarEspera(ESPERA_BLOQUEO_MS)
    try {
      await esperar(ESPERA_BLOQUEO_MS, signal)
    } finally {
      terminarEspera(espera)
    }
  }
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
    personajes: (datos?.results ?? []).map(conFotoLocal),
    total: datos?.info.count ?? 0,
    hayMas: Boolean(datos?.info.next),
  }
}

// Consulta por partes una lista de URL de personajes (residentes o reparto).
export async function obtenerPersonajesPorUrls(urls, pagina, signal) {
  const fin = pagina * PERSONAJES_POR_PAGINA
  const ids = urls.slice(fin - PERSONAJES_POR_PAGINA, fin).map(idDesdeUrl)
  return {
    personajes: (await pedirPorIds('character', ids, signal)).map(conFotoLocal),
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
    const fotoConfusa = avatares.fotosRepetidas.includes(id)
    if (!excluidos.has(id) && !fotoConfusa) disponibles.push(id)
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
  return personajes.map(conFotoLocal)
}

export function obtenerUbicacion(id, signal) {
  return pedirJson(`${URL_API}/location/${id}`, signal)
}

export function obtenerEpisodio(id, signal) {
  return pedirJson(`${URL_API}/episode/${id}`, signal)
}

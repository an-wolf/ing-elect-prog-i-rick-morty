// Descarga las fotos de todos los personajes, las convierte a WebP y las guarda
// en public/fotos/ para servirlas desde el propio sitio: así pesan menos y no
// dependen del límite de peticiones de la API.
//
// Uso: npm run avatares
// Si se interrumpe, al volver a ejecutarlo continúa con las que faltan.
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const URL_API = 'https://rickandmortyapi.com/api/character'
const CARPETA = new URL('../public/fotos/', import.meta.url)
const INDICE = new URL('../src/avatares.json', import.meta.url)
const CALIDAD_WEBP = 70
const PAUSA_MS = 250
const MAX_INTENTOS = 5
const ESPERA_429_MS = 11000

function esperar(milisegundos) {
  return new Promise((resolver) => setTimeout(resolver, milisegundos))
}

// Pide una URL y, si la API responde 429, espera lo que ella indique.
async function pedir(url) {
  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    const respuesta = await fetch(url)
    if (respuesta.status !== 429) return respuesta

    const segundos = Number(respuesta.headers.get('retry-after'))
    const espera = segundos ? (segundos + 1) * 1000 : ESPERA_429_MS
    console.log(`  Límite de la API: esperando ${espera / 1000} s`)
    await esperar(espera)
  }
  throw new Error(`Demasiados intentos con ${url}`)
}

async function descargar(id) {
  const respuesta = await pedir(`${URL_API}/avatar/${id}.jpeg`)
  if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`)

  // sharp falla si lo recibido no es una imagen válida.
  const original = Buffer.from(await respuesta.arrayBuffer())
  const webp = await sharp(original)
    .webp({ quality: CALIDAD_WEBP, effort: 6 })
    .toBuffer()
  await writeFile(new URL(`${id}.webp`, CARPETA), webp)
}

// Algunos personajes comparten una misma foto de relleno: en los juegos se
// confundirían entre sí, así que se anotan para no sortearlos.
async function buscarFotosRepetidas(total) {
  const grupos = new Map()
  for (let id = 1; id <= total; id++) {
    const archivo = new URL(`${id}.webp`, CARPETA)
    if (!existsSync(archivo)) continue

    const huella = createHash('sha1').update(await readFile(archivo)).digest('hex')
    grupos.set(huella, [...(grupos.get(huella) ?? []), id])
  }
  return [...grupos.values()].filter((ids) => ids.length > 1).flat()
}

const { info } = await (await pedir(URL_API)).json()
const total = info.count
await mkdir(CARPETA, { recursive: true })
console.log(`La API tiene ${total} personajes`)

const faltantes = []
let descargadas = 0

for (let id = 1; id <= total; id++) {
  if (existsSync(new URL(`${id}.webp`, CARPETA))) continue

  try {
    await descargar(id)
    descargadas++
    if (descargadas % 50 === 0) console.log(`  ${descargadas} descargadas (ID ${id})`)
  } catch (problema) {
    console.log(`  No se pudo descargar ${id}: ${problema.message}`)
    faltantes.push(id)
  }
  await esperar(PAUSA_MS)
}

const fotosRepetidas = await buscarFotosRepetidas(total)

// La app consulta este índice para saber qué fotos tiene disponibles.
await writeFile(INDICE, `${JSON.stringify({ total, faltantes, fotosRepetidas })}\n`)

console.log(`Listo: ${descargadas} nuevas, ${faltantes.length} faltantes`)
if (faltantes.length > 0) process.exitCode = 1

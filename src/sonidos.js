import urlMusica from './sounds/adivina-soundtrack.mp3'
import urlFallo from './sounds/fail.mp3'

const VOLUMEN_MUSICA = 0.12
const VOLUMEN_MUSICA_BAJO = 0.03
const VOLUMEN_ACIERTO = 0.15
const VOLUMEN_FALLO = 0.5

// Segundos que tarda la música en bajar y en recuperar su volumen.
const TRANSICION_BAJADA = 0.15
const TRANSICION_SUBIDA = 0.6
const DURACION_NOTA = 0.12

let contexto = null
let musica = null
let volumenMusica = null
let volumenFallo = null
let cargaFallo = null // Promesa con el sonido de fallo ya decodificado
let fuenteFallo = null // Sonido de fallo que está sonando

function cargarSonido(url) {
  return fetch(url)
    .then((respuesta) => respuesta.arrayBuffer())
    .then((bytes) => contexto.decodeAudioData(bytes))
}

// El navegador solo permite audio después de una acción del usuario, por eso
// todo se crea aquí, la primera vez que se necesita, y no al cargar la página.
function prepararAudio() {
  if (!contexto) {
    contexto = new AudioContext()

    musica = new Audio(urlMusica)
    musica.loop = true

    // La música pasa por un nodo de volumen para poder subirlo y bajarlo
    // de forma gradual.
    volumenMusica = contexto.createGain()
    volumenMusica.gain.value = VOLUMEN_MUSICA
    contexto.createMediaElementSource(musica).connect(volumenMusica)
    volumenMusica.connect(contexto.destination)

    // El fallo se reproduce desde el mismo contexto de audio: así puede
    // reiniciarse al instante cuando hay varios fallos seguidos.
    volumenFallo = contexto.createGain()
    volumenFallo.gain.value = VOLUMEN_FALLO
    volumenFallo.connect(contexto.destination)
    cargaFallo = cargarSonido(urlFallo)
  }
  if (contexto.state === 'suspended') contexto.resume()
}

function dejarDeEsperarAccion() {
  window.removeEventListener('pointerdown', reproducirMusica)
  window.removeEventListener('keydown', reproducirMusica)
}

function reproducirMusica() {
  dejarDeEsperarAccion()
  prepararAudio()
  // play() se rechaza si la música se pausa antes de empezar: no es un error.
  musica.play().catch(() => {})
}

export function iniciarMusica() {
  if (navigator.userActivation?.hasBeenActive) {
    reproducirMusica()
    return
  }
  // Si se entró directo por la URL, la música espera a la primera acción.
  window.addEventListener('pointerdown', reproducirMusica)
  window.addEventListener('keydown', reproducirMusica)
}

export function detenerMusica() {
  dejarDeEsperarAccion()
  musica?.pause()
  fuenteFallo?.stop()
}

// Baja la música mientras suena un efecto y luego la devuelve a su volumen.
function bajarMusica(segundos) {
  const volumen = volumenMusica.gain
  const ahora = contexto.currentTime
  const finBajada = ahora + TRANSICION_BAJADA
  const finEfecto = finBajada + segundos

  volumen.cancelScheduledValues(ahora)
  volumen.setValueAtTime(volumen.value, ahora)
  volumen.linearRampToValueAtTime(VOLUMEN_MUSICA_BAJO, finBajada)
  volumen.setValueAtTime(VOLUMEN_MUSICA_BAJO, finEfecto)
  volumen.linearRampToValueAtTime(VOLUMEN_MUSICA, finEfecto + TRANSICION_SUBIDA)
}

// Sonido de acierto: dos notas generadas con la Web Audio API.
function tocarNotas(frecuencias) {
  frecuencias.forEach((frecuencia, indice) => {
    const inicio = contexto.currentTime + indice * DURACION_NOTA
    const oscilador = contexto.createOscillator()
    const volumen = contexto.createGain()

    oscilador.type = 'sine'
    oscilador.frequency.value = frecuencia

    // El volumen baja de forma gradual para que la nota no termine en seco.
    volumen.gain.setValueAtTime(VOLUMEN_ACIERTO, inicio)
    volumen.gain.exponentialRampToValueAtTime(0.001, inicio + DURACION_NOTA)

    oscilador.connect(volumen)
    volumen.connect(contexto.destination)
    oscilador.start(inicio)
    oscilador.stop(inicio + DURACION_NOTA)
  })
}

export function sonidoAcierto() {
  prepararAudio()
  const notas = [523, 784]
  bajarMusica(notas.length * DURACION_NOTA)
  tocarNotas(notas)
}

function tocarFallo(sonido) {
  fuenteFallo?.stop()
  fuenteFallo = contexto.createBufferSource()
  fuenteFallo.buffer = sonido
  fuenteFallo.connect(volumenFallo)
  fuenteFallo.start()
  bajarMusica(sonido.duration)
}

export function sonidoFallo() {
  prepararAudio()
  // Si el archivo no se pudo cargar, el juego sigue sin ese sonido.
  cargaFallo.then(tocarFallo).catch(() => {})
}

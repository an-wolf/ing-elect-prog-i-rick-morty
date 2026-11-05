// Estado de las esperas por el límite de la API. Vive fuera de React para que
// api.js pueda avisar y la alerta pueda escuchar sin conocerse entre sí.
const activas = new Set()
const escuchas = new Set()
let espera = null // La espera que termina más tarde, o null si no hay ninguna

function publicar() {
  espera = null
  activas.forEach((activa) => {
    if (!espera || activa.fin > espera.fin) espera = activa
  })
  escuchas.forEach((escucha) => escucha())
}

export function iniciarEspera(milisegundos) {
  const inicio = Date.now()
  const nueva = { inicio, fin: inicio + milisegundos }
  activas.add(nueva)
  publicar()
  return nueva
}

export function terminarEspera(terminada) {
  if (activas.delete(terminada)) publicar()
}

export function suscribirEspera(escucha) {
  escuchas.add(escucha)
  return () => escuchas.delete(escucha)
}

export function obtenerEspera() {
  return espera
}

// Devuelve una copia de la lista en orden aleatorio (algoritmo Fisher-Yates).
// `veces` indica cuántas barajadas seguidas se hacen.
export function barajar(lista, veces = 1) {
  const copia = [...lista]
  for (let vuelta = 0; vuelta < veces; vuelta++) {
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copia[i], copia[j]] = [copia[j], copia[i]]
    }
  }
  return copia
}

export const CLAVE_DESEOS = 'laguito-libre.lista-deseos.v1'
export const EVENTO_DESEOS = 'laguito-libre:deseos-actualizados'

const nombreComparable = (nombre) => nombre.normalize('NFC').toLocaleLowerCase('es')

function normalizarNombre(nombre) {
  if (typeof nombre !== 'string') throw new Error('Escribe el nombre de la lista.')
  const resultado = nombre.trim().replace(/\s+/g, ' ')
  if (!resultado) throw new Error('Escribe el nombre de la lista.')
  if (resultado.length > 40) throw new Error('El nombre puede tener hasta 40 caracteres.')
  return resultado
}

function listasUnicas(listas) {
  const nombres = new Map()
  for (const lista of listas) {
    const nombre = normalizarNombre(lista)
    if (!nombres.has(nombreComparable(nombre))) nombres.set(nombreComparable(nombre), nombre)
  }
  return [...nombres.values()]
}

export function cargarDeseos(almacenamiento) {
  try {
    const storage = almacenamiento ?? window.localStorage
    const texto = storage.getItem(CLAVE_DESEOS)
    const registros = texto === null ? [] : JSON.parse(texto)
    if (!Array.isArray(registros)) throw new Error('Lista inválida')

    const unicos = new Map()
    for (const registro of registros) {
      if (!registro || typeof registro.id !== 'string' || !registro.id.trim()) {
        throw new Error('Producto inválido')
      }
      if (!Array.isArray(registro.listas)) throw new Error('Listas inválidas')
      const id = registro.id.trim()
      const anteriores = unicos.get(id)?.listas ?? []
      unicos.set(id, { id, listas: listasUnicas([...anteriores, ...registro.listas]) })
    }

    return { items: [...unicos.values()], error: '' }
  } catch {
    return { items: [], error: 'No se pudo cargar tu lista de deseos. Intenta nuevamente.' }
  }
}

function modificarDeseos(transformar, almacenamiento) {
  const actuales = cargarDeseos(almacenamiento)
  if (actuales.error) throw new Error(actuales.error)
  const siguientes = transformar(actuales.items)

  if (JSON.stringify(siguientes) !== JSON.stringify(actuales.items)) {
    try {
      const storage = almacenamiento ?? window.localStorage
      storage.setItem(CLAVE_DESEOS, JSON.stringify(siguientes))
    } catch {
      throw new Error('No se pudieron guardar tus cambios. Intenta nuevamente.')
    }
    // El evento storage se recibe en otras pestañas; este evento actualiza la actual.
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_DESEOS))
  }

  return { items: siguientes, error: '' }
}

export function guardarDeseo(id, almacenamiento) {
  if (typeof id !== 'string' || !id.trim()) throw new Error('Producto inválido.')
  const productoId = id.trim()
  return modificarDeseos(
    (items) => items.some((item) => item.id === productoId)
      ? items
      : [{ id: productoId, listas: [] }, ...items],
    almacenamiento
  )
}

export function quitarDeseo(id, almacenamiento) {
  return modificarDeseos((items) => items.filter((item) => item.id !== id), almacenamiento)
}

export function obtenerNombresListas(items) {
  return listasUnicas(items.flatMap((item) => item.listas)).sort((a, b) => a.localeCompare(b, 'es'))
}

export function anadirALista(id, nombre, almacenamiento) {
  const solicitado = normalizarNombre(nombre)
  return modificarDeseos((items) => {
    if (!items.some((item) => item.id === id)) {
      throw new Error('Este producto ya no está en tu lista de deseos.')
    }
    const existente = obtenerNombresListas(items).find(
      (lista) => nombreComparable(lista) === nombreComparable(solicitado)
    )
    const lista = existente ?? solicitado
    return items.map((item) => item.id === id
      ? { ...item, listas: listasUnicas([...item.listas, lista]) }
      : item)
  }, almacenamiento)
}

export function quitarDeLista(id, nombre, almacenamiento) {
  return modificarDeseos((items) => items.map((item) => item.id === id
    ? { ...item, listas: item.listas.filter((lista) => nombreComparable(lista) !== nombreComparable(nombre)) }
    : item), almacenamiento)
}

export function suscribirDeseos(onCambio, objetivo = window) {
  const onStorage = (event) => {
    if (event.key === CLAVE_DESEOS || event.key === null) onCambio()
  }
  objetivo.addEventListener('storage', onStorage)
  objetivo.addEventListener(EVENTO_DESEOS, onCambio)
  return () => {
    objetivo.removeEventListener('storage', onStorage)
    objetivo.removeEventListener(EVENTO_DESEOS, onCambio)
  }
}

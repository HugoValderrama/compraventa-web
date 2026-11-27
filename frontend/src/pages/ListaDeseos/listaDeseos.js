const API_BASE = 'http://localhost:7173/api'
export const CLAVE_DESEOS = 'laguito-libre.lista-deseos.v1'
export const CLAVE_LISTAS_CUSTOM = 'laguito-libre.listas-personalizadas.v1'
export const EVENTO_DESEOS = 'laguito-libre:deseos-actualizados'

function obtenerToken() {
  return (
    window.localStorage.getItem('token') ||
    window.localStorage.getItem('jwt') ||
    window.localStorage.getItem('accessToken') ||
    ''
  )
}

function headersAuth() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${obtenerToken()}`,
  }
}

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

function leerMapaListas() {
  try {
    const texto = window.localStorage.getItem(CLAVE_LISTAS_CUSTOM)
    return texto ? JSON.parse(texto) : {}
  } catch {
    return {}
  }
}

function guardarMapaListas(mapa) {
  try {
    window.localStorage.setItem(CLAVE_LISTAS_CUSTOM, JSON.stringify(mapa))
  } catch {}
}

function parsearIdYTipo(id, tipoExplicito) {
  const str = String(id ?? '').trim()
  if (str.startsWith('servicio-')) {
    return { idBien: Number(str.replace('servicio-', '')), tipo: 'servicio' }
  }
  if (str.startsWith('producto-')) {
    return { idBien: Number(str.replace('producto-', '')), tipo: 'producto' }
  }
  return { idBien: Number(str), tipo: tipoExplicito === 'servicio' ? 'servicio' : 'producto' }
}

export async function obtenerDeseosApi() {
  const res = await fetch(`${API_BASE}/deseos`, {
    headers: headersAuth(),
  })
  if (res.status === 401) {
    throw new Error('Tu sesión expiró o no has iniciado sesión.')
  }
  if (!res.ok) {
    throw new Error('No se pudo cargar tu lista de deseos desde el servidor.')
  }
  const lista = await res.json()
  const mapaListas = leerMapaListas()

  const items = lista.map((d) => ({
    ...d,
    id: String(d.id),
    listas: listasUnicas(mapaListas[String(d.id)] || []),
  }))

  try {
    window.localStorage.setItem(CLAVE_DESEOS, JSON.stringify(items))
    window.dispatchEvent(new Event(EVENTO_DESEOS))
  } catch {}

  return items
}

export async function guardarDeseoApi(idBien, tipo = 'producto') {
  const ruta = tipo === 'servicio' ? 'servicios' : 'productos'
  const res = await fetch(`${API_BASE}/deseos/${ruta}/${idBien}`, {
    method: 'POST',
    headers: headersAuth(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.mensaje || 'No se pudo guardar en la lista de deseos.')
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_DESEOS))
}

export async function quitarDeseoApi(idBien, tipo = 'producto') {
  const ruta = tipo === 'servicio' ? 'servicios' : 'productos'
  const res = await fetch(`${API_BASE}/deseos/${ruta}/${idBien}`, {
    method: 'DELETE',
    headers: headersAuth(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.mensaje || 'No se pudo eliminar de la lista de deseos.')
  }
  const mapa = leerMapaListas()
  delete mapa[`${tipo}-${idBien}`]
  guardarMapaListas(mapa)
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_DESEOS))
}

// --- Funciones compatibles con Catálogo y Detalle (actualizan caché local y sincronizan con PostgreSQL) ---

export function cargarDeseos(almacenamiento) {
  try {
    const storage = almacenamiento ?? window.localStorage
    const texto = storage.getItem(CLAVE_DESEOS)
    const registros = texto === null ? [] : JSON.parse(texto)
    if (!Array.isArray(registros)) throw new Error('Lista inválida')
    return { items: registros, error: '' }
  } catch {
    return { items: [], error: 'No se pudo cargar tu lista de deseos. Intenta nuevamente.' }
  }
}

export function guardarDeseo(id, almacenamiento) {
  const strId = String(id ?? '').trim()
  if (!strId) throw new Error('Elemento inválido.')

  const actuales = cargarDeseos(almacenamiento).items
  const { idBien, tipo } = parsearIdYTipo(strId)
  const idNormalizado = Number.isFinite(idBien) && idBien > 0 ? `${tipo}-${idBien}` : strId

  const siguientes = actuales.some((item) => item.id === idNormalizado || String(item.idBien) === strId)
    ? actuales
    : [{ id: idNormalizado, idBien, tipo, listas: [] }, ...actuales]

  try {
    const storage = almacenamiento ?? window.localStorage
    storage.setItem(CLAVE_DESEOS, JSON.stringify(siguientes))
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_DESEOS))
  } catch {}

  if (Number.isFinite(idBien) && idBien > 0 && obtenerToken()) {
    guardarDeseoApi(idBien, tipo).catch(console.error)
  }

  return { items: siguientes, error: '' }
}

export function quitarDeseo(id, almacenamiento) {
  const strId = String(id ?? '').trim()
  const actuales = cargarDeseos(almacenamiento).items
  const encontrado = actuales.find((item) => item.id === strId || String(item.idBien) === strId)
  const { idBien, tipo } = encontrado
    ? { idBien: encontrado.idBien, tipo: encontrado.tipo }
    : parsearIdYTipo(strId)

  const siguientes = actuales.filter((item) => item.id !== strId && String(item.idBien) !== strId)

  try {
    const storage = almacenamiento ?? window.localStorage
    storage.setItem(CLAVE_DESEOS, JSON.stringify(siguientes))
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_DESEOS))
  } catch {}

  if (Number.isFinite(idBien) && idBien > 0 && obtenerToken()) {
    quitarDeseoApi(idBien, tipo).catch(console.error)
  }

  return { items: siguientes, error: '' }
}

export function obtenerNombresListas(items) {
  return listasUnicas(items.flatMap((item) => item.listas || [])).sort((a, b) => a.localeCompare(b, 'es'))
}

export function anadirALista(id, nombre) {
  const solicitado = normalizarNombre(nombre)
  const actuales = cargarDeseos().items
  if (!actuales.some((item) => item.id === id)) {
    throw new Error('Este elemento ya no está en tu lista de deseos.')
  }
  const existente = obtenerNombresListas(actuales).find(
    (lista) => nombreComparable(lista) === nombreComparable(solicitado)
  )
  const lista = existente ?? solicitado

  const mapa = leerMapaListas()
  mapa[id] = listasUnicas([...(mapa[id] || []), lista])
  guardarMapaListas(mapa)

  const siguientes = actuales.map((item) =>
    item.id === id ? { ...item, listas: mapa[id] } : item
  )
  window.localStorage.setItem(CLAVE_DESEOS, JSON.stringify(siguientes))
  window.dispatchEvent(new Event(EVENTO_DESEOS))
  return { items: siguientes, error: '' }
}

export function quitarDeLista(id, nombre) {
  const mapa = leerMapaListas()
  mapa[id] = (mapa[id] || []).filter((lista) => nombreComparable(lista) !== nombreComparable(nombre))
  guardarMapaListas(mapa)

  const siguientes = cargarDeseos().items.map((item) =>
    item.id === id ? { ...item, listas: mapa[id] } : item
  )
  window.localStorage.setItem(CLAVE_DESEOS, JSON.stringify(siguientes))
  window.dispatchEvent(new Event(EVENTO_DESEOS))
  return { items: siguientes, error: '' }
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

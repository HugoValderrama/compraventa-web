import { validarCarritoActual } from './carrito.js'

const API_BASE = 'http://localhost:7173/api'
const CLAVE_SELECCIONADA = 'laguito-libre.direccion-envio-seleccionada.v1'
const CLAVE_CACHE = 'laguito-libre.direcciones-cache.v1'
const EVENTO_DIRECCIONES = 'laguito-libre:direcciones-actualizadas'

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

function normalizarDireccionApi(d) {
  const calleYNumero = [d.calle, d.numero].filter(Boolean).join(' #')
  const direccionTexto = [calleYNumero, d.departamento ? `Depto ${d.departamento}` : '']
    .filter(Boolean)
    .join(', ')

  return {
    ...d,
    id: String(d.id),
    direccion: direccionTexto,
    ciudad: d.comuna || '',
  }
}

export async function obtenerDireccionesApi() {
  const res = await fetch(`${API_BASE}/direcciones`, {
    headers: headersAuth(),
  })
  if (res.status === 401) {
    throw new Error('Tu sesión expiró o no has iniciado sesión.')
  }
  if (!res.ok) {
    throw new Error('No se pudieron cargar tus direcciones desde el servidor.')
  }
  const lista = await res.json()
  const normalizadas = lista.map(normalizarDireccionApi)

  try {
    window.localStorage.setItem(CLAVE_CACHE, JSON.stringify(normalizadas))
    window.dispatchEvent(new Event(EVENTO_DIRECCIONES))
  } catch {}

  return normalizadas
}

export async function guardarDireccionApi(payload, id = null) {
  const url = id ? `${API_BASE}/direcciones/${id}` : `${API_BASE}/direcciones`
  const method = id ? 'PUT' : 'POST'

  const res = await fetch(url, {
    method,
    headers: headersAuth(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.mensaje || 'Error al guardar la dirección en el servidor.')
  }

  return await res.json()
}

export async function obtenerLimitesApi() {
  const res = await fetch(`${API_BASE}/direcciones/limites`)
  if (!res.ok) return {}
  return await res.json()
}

export async function obtenerRegionesApi() {
  const res = await fetch(`${API_BASE}/ubicaciones/regiones`)
  if (!res.ok) return []
  return await res.json()
}

export async function obtenerProvinciasApi(regionId) {
  if (!regionId) return []
  const res = await fetch(`${API_BASE}/ubicaciones/regiones/${regionId}/provincias`)
  if (!res.ok) return []
  return await res.json()
}

export async function obtenerComunasApi(provinciaId) {
  if (!provinciaId) return []
  const res = await fetch(`${API_BASE}/ubicaciones/provincias/${provinciaId}/comunas`)
  if (!res.ok) return []
  return await res.json()
}

export function obtenerSeleccionadaId() {
  return window.localStorage.getItem(CLAVE_SELECCIONADA) || ''
}

export function guardarSeleccionadaId(id) {
  if (id) window.localStorage.setItem(CLAVE_SELECCIONADA, String(id))
  else window.localStorage.removeItem(CLAVE_SELECCIONADA)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENTO_DIRECCIONES))
  }
}

// --- Funciones de compatibilidad para PagoPage y ConfirmacionPage ---

export function cargarDirecciones(almacenamiento) {
  try {
    const storage = almacenamiento ?? window.localStorage
    const texto = storage.getItem(CLAVE_CACHE)
    const direcciones = texto ? JSON.parse(texto) : []
    const seleccionadaId = storage.getItem(CLAVE_SELECCIONADA) || direcciones[0]?.id || null
    return {
      direcciones: Array.isArray(direcciones) ? direcciones : [],
      seleccionadaId,
      predeterminadaId: seleccionadaId,
      error: '',
    }
  } catch {
    return { direcciones: [], seleccionadaId: null, predeterminadaId: null, error: '' }
  }
}

export function seleccionarDireccion(id) {
  guardarSeleccionadaId(id)
  return cargarDirecciones()
}

export function suscribirDirecciones(onCambio, objetivo = window) {
  const onStorage = (event) => {
    if (event.key === CLAVE_CACHE || event.key === CLAVE_SELECCIONADA || event.key === null) {
      onCambio()
    }
  }
  objetivo.addEventListener('storage', onStorage)
  objetivo.addEventListener(EVENTO_DIRECCIONES, onCambio)
  return () => {
    objetivo.removeEventListener('storage', onStorage)
    objetivo.removeEventListener(EVENTO_DIRECCIONES, onCambio)
  }
}

export function prepararEnvio(direccionesOAlmacenamiento, seleccionadaId) {
  const { resumen } = validarCarritoActual()

  let lista = []
  let idSel = seleccionadaId

  if (Array.isArray(direccionesOAlmacenamiento)) {
    lista = direccionesOAlmacenamiento
  } else {
    const envio = cargarDirecciones(direccionesOAlmacenamiento)
    lista = envio.direcciones
    idSel = envio.seleccionadaId
  }

  const direccion = lista.find((item) => String(item.id) === String(idSel))
  if (!direccion) {
    throw new Error('Selecciona una dirección de envío antes de continuar.')
  }
  return { direccion, resumen }
}

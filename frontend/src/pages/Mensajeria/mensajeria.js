const API_BASE = 'http://localhost:7173/api'
export const CLAVE_MENSAJERIA = 'laguito-libre.mensajeria.v1'
export const EVENTO_MENSAJERIA = 'laguito-libre:mensajeria-actualizada'
// En PostgreSQL la columna mensaje.contenido es varchar(500)
export const MAXIMO_MENSAJE = 500

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

function extraerVentaId(conversacionId) {
  const str = String(conversacionId ?? '').trim()
  return str.startsWith('venta-') ? Number(str.replace('venta-', '')) : Number(str)
}

export async function obtenerConversacionesApi() {
  const res = await fetch(`${API_BASE}/mensajeria`, {
    headers: headersAuth(),
  })
  if (res.status === 401) {
    throw new Error('Tu sesión expiró o no has iniciado sesión.')
  }
  if (!res.ok) {
    throw new Error('No se pudieron cargar tus conversaciones desde el servidor.')
  }
  const conversaciones = await res.json()

  try {
    window.localStorage.setItem(CLAVE_MENSAJERIA, JSON.stringify(conversaciones))
    window.dispatchEvent(new Event(EVENTO_MENSAJERIA))
  } catch {}

  return conversaciones
}

export async function enviarMensajeApi(conversacionId, texto) {
  if (typeof texto !== 'string' || !texto.trim()) {
    throw new Error('Escribe un mensaje antes de enviarlo.')
  }
  if (texto.trim().length > MAXIMO_MENSAJE) {
    throw new Error(`El mensaje puede tener hasta ${MAXIMO_MENSAJE} caracteres.`)
  }

  const ventaId = extraerVentaId(conversacionId)
  const res = await fetch(`${API_BASE}/mensajeria/ventas/${ventaId}/mensajes`, {
    method: 'POST',
    headers: headersAuth(),
    body: JSON.stringify({ texto: texto.trim() }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.mensaje || 'No se pudo enviar el mensaje.')
  }

  return await res.json()
}

export async function marcarConversacionLeidaApi(conversacionId) {
  const ventaId = extraerVentaId(conversacionId)
  const res = await fetch(`${API_BASE}/mensajeria/ventas/${ventaId}/leer`, {
    method: 'PUT',
    headers: headersAuth(),
  })
  if (!res.ok) {
    throw new Error('No se pudo actualizar el estado de lectura.')
  }
}

export function cargarMensajeria(almacenamiento) {
  try {
    const storage = almacenamiento ?? window.localStorage
    const texto = storage.getItem(CLAVE_MENSAJERIA)
    const conversaciones = texto ? JSON.parse(texto) : []
    return { conversaciones: Array.isArray(conversaciones) ? conversaciones : [], error: '' }
  } catch {
    return { conversaciones: [], error: 'No se pudieron cargar las conversaciones.' }
  }
}

export function contarNoLeidos(conversacion) {
  const indice = conversacion.leidoHasta === null
    ? -1
    : conversacion.mensajes.findIndex((mensaje) => mensaje.id === conversacion.leidoHasta)
  return conversacion.mensajes.filter((mensaje, posicion) => posicion > indice && mensaje.autor === 'contacto').length
}

export function ordenarConversaciones(conversaciones) {
  return [...conversaciones].sort((a, b) => {
    const fechaA = Date.parse(a.mensajes.at(-1)?.fecha ?? '') || 0
    const fechaB = Date.parse(b.mensajes.at(-1)?.fecha ?? '') || 0
    return fechaB - fechaA || String(a.id).localeCompare(String(b.id))
  })
}

const hora = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Santiago' })
const dia = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', timeZone: 'America/Santiago' })
const completo = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Santiago' })
const diaComparable = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/Santiago' })

export function formatearFechaMensaje(fecha, formato = 'hilo', ahora = new Date()) {
  const valor = new Date(fecha)
  if (!Number.isFinite(valor.getTime())) return ''
  if (formato === 'completa') return completo.format(valor)
  if (formato === 'bandeja') {
    return diaComparable.format(valor) === diaComparable.format(ahora) ? hora.format(valor) : dia.format(valor)
  }
  return `${dia.format(valor)} · ${hora.format(valor)}`
}

export function estadoConversacion(conversacion, ahora = new Date()) {
  const ultimo = conversacion.mensajes.at(-1)
  if (!ultimo) return 'Escribe para iniciar la conversación'
  if (ultimo.autor !== 'yo') return conversacion.contacto.rol === 'emprendedor' ? 'Conversación con un emprendedor' : 'Conversación con un cliente'
  const dias = Math.floor(Math.max(0, new Date(ahora).getTime() - Date.parse(ultimo.fecha)) / 86400000)
  return dias > 0 ? `Esperando respuesta hace ${dias} ${dias === 1 ? 'día' : 'días'}` : 'Esperando respuesta'
}

export function suscribirMensajeria(onCambio, objetivo = window) {
  const onStorage = (event) => {
    if (event.key === CLAVE_MENSAJERIA || event.key === null) onCambio()
  }
  objetivo.addEventListener('storage', onStorage)
  objetivo.addEventListener(EVENTO_MENSAJERIA, onCambio)
  return () => {
    objetivo.removeEventListener('storage', onStorage)
    objetivo.removeEventListener(EVENTO_MENSAJERIA, onCambio)
  }
}

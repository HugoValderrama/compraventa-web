export const CLAVE_MENSAJERIA = 'laguito-libre.mensajeria-demo.v1'
export const EVENTO_MENSAJERIA = 'laguito-libre:mensajeria-demo-actualizada'
export const MAXIMO_MENSAJE = 2000

function fechaDeEjemplo(ahora, dias, hora, minuto) {
  const fecha = new Date(ahora)
  fecha.setUTCDate(fecha.getUTCDate() - dias)
  fecha.setUTCHours(hora, minuto, 0, 0)
  return fecha.toISOString()
}

// Estos contactos y mensajes son ficticios. No se envían a otras personas.
export function conversacionesDeEjemplo(ahora = new Date()) {
  return [
    {
      id: 'vendedor-1',
      contacto: { nombre: 'Vendedor1', rol: 'emprendedor' },
      leidoHasta: null,
      mensajes: [
        { id: 'ejemplo-1', autor: 'contacto', texto: 'Hola! Tu pedido ha sido despachado.', fecha: fechaDeEjemplo(ahora, 2, 13, 15) },
        { id: 'ejemplo-2', autor: 'contacto', texto: 'El número de seguimiento es: 583191', fecha: fechaDeEjemplo(ahora, 2, 13, 16) },
        { id: 'ejemplo-3', autor: 'yo', texto: '¡Gracias! Quedo atento', fecha: fechaDeEjemplo(ahora, 2, 14, 30) },
      ],
    },
    {
      id: 'vendedor-2',
      contacto: { nombre: 'Vendedor2', rol: 'emprendedor' },
      leidoHasta: null,
      mensajes: [
        { id: 'ejemplo-4', autor: 'contacto', texto: 'Gracias por tu compra, el producto estará listo esta semana.', fecha: fechaDeEjemplo(ahora, 3, 15, 0) },
      ],
    },
    {
      id: 'comprador-1',
      contacto: { nombre: 'Comprador1', rol: 'cliente' },
      leidoHasta: 'ejemplo-5',
      mensajes: [
        { id: 'ejemplo-5', autor: 'contacto', texto: 'He enviado el producto en el horario acordado. ¡Muchas gracias!', fecha: fechaDeEjemplo(ahora, 4, 16, 20) },
      ],
    },
  ]
}

function validarConversaciones(registros) {
  if (!Array.isArray(registros)) throw new Error('Conversaciones inválidas')
  const ids = new Set()
  return registros.map((registro) => {
    if (!registro || typeof registro.id !== 'string' || !registro.id.trim() || ids.has(registro.id)) {
      throw new Error('Conversación inválida')
    }
    ids.add(registro.id)
    const contacto = registro.contacto
    if (!contacto || typeof contacto.nombre !== 'string' || !contacto.nombre.trim() ||
        !['emprendedor', 'cliente'].includes(contacto.rol) || !Array.isArray(registro.mensajes)) {
      throw new Error('Contacto inválido')
    }
    const idsMensajes = new Set()
    let anterior = -Infinity
    const mensajes = registro.mensajes.map((mensaje) => {
      const instante = typeof mensaje?.fecha === 'string' ? Date.parse(mensaje.fecha) : NaN
      if (!mensaje || typeof mensaje.id !== 'string' || !mensaje.id.trim() || idsMensajes.has(mensaje.id) ||
          !['yo', 'contacto'].includes(mensaje.autor) || typeof mensaje.texto !== 'string' ||
          !mensaje.texto.trim() || mensaje.texto.length > MAXIMO_MENSAJE ||
          !Number.isFinite(instante) || instante < anterior) {
        throw new Error('Mensaje inválido')
      }
      idsMensajes.add(mensaje.id)
      anterior = instante
      return { id: mensaje.id, autor: mensaje.autor, texto: mensaje.texto, fecha: new Date(instante).toISOString() }
    })
    if (registro.leidoHasta !== null && !idsMensajes.has(registro.leidoHasta)) {
      throw new Error('Lectura inválida')
    }
    return {
      id: registro.id,
      contacto: { nombre: contacto.nombre.trim(), rol: contacto.rol },
      leidoHasta: registro.leidoHasta,
      mensajes,
    }
  })
}

export function cargarMensajeria(almacenamiento, ahora = new Date()) {
  try {
    const storage = almacenamiento ?? window.localStorage
    const texto = storage.getItem(CLAVE_MENSAJERIA)
    if (texto === null) return { conversaciones: conversacionesDeEjemplo(ahora), error: '' }
    const datos = JSON.parse(texto)
    if (datos?.version !== 1) throw new Error('Formato inválido')
    return { conversaciones: validarConversaciones(datos.conversaciones), error: '' }
  } catch {
    return { conversaciones: [], error: 'No se pudieron cargar las conversaciones. Intenta nuevamente.' }
  }
}

function guardar(conversaciones, almacenamiento) {
  const validadas = validarConversaciones(conversaciones)
  try {
    const storage = almacenamiento ?? window.localStorage
    storage.setItem(CLAVE_MENSAJERIA, JSON.stringify({ version: 1, conversaciones: validadas }))
  } catch {
    throw new Error('No se pudo guardar el mensaje o su lectura. Revisa el almacenamiento del navegador e intenta nuevamente.')
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_MENSAJERIA))
  return { conversaciones: validadas, error: '' }
}

export function contarNoLeidos(conversacion) {
  const indice = conversacion.leidoHasta === null
    ? -1
    : conversacion.mensajes.findIndex((mensaje) => mensaje.id === conversacion.leidoHasta)
  return conversacion.mensajes.filter((mensaje, posicion) => posicion > indice && mensaje.autor === 'contacto').length
}

export function marcarConversacionLeida(id, almacenamiento, ahora = new Date()) {
  const datos = cargarMensajeria(almacenamiento, ahora)
  if (datos.error) throw new Error(datos.error)
  const conversacion = datos.conversaciones.find((item) => item.id === id)
  if (!conversacion) throw new Error('Esta conversación no está disponible.')
  const ultimoId = conversacion.mensajes.at(-1)?.id ?? null
  if (conversacion.leidoHasta === ultimoId) return datos
  return guardar(datos.conversaciones.map((item) => item.id === id ? { ...item, leidoHasta: ultimoId } : item), almacenamiento)
}

function idMensaje() {
  return globalThis.crypto?.randomUUID?.() ?? `mensaje-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export function enviarMensaje(id, texto, almacenamiento, ahora = new Date()) {
  if (typeof texto !== 'string' || !texto.trim()) throw new Error('Escribe un mensaje antes de enviarlo.')
  if (texto.length > MAXIMO_MENSAJE) throw new Error(`El mensaje puede tener hasta ${MAXIMO_MENSAJE} caracteres.`)
  const datos = cargarMensajeria(almacenamiento, ahora)
  if (datos.error) throw new Error(datos.error)
  const conversacion = datos.conversaciones.find((item) => item.id === id)
  if (!conversacion) throw new Error('Esta conversación no está disponible.')
  const instante = new Date(ahora).getTime()
  if (!Number.isFinite(instante)) throw new Error('No se pudo determinar la fecha del mensaje.')
  // Conserva el orden aunque se atrase el reloj del equipo.
  const ultimoInstante = Date.parse(conversacion.mensajes.at(-1)?.fecha ?? '')
  const mensaje = {
    id: idMensaje(), autor: 'yo', texto: texto.trim(),
    fecha: new Date(Math.max(instante, Number.isFinite(ultimoInstante) ? ultimoInstante : instante)).toISOString(),
  }
  return guardar(datos.conversaciones.map((item) => item.id === id
    ? { ...item, mensajes: [...item.mensajes, mensaje], leidoHasta: mensaje.id }
    : item), almacenamiento)
}

export function ordenarConversaciones(conversaciones) {
  return [...conversaciones].sort((a, b) => {
    const fechaA = Date.parse(a.mensajes.at(-1)?.fecha ?? '') || 0
    const fechaB = Date.parse(b.mensajes.at(-1)?.fecha ?? '') || 0
    return fechaB - fechaA || a.id.localeCompare(b.id)
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

// Capa de datos del Panel de moderación (vista de administrador).
// Aquí viven las reglas: qué cuenta como "sin respuesta", cuánto lleva esperando,
// recordatorios y resolución. La página solo dibuja.
// Con backend, basta con reemplazar cargarModeracion() y guardar() por llamadas a la API
// (Pregunta.Fecha y Mensaje.Fechaenvio ya traen la fecha que se usa aquí).

export const CLAVE_MODERACION = 'laguito-libre.moderacion-demo.v1'
export const EVENTO_MODERACION = 'laguito-libre:moderacion-demo-actualizada'

// Un elemento entra en alerta cuando lleva MÁS de estas horas sin respuesta.
export const HORAS_ALERTA = 48
// Para no llenar de avisos al emprendedor: un recordatorio cada 24 horas como máximo.
export const HORAS_ENTRE_RECORDATORIOS = 24

export const TIPOS = ['pregunta', 'mensaje']
export const ESTADOS = ['pendiente', 'resuelta']

const MAXIMO_TEXTO = 2000
const MS_MINUTO = 60_000
const MS_HORA = 3_600_000

/* ------------------------------ Datos de prueba ------------------------------ */

const haceHoras = (ahora, horas) => new Date(new Date(ahora).getTime() - horas * MS_HORA).toISOString()

// Ficticios. Las fechas son relativas a "ahora" para que la demo siempre tenga alertas.
export function itemsDeEjemplo(ahora = new Date()) {
  const base = { estado: 'pendiente', recordadoEn: null }
  return [
    { ...base, id: 'pregunta-balon', tipo: 'pregunta', publicacion: 'Balón de fútbol mundial Qatar 2022', emprendedor: 'Deportes Austral', autor: 'Camila Rojas', texto: '¿Realizan envíos a Punta Arenas?', fecha: haceHoras(ahora, 72) },
    { ...base, id: 'pregunta-florero', tipo: 'pregunta', publicacion: 'Florero Gres Silvestre', emprendedor: 'Taller Tierra', autor: 'Sofía Torres', texto: '¿Realizan envíos a Valdivia?', fecha: haceHoras(ahora, 51) },
    { ...base, id: 'pregunta-taza', tipo: 'pregunta', publicacion: 'Taza de gres natural', emprendedor: 'Taller Tierra', autor: 'Pablo Fuentes', texto: '¿Se puede lavar en lavavajillas?', fecha: haceHoras(ahora, 5) },
    { ...base, id: 'mensaje-notebook', tipo: 'mensaje', publicacion: 'Notebook Lenovo', emprendedor: 'TecnoSur', autor: 'Diego Muñoz', texto: '¿Incluye cargador?', fecha: haceHoras(ahora, 80) },
    { ...base, id: 'mensaje-collar', tipo: 'mensaje', publicacion: 'Collar de plata y lapislázuli', emprendedor: 'Joyas del Norte', autor: 'Valentina Díaz', texto: '¿Puedo retirarlo en persona el sábado?', fecha: haceHoras(ahora, 55) },
    { ...base, id: 'mensaje-manta', tipo: 'mensaje', publicacion: 'Manta de lana natural', emprendedor: 'Tejidos Luna', autor: 'Andrés Pino', texto: 'Gracias, ya recibí mi pedido.', fecha: haceHoras(ahora, 2) },
  ]
}

/* ------------------------------- Validación -------------------------------- */

const textoValido = (valor) => typeof valor === 'string' && Boolean(valor.trim())

function validarItems(registros) {
  if (!Array.isArray(registros)) throw new Error('Datos inválidos')
  const ids = new Set()

  return registros.map((item) => {
    if (!item || !textoValido(item.id) || ids.has(item.id)) throw new Error('Elemento inválido')
    ids.add(item.id)

    const fecha = typeof item.fecha === 'string' ? Date.parse(item.fecha) : NaN
    const recordado = typeof item.recordadoEn === 'string' ? Date.parse(item.recordadoEn) : null

    if (
      !TIPOS.includes(item.tipo) ||
      !ESTADOS.includes(item.estado) ||
      !textoValido(item.publicacion) ||
      !textoValido(item.emprendedor) ||
      !textoValido(item.autor) ||
      !textoValido(item.texto) ||
      item.texto.length > MAXIMO_TEXTO ||
      !Number.isFinite(fecha) ||
      (item.recordadoEn !== null && !Number.isFinite(recordado))
    ) {
      throw new Error('Elemento inválido')
    }

    return {
      id: item.id,
      tipo: item.tipo,
      estado: item.estado,
      publicacion: item.publicacion.trim(),
      emprendedor: item.emprendedor.trim(),
      autor: item.autor.trim(),
      texto: item.texto,
      fecha: new Date(fecha).toISOString(),
      recordadoEn: recordado === null ? null : new Date(recordado).toISOString(),
    }
  })
}

/* --------------------------- Lectura / escritura --------------------------- */

export function cargarModeracion(almacenamiento, ahora = new Date()) {
  try {
    const storage = almacenamiento ?? window.localStorage
    const texto = storage.getItem(CLAVE_MODERACION)
    if (texto === null) return { items: itemsDeEjemplo(ahora), error: '' }

    const datos = JSON.parse(texto)
    if (datos?.version !== 1) throw new Error('Formato inválido')
    return { items: validarItems(datos.items), error: '' }
  } catch {
    return { items: [], error: 'No se pudieron cargar los datos de moderación. Intenta nuevamente.' }
  }
}

function guardar(items, almacenamiento) {
  const validados = validarItems(items)

  try {
    const storage = almacenamiento ?? window.localStorage
    storage.setItem(CLAVE_MODERACION, JSON.stringify({ version: 1, items: validados }))
  } catch {
    throw new Error('No se pudo guardar el cambio. Revisa el almacenamiento del navegador e intenta nuevamente.')
  }

  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_MODERACION))
  return { items: validados, error: '' }
}

// Lee, valida que el elemento siga pendiente y devuelve lo necesario para modificarlo.
function elementoPendiente(id, almacenamiento, ahora) {
  const datos = cargarModeracion(almacenamiento, ahora)
  if (datos.error) throw new Error(datos.error)

  const item = datos.items.find((candidato) => candidato.id === id)
  if (!item) throw new Error('Este elemento ya no está disponible.')
  if (item.estado !== 'pendiente') throw new Error('Este elemento ya fue resuelto.')

  return { items: datos.items, item }
}

/* ----------------------------------- Reglas ---------------------------------- */

export function horasEsperando(item, ahora = new Date()) {
  const milisegundos = new Date(ahora).getTime() - Date.parse(item.fecha)
  return Number.isFinite(milisegundos) ? Math.max(0, milisegundos) / MS_HORA : 0
}

export function esAlerta(item, ahora = new Date(), horas = HORAS_ALERTA) {
  return item.estado === 'pendiente' && horasEsperando(item, ahora) > horas
}

// Elementos de un tipo en alerta, del que lleva más tiempo esperando al más reciente.
export function itemsEnAlerta(items, tipo, ahora = new Date()) {
  return items
    .filter((item) => item.tipo === tipo && esAlerta(item, ahora))
    .sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha) || a.id.localeCompare(b.id))
}

export function contarAlertas(items, ahora = new Date()) {
  const conteo = { pregunta: 0, mensaje: 0, total: 0 }
  for (const item of items) {
    if (esAlerta(item, ahora)) {
      conteo[item.tipo] += 1
      conteo.total += 1
    }
  }
  return conteo
}

export function puedeRecordar(item, ahora = new Date()) {
  if (item.estado !== 'pendiente') return false
  if (!item.recordadoEn) return true
  return new Date(ahora).getTime() - Date.parse(item.recordadoEn) >= HORAS_ENTRE_RECORDATORIOS * MS_HORA
}

/* ---------------------------------- Acciones --------------------------------- */

export function enviarRecordatorio(id, almacenamiento, ahora = new Date()) {
  const { items, item } = elementoPendiente(id, almacenamiento, ahora)

  if (!puedeRecordar(item, ahora)) {
    throw new Error(`Ya se envió un recordatorio. Podrás enviar otro pasadas ${HORAS_ENTRE_RECORDATORIOS} horas.`)
  }

  const instante = new Date(ahora)
  if (!Number.isFinite(instante.getTime())) throw new Error('No se pudo determinar la fecha del recordatorio.')

  const resultado = guardar(
    items.map((actual) => (actual.id === id ? { ...actual, recordadoEn: instante.toISOString() } : actual)),
    almacenamiento,
  )
  return { ...resultado, item: resultado.items.find((actual) => actual.id === id) }
}

export function resolverItem(id, almacenamiento, ahora = new Date()) {
  const { items, item } = elementoPendiente(id, almacenamiento, ahora)
  const resultado = guardar(
    items.map((actual) => (actual.id === id ? { ...actual, estado: 'resuelta' } : actual)),
    almacenamiento,
  )
  return { ...resultado, item: resultado.items.find((actual) => actual.id === item.id) }
}

export function restablecerModeracion(almacenamiento, ahora = new Date()) {
  return guardar(itemsDeEjemplo(ahora), almacenamiento)
}

/* ---------------------------------- Formatos --------------------------------- */

const plural = (cantidad, uno, varios) => `${cantidad} ${cantidad === 1 ? uno : varios}`

// "Hace 3 días y 8 horas", "Hace 2 días", "Hace 5 horas", "Hace 12 minutos".
export function formatearAntiguedad(fecha, ahora = new Date()) {
  const inicio = Date.parse(fecha)
  const fin = new Date(ahora).getTime()
  if (!Number.isFinite(inicio) || !Number.isFinite(fin)) return ''

  const minutos = Math.max(0, Math.floor((fin - inicio) / MS_MINUTO))
  const dias = Math.floor(minutos / 1440)
  const horas = Math.floor((minutos % 1440) / 60)

  if (dias > 0) return `Hace ${plural(dias, 'día', 'días')}${horas > 0 ? ` y ${plural(horas, 'hora', 'horas')}` : ''}`
  if (horas > 0) return `Hace ${plural(horas, 'hora', 'horas')}`
  if (minutos > 0) return `Hace ${plural(minutos, 'minuto', 'minutos')}`
  return 'Hace un momento'
}

const fechaCompleta = new Intl.DateTimeFormat('es-CL', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Santiago',
})

export function formatearFechaModeracion(fecha) {
  const valor = new Date(fecha)
  return Number.isFinite(valor.getTime()) ? fechaCompleta.format(valor) : ''
}

/* ------------------------------- Suscripción -------------------------------- */

// Avisa cuando cambian los datos (esta pestaña u otra).
export function suscribirModeracion(onCambio, objetivo = window) {
  const onStorage = (event) => {
    if (event.key === CLAVE_MODERACION || event.key === null) onCambio()
  }
  objetivo.addEventListener('storage', onStorage)
  objetivo.addEventListener(EVENTO_MODERACION, onCambio)

  return () => {
    objetivo.removeEventListener('storage', onStorage)
    objetivo.removeEventListener(EVENTO_MODERACION, onCambio)
  }
}
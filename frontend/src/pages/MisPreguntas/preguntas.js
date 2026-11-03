export const CLAVE_PREGUNTAS = 'laguito-libre.preguntas-demo.v1'
export const EVENTO_PREGUNTAS = 'laguito-libre:preguntas-demo-actualizadas'
export const MAXIMO_RESPUESTA = 1000
export const CLIENTE_DEMO = Object.freeze({ id: 'cliente-sofia', nombre: 'Sofía Torres' })
export const EMPRENDEDOR_DEMO = Object.freeze({ id: 'emprendedor-tierra', nombre: 'Taller Tierra' })

function fechaEjemplo(ahora, dias, hora, minuto) {
  const fecha = new Date(ahora)
  fecha.setUTCDate(fecha.getUTCDate() - dias)
  fecha.setUTCHours(hora, minuto, 0, 0)
  return new Date(Math.min(fecha.getTime(), new Date(ahora).getTime())).toISOString()
}

export function preguntasDeEjemplo(ahora = new Date()) {
  const florero = {
    id: '1', nombre: 'Florero Gres Silvestre', tipo: 'producto',
    emprendedorId: EMPRENDEDOR_DEMO.id, emprendedorNombre: EMPRENDEDOR_DEMO.nombre,
    descripcion: 'Florero de gres con acabado rústico, hecho a mano. Publicación ficticia para probar preguntas.',
  }
  const taller = {
    id: 'taller-ceramica-demo', nombre: 'Taller de cerámica inicial', tipo: 'servicio',
    emprendedorId: EMPRENDEDOR_DEMO.id, emprendedorNombre: EMPRENDEDOR_DEMO.nombre,
    descripcion: 'Taller introductorio de cerámica. Publicación ficticia para probar preguntas.',
  }
  return [
    { id: 'pregunta-1', publicacion: { ...florero }, autor: { ...CLIENTE_DEMO }, texto: '¿Realizan envíos a Valdivia?', creadaEn: fechaEjemplo(ahora, 0, 13, 40), respuesta: null },
    { id: 'pregunta-2', publicacion: { ...taller }, autor: { id: 'cliente-pablo', nombre: 'Pablo Fuentes' }, texto: '¿Necesito experiencia previa?', creadaEn: fechaEjemplo(ahora, 0, 11, 10), respuesta: null },
    { id: 'pregunta-3', publicacion: { ...florero }, autor: { id: 'cliente-maria', nombre: 'María López' }, texto: '¿Se puede usar con agua?', creadaEn: fechaEjemplo(ahora, 1, 18, 20), respuesta: null },
    {
      id: 'pregunta-4', publicacion: { ...florero }, autor: { ...CLIENTE_DEMO },
      texto: '¿Cómo se limpia el florero?', creadaEn: fechaEjemplo(ahora, 3, 15, 0),
      respuesta: { texto: 'Puedes limpiarlo con un paño suave y agua. Evita los productos abrasivos.', creadaEn: fechaEjemplo(ahora, 2, 13, 0), emprendedorId: EMPRENDEDOR_DEMO.id, emprendedorNombre: EMPRENDEDOR_DEMO.nombre },
    },
    {
      id: 'pregunta-5', publicacion: { ...florero }, autor: { ...CLIENTE_DEMO },
      texto: '¿Las piezas son hechas a mano?', creadaEn: fechaEjemplo(ahora, 5, 12, 0),
      respuesta: { texto: 'Sí, cada pieza se hace a mano y puede presentar pequeñas variaciones.', creadaEn: fechaEjemplo(ahora, 4, 14, 0), emprendedorId: EMPRENDEDOR_DEMO.id, emprendedorNombre: EMPRENDEDOR_DEMO.nombre },
    },
  ]
}

function textoValido(valor) {
  return typeof valor === 'string' && Boolean(valor.trim())
}

function validarPreguntas(registros) {
  if (!Array.isArray(registros)) throw new Error('Historial inválido')
  const ids = new Set()
  return registros.map((pregunta) => {
    if (!pregunta || !textoValido(pregunta.id) || ids.has(pregunta.id) || !textoValido(pregunta.texto) || pregunta.texto.length > 1000) {
      throw new Error('Pregunta inválida')
    }
    ids.add(pregunta.id)
    const publicacion = pregunta.publicacion
    const autor = pregunta.autor
    if (!publicacion || !textoValido(publicacion.id) || !textoValido(publicacion.nombre) ||
        !['producto', 'servicio'].includes(publicacion.tipo) || !textoValido(publicacion.emprendedorId) ||
        !textoValido(publicacion.emprendedorNombre) || typeof publicacion.descripcion !== 'string' ||
        !autor || !textoValido(autor.id) || !textoValido(autor.nombre)) throw new Error('Publicación o autor inválidos')
    const creadaEn = typeof pregunta.creadaEn === 'string' ? Date.parse(pregunta.creadaEn) : NaN
    if (!Number.isFinite(creadaEn)) throw new Error('Fecha inválida')
    let respuesta = null
    if (pregunta.respuesta !== null) {
      const item = pregunta.respuesta
      const fechaRespuesta = typeof item?.creadaEn === 'string' ? Date.parse(item.creadaEn) : NaN
      if (!item || !textoValido(item.texto) || item.texto.length > MAXIMO_RESPUESTA ||
          item.emprendedorId !== publicacion.emprendedorId || !textoValido(item.emprendedorNombre) ||
          !Number.isFinite(fechaRespuesta) || fechaRespuesta < creadaEn) throw new Error('Respuesta inválida')
      respuesta = {
        texto: item.texto, creadaEn: new Date(fechaRespuesta).toISOString(),
        emprendedorId: item.emprendedorId, emprendedorNombre: item.emprendedorNombre.trim(),
      }
    }
    return {
      id: pregunta.id,
      publicacion: {
        id: publicacion.id, nombre: publicacion.nombre.trim(), tipo: publicacion.tipo,
        emprendedorId: publicacion.emprendedorId, emprendedorNombre: publicacion.emprendedorNombre.trim(),
        descripcion: publicacion.descripcion,
      },
      autor: { id: autor.id, nombre: autor.nombre.trim() },
      texto: pregunta.texto, creadaEn: new Date(creadaEn).toISOString(), respuesta,
    }
  })
}

export function cargarPreguntas(almacenamiento, ahora = new Date()) {
  try {
    const storage = almacenamiento ?? window.localStorage
    const guardado = storage.getItem(CLAVE_PREGUNTAS)
    if (guardado === null) return { preguntas: preguntasDeEjemplo(ahora), error: '' }
    const datos = JSON.parse(guardado)
    if (datos?.version !== 1) throw new Error('Formato inválido')
    return { preguntas: validarPreguntas(datos.preguntas), error: '' }
  } catch {
    return { preguntas: [], error: 'No se pudieron cargar las preguntas. Intenta nuevamente.' }
  }
}

export function preguntasDelUsuario(preguntas, modo) {
  if (modo === 'cliente') return preguntas.filter((pregunta) => pregunta.autor.id === CLIENTE_DEMO.id)
  if (modo === 'emprendedor') return preguntas.filter((pregunta) => pregunta.publicacion.emprendedorId === EMPRENDEDOR_DEMO.id)
  return []
}

export function estadoPregunta(pregunta) {
  return pregunta.respuesta ? 'respondidas' : 'pendientes'
}

export function contarPreguntas(preguntas) {
  return preguntas.reduce((totales, pregunta) => {
    totales.todas += 1
    totales[estadoPregunta(pregunta)] += 1
    return totales
  }, { todas: 0, pendientes: 0, respondidas: 0 })
}

export function filtrarPreguntas(preguntas, estado = 'todas') {
  return preguntas
    .filter((pregunta) => estado === 'todas' || estadoPregunta(pregunta) === estado)
    .sort((a, b) => Date.parse(b.creadaEn) - Date.parse(a.creadaEn) || a.id.localeCompare(b.id))
}

export function responderPregunta(id, texto, almacenamiento, ahora = new Date()) {
  if (!textoValido(texto)) throw new Error('Escribe una respuesta antes de publicarla.')
  if (texto.length > MAXIMO_RESPUESTA) throw new Error(`La respuesta puede tener hasta ${MAXIMO_RESPUESTA} caracteres.`)
  const datos = cargarPreguntas(almacenamiento, ahora)
  if (datos.error) throw new Error(datos.error)
  const pregunta = datos.preguntas.find((item) => item.id === id)
  if (!pregunta) throw new Error('Esta pregunta ya no está disponible.')
  if (pregunta.publicacion.emprendedorId !== EMPRENDEDOR_DEMO.id) throw new Error('Esta pregunta corresponde a otro emprendedor.')
  if (pregunta.respuesta) throw new Error('Esta pregunta ya fue respondida. Actualiza la pantalla para ver la respuesta.')
  const instante = new Date(ahora).getTime()
  if (!Number.isFinite(instante)) throw new Error('No se pudo determinar la fecha de la respuesta.')
  const respuesta = {
    texto: texto.trim(), creadaEn: new Date(Math.max(instante, Date.parse(pregunta.creadaEn))).toISOString(),
    emprendedorId: EMPRENDEDOR_DEMO.id, emprendedorNombre: EMPRENDEDOR_DEMO.nombre,
  }
  const preguntas = validarPreguntas(datos.preguntas.map((item) => item.id === id ? { ...item, respuesta } : item))
  try {
    const storage = almacenamiento ?? window.localStorage
    storage.setItem(CLAVE_PREGUNTAS, JSON.stringify({ version: 1, preguntas }))
  } catch {
    throw new Error('No se pudo guardar la respuesta. Intenta nuevamente; tu texto sigue en el campo.')
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_PREGUNTAS))
  return { preguntas, error: '' }
}

const fechaCompleta = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Santiago' })
const fechaCorta = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', timeZone: 'America/Santiago' })
const hora = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Santiago' })
const dia = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/Santiago' })

export function formatearFechaPregunta(fecha, corta = false, ahora = new Date()) {
  const valor = new Date(fecha)
  if (!Number.isFinite(valor.getTime())) return ''
  if (!corta) return fechaCompleta.format(valor)
  return dia.format(valor) === dia.format(ahora) ? `Hoy, ${hora.format(valor)}` : `${fechaCorta.format(valor)}, ${hora.format(valor)}`
}

export function suscribirPreguntas(onCambio, objetivo = window) {
  const onStorage = (event) => {
    if (event.key === CLAVE_PREGUNTAS || event.key === null) onCambio()
  }
  objetivo.addEventListener('storage', onStorage)
  objetivo.addEventListener(EVENTO_PREGUNTAS, onCambio)
  return () => {
    objetivo.removeEventListener('storage', onStorage)
    objetivo.removeEventListener(EVENTO_PREGUNTAS, onCambio)
  }
}

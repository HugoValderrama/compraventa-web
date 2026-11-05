// Datos y reglas de la pantalla "Mis reseñas" (/resenas).
// En memoria: se reinicia al recargar la página. Con backend, estas funciones llaman a la API.
// TODO: conectar API  ->  GET /api/reviews/mine   ·   GET /api/reviews/pending   ·   POST /api/reviews

import { aISO } from '../../utils/formatos'

export const MAXIMO_COMENTARIO = 100
export const ETIQUETAS_ESTRELLAS = ['Muy Malo', 'Malo', 'Regular', 'Bueno', 'Muy Bueno']

const RETARDO_MS = 300
const esperar = (ms = RETARDO_MS) => new Promise((resolve) => setTimeout(resolve, ms))

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// '2026-09-15' -> '15 Sep 2026'
export function formatearFechaResena(iso) {
  const [anio, mes, dia] = String(iso).split('-')
  return `${dia} ${MESES[Number(mes) - 1]} ${anio}`
}

// Reseñas que el cliente ya escribió (la más reciente primero).
let resenasMock = [
  {
    id: 'RES-0002',
    titulo: 'Kit de herramientas Pro (Premium)',
    calificacion: 4,
    comentario: 'Excelente calidad, llegó antes de lo esperado. Muy recomendado.',
    fecha: '2026-09-15',
  },
  {
    id: 'RES-0001',
    titulo: 'Servicio de consultoría en TI',
    calificacion: 5,
    comentario: 'Servicio profesional y muy puntual. Superó mis expectativas.',
    fecha: '2024-09-20',
  },
]

// Compras ya entregadas que todavía no tienen reseña.
let pendientesMock = [
  { id: 'PEN-0001', nombre: 'Mouse ergonómico Logitech' },
  { id: 'PEN-0002', nombre: 'Teclado mecánico Keychron K2' },
]

// Valida lo que escribe el cliente; si algo está mal lanza un Error con el mensaje para mostrar.
export function validarResena({ calificacion, comentario }) {
  const texto = String(comentario ?? '').trim()

  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    throw new Error('Selecciona una calificación de 1 a 5 estrellas.')
  }
  if (texto.length > MAXIMO_COMENTARIO) {
    throw new Error(`El comentario puede tener hasta ${MAXIMO_COMENTARIO} caracteres.`)
  }

  return { calificacion, comentario: texto }
}

// READ: reseñas escritas y productos pendientes por calificar
export async function cargarResenas() {
  await esperar()
  return {
    resenas: resenasMock.map((r) => ({ ...r })),
    pendientes: pendientesMock.map((p) => ({ ...p })),
  }
}

// CREATE: publica la reseña de un producto pendiente y lo saca de la lista de pendientes
export async function enviarResena(pendienteId, datos) {
  await esperar()

  const pendiente = pendientesMock.find((p) => p.id === pendienteId)
  if (!pendiente) throw new Error('Ese producto ya no está pendiente por calificar.')

  const limpio = validarResena(datos)
  const siguiente = resenasMock.reduce((max, r) => Math.max(max, Number(r.id.replace('RES-', ''))), 0) + 1
  const nueva = {
    id: `RES-${String(siguiente).padStart(4, '0')}`,
    titulo: pendiente.nombre,
    ...limpio,
    fecha: aISO(new Date()),
  }

  resenasMock = [nueva, ...resenasMock]
  pendientesMock = pendientesMock.filter((p) => p.id !== pendienteId)

  return { ...nueva }
}
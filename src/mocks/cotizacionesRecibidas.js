export const ESTADOS = {
  PENDIENTE: 'Pendiente de respuesta',
  RESPONDIDA: 'Respondida',
  ACEPTADA: 'Aceptada',
  EXPIRADA: 'Expirada',
  CANCELADA: 'Cancelada',
}

const SOLICITUDES_EJEMPLO = [
  {
    id: '1',
    codigo: 'C031',
    fecha: '2026-10-15T10:30:00',
    estado: ESTADOS.PENDIENTE,
    cliente: { nombre: 'Lucía Pérez' },
    titulo: 'Cerámica personalizada',
    mensaje:
      'Hola, necesito 12 tazas de cerámica con el logo de mi cafetería. ¿Cuánto tomaría y cuál sería el valor?',
    items: [
      { nombre: 'Taza de cerámica personalizada', cantidad: 12, ubicacion: 'Puerto Montt' },
    ],
    respuesta: null,
  },
  {
    id: '2',
    codigo: 'C030',
    fecha: '2026-10-14T16:45:00',
    estado: ESTADOS.PENDIENTE,
    cliente: { nombre: 'Pablo Fuentes' },
    titulo: 'Taller para 4 personas',
    mensaje:
      'Buen día, quisiera reservar un taller de cerámica para 4 personas durante un fin de semana.',
    items: [
      { nombre: 'Taller de cerámica (grupo)', cantidad: 4, ubicacion: 'Osorno' },
    ],
    respuesta: null,
  },
  {
    id: '3',
    codigo: 'C029',
    fecha: '2026-10-10T09:15:00',
    estado: ESTADOS.RESPONDIDA,
    cliente: { nombre: 'Camila Soto' },
    titulo: 'Set de platos artesanales',
    mensaje: 'Me interesa un set de 6 platos con esmalte azul. ¿Tienen disponibilidad?',
    items: [{ nombre: 'Plato artesanal esmaltado', cantidad: 6, ubicacion: 'Puerto Varas' }],
    respuesta: {
      precioTotal: 54000,
      entregaEstimada: '2026-11-05',
      envio: 4500,
      validaHasta: '2026-10-31',
      detalle: 'Set de 6 platos esmaltados a mano. Incluye embalaje protegido.',
    },
  },
  {
    id: '4',
    codigo: 'C028',
    fecha: '2026-10-05T12:00:00',
    estado: ESTADOS.ACEPTADA,
    cliente: { nombre: 'Diego Navarro' },
    titulo: 'Jarrones decorativos',
    mensaje: 'Necesito 2 jarrones medianos para decoración de un local.',
    items: [{ nombre: 'Jarrón mediano', cantidad: 2, ubicacion: 'Frutillar' }],
    respuesta: {
      precioTotal: 38000,
      entregaEstimada: '2026-10-28',
      envio: 3000,
      validaHasta: '2026-10-20',
      detalle: 'Dos jarrones medianos en color terracota.',
    },
  },
  {
    id: '5',
    codigo: 'C027',
    fecha: '2026-09-20T18:20:00',
    estado: ESTADOS.EXPIRADA,
    cliente: { nombre: 'Valentina Rojas' },
    titulo: 'Macetas para evento',
    mensaje: 'Busco 20 macetas pequeñas para un evento corporativo.',
    items: [{ nombre: 'Maceta pequeña', cantidad: 20, ubicacion: 'Puerto Montt' }],
    respuesta: null,
  },
]

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const copiar = (datos) => JSON.parse(JSON.stringify(datos))

let baseDatos = copiar(SOLICITUDES_EJEMPLO)

// Simula la API. Reemplazar por fetch cuando el backend esté listo.
export async function obtenerSolicitudes() {
  // TODO: conectar API
  await delay(500)
  return copiar(baseDatos)
}

export async function responderSolicitud(id, respuesta) {
  console.log('[CotizacionesRecibidas] Responder solicitud:', { id, respuesta })
  // TODO: conectar API
  await delay(600)
  const solicitud = baseDatos.find((s) => s.id === id)
  if (!solicitud) throw new Error('Solicitud no encontrada.')
  if (solicitud.estado !== ESTADOS.PENDIENTE) {
    throw new Error('Esta solicitud ya no admite respuesta.')
  }
  solicitud.estado = ESTADOS.RESPONDIDA
  solicitud.respuesta = { ...respuesta }
  return copiar(solicitud)
}
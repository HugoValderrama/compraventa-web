// Cada función async imita una llamada al backend (.NET).

const LATENCIA_MS = 400

export const CATEGORIAS = [
  'Talleres y clases',
  'Cerámica a medida',
  'Esmaltado y cocción',
  'Reparación y restauración',
  'Otros',
]

export const MODALIDADES = ['Presencial', 'Online', 'Mixto']

export const UNIDADES_COBRO = [
  { valor: 'persona', etiqueta: 'Por persona' },
  { valor: 'hora', etiqueta: 'Por hora' },
  { valor: 'servicio', etiqueta: 'Por servicio' },
]

export const RESTRICCIONES_EDAD = ['Ninguna', 'Solo mayores de 18 años']

let siguienteId = 4

// Fechas en formato dd-mm-aaaa. "foto" guarda la imagen como texto (data URL).
let servicios = [
  {
    id: '1',
    nombre: 'Taller de cerámica inicial',
    categoria: 'Talleres y clases',
    descripcion:
      'Aprende modelado a mano y crea una pieza de gres. Incluye arcilla, herramientas, esmalte y dos cocciones.',
    modalidad: 'Presencial',
    ubicacion: 'Taller Tierra, Valparaíso',
    duracion: '2 horas',
    cupos: 6,
    precio: 35000,
    unidadCobro: 'persona',
    estado: 'Activo',
    restriccionEdad: 'Ninguna',
    diasHorario: 'Sábados · 10:00 a 12:00',
    proximaFecha: '17-10-2026',
    permiteCotizacion: true,
    foto: '',
    condiciones: 'Reserva con 50%. Cambios hasta 48 h antes.',
  },
  {
    id: '2',
    nombre: 'Cerámica personalizada',
    categoria: 'Cerámica a medida',
    descripcion:
      'Piezas únicas hechas a pedido, según tus medidas, colores y diseño.',
    modalidad: 'Mixto',
    ubicacion: 'Valparaíso y envíos a Chile',
    duracion: '10 días',
    cupos: 5,
    precio: 25000,
    unidadCobro: 'servicio',
    estado: 'Activo',
    restriccionEdad: 'Ninguna',
    diasHorario: 'Entrega en 10 días · Requiere cotización',
    proximaFecha: '',
    permiteCotizacion: true,
    foto: '',
    condiciones: 'Anticipo del 50% al aprobar la cotización.',
  },
  {
    id: '3',
    nombre: 'Esmaltado de piezas',
    categoria: 'Esmaltado y cocción',
    descripcion:
      'Esmaltado y cocción de piezas que ya tienes, con distintos acabados.',
    modalidad: 'Presencial',
    ubicacion: 'Taller Tierra',
    duracion: '1 semana',
    cupos: 4,
    precio: 12000,
    unidadCobro: 'servicio',
    estado: 'Pausado',
    restriccionEdad: 'Ninguna',
    diasHorario: 'Sin disponibilidad por el momento',
    proximaFecha: '',
    permiteCotizacion: false,
    foto: '',
    condiciones: 'Pago al recibir las piezas.',
  },
]

// Ejecuta la operación tras una pequeña espera, como lo haría una petición real.
const simular = (operacion) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(operacion())
      } catch (err) {
        reject(err)
      }
    }, LATENCIA_MS)
  })

const buscar = (id) => {
  const servicio = servicios.find((s) => s.id === id)
  if (!servicio) throw new Error('Servicio no encontrado.')
  return servicio
}

export async function obtenerServicios() {
  // TODO: conectar API (GET /api/servicios)
  return simular(() => servicios.map((s) => ({ ...s })))
}

export async function obtenerServicio(id) {
  // TODO: conectar API (GET /api/servicios/:id)
  return simular(() => ({ ...buscar(id) }))
}

export async function crearServicio(datos) {
  // TODO: conectar API (POST /api/servicios)
  return simular(() => {
    const nuevo = { ...datos, id: String(siguienteId++), estado: 'Activo' }
    servicios = [nuevo, ...servicios]
    return { ...nuevo }
  })
}

export async function actualizarServicio(id, datos) {
  // TODO: conectar API (PUT /api/servicios/:id)
  return simular(() => {
    const actual = buscar(id)
    const actualizado = { ...actual, ...datos, id: actual.id, estado: actual.estado }
    servicios = servicios.map((s) => (s.id === id ? actualizado : s))
    return { ...actualizado }
  })
}

export async function cambiarEstadoServicio(id, estado) {
  // TODO: conectar API (PATCH /api/servicios/:id/estado)
  return simular(() => {
    const actualizado = { ...buscar(id), estado }
    servicios = servicios.map((s) => (s.id === id ? actualizado : s))
    return { ...actualizado }
  })
}
// Cada función async imita una llamada al backend (.NET).

const LATENCIA_MS = 400

export const MODALIDADES = ['Presencial', 'Online', 'A domicilio', 'A pedido']

export const UNIDADES_COBRO = [
  { valor: 'persona', etiqueta: 'Por persona' },
  { valor: 'pedido', etiqueta: 'A pedido (precio desde)' },
]

export const RESTRICCIONES_EDAD = [
  'Todas las edades',
  'Mayores de 12 años',
  'Mayores de 18 años',
]

let siguienteId = 4

let servicios = [
  {
    id: '1',
    nombre: 'Taller de cerámica inicial',
    categoria: 'Talleres',
    descripcion: 'Sábados · 6 cupos por sesión',
    modalidad: 'Presencial',
    ubicacion: 'Valparaíso',
    duracion: '2 horas',
    cupos: 6,
    precio: 35000,
    unidadCobro: 'persona',
    estado: 'Activo',
    restriccionEdad: 'Mayores de 12 años',
  },
  {
    id: '2',
    nombre: 'Cerámica personalizada',
    categoria: 'Cerámica a medida',
    descripcion: 'Entrega en 10 días · Requiere cotización',
    modalidad: 'A pedido',
    ubicacion: 'Valparaíso y envíos a Chile',
    duracion: '',
    cupos: null,
    precio: 25000,
    unidadCobro: 'pedido',
    estado: 'Activo',
    restriccionEdad: 'Todas las edades',
  },
  {
    id: '3',
    nombre: 'Esmaltado de piezas',
    categoria: 'Esmaltado',
    descripcion: 'Sin disponibilidad por el momento',
    modalidad: 'Presencial',
    ubicacion: 'Taller Tierra',
    duracion: '',
    cupos: null,
    precio: 12000,
    unidadCobro: 'pedido',
    estado: 'Pausado',
    restriccionEdad: 'Todas las edades',
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
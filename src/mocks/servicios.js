// Datos de ejemplo y API simulada para "Mis servicios".
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

let siguienteId = 5

// Fechas guardadas como aaaa-mm-dd (se muestran con formatearFecha).
// "foto" guarda la imagen como texto (data URL).
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
    proximaFecha: '2026-10-17',
    permiteCotizacion: true,
    foto: '',
    condiciones: 'Reserva con 50%. Cambios hasta 48 h antes.',
    incluye: 'Arcilla, herramientas, esmalte y dos cocciones',
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
    incluye: 'Diseño, materiales y cocción',
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
    incluye: 'Esmalte y cocción',
  },
]

// Proveedor por defecto de los servicios propios (Taller Tierra).
const PROVEEDOR_PROPIO = { nombre: 'Taller Tierra', calificacion: null, totalResenas: 0 }

// Servicios de otros proveedores: solo se ven en la vista pública (detalle).
const serviciosExternos = [
  {
    id: '4',
    nombre: 'Curso de Pilotaje de Drones',
    categoria: 'Tecnología',
    descripcion:
      'Curso práctico de pilotaje: normativa básica, maniobras y vuelo en terreno con instructor.',
    modalidad: 'Presencial',
    ubicacion: 'Santiago Centro',
    duracion: '2 horas',
    cupos: 8,
    precio: 45000,
    unidadCobro: 'hora',
    estado: 'Activo',
    restriccionEdad: 'Solo mayores de 18 años',
    diasHorario: 'Sábados · 09:00 a 11:00',
    proximaFecha: '2026-10-24',
    permiteCotizacion: true,
    foto: '',
    condiciones: 'Reserva con 50%. Cambios hasta 48 h antes.',
    incluye: 'Materiales y drone',
    proveedor: { nombre: 'Academia Drone-X', calificacion: 4.9, totalResenas: 28 },
    preguntas: [
      {
        id: 'p1',
        pregunta: '¿El curso incluye préstamo de equipo para practicar?',
        respuesta:
          'Sí, contamos con drones de última generación para todas las clases prácticas.',
        autor: 'Carlos M.',
      },
      {
        id: 'p2',
        pregunta: '¿Se entrega certificación al finalizar?',
        respuesta:
          'Entregamos un diploma de participación y preparación para examen DGAC.',
        autor: 'Valentina P.',
      },
    ],
    resenas: [
      {
        id: 'r1',
        autor: 'Matías R.',
        estrellas: 5,
        comentario: 'Muy buen instructor, aprendí a volar con seguridad desde la primera clase.',
        fecha: '2026-10-02',
      },
      {
        id: 'r2',
        autor: 'Camila S.',
        estrellas: 5,
        comentario: 'Las clases prácticas son lo mejor. Totalmente recomendado.',
        fecha: '2026-09-25',
      },
      {
        id: 'r3',
        autor: 'Felipe A.',
        estrellas: 4,
        comentario: 'Buen contenido, me habría gustado más tiempo de vuelo.',
        fecha: '2026-09-18',
      },
    ],
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
  return simular(() => {
    const servicio = [...servicios, ...serviciosExternos].find((s) => s.id === id)
    if (!servicio) throw new Error('Servicio no encontrado.')

    return {
      incluye: '',
      proveedor: PROVEEDOR_PROPIO,
      preguntas: [],
      resenas: [],
      ...servicio,
    }
  })
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

export async function eliminarServicio(id) {
  // TODO: conectar API (DELETE /api/servicios/:id)
  return simular(() => {
    buscar(id)
    servicios = servicios.filter((s) => s.id !== id)
    return { id }
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

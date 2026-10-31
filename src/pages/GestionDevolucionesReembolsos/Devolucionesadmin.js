// Solicitudes de devolución y reembolso de TODA la plataforma (vista del administrador).
// Datos de ejemplo: 27 casos (6 abiertas, 18 reembolsadas, 3 rechazadas), como en el prototipo.

export const ESTADOS_DEVOLUCION = {
  EN_REVISION: 'En revisión',
  APROBADA: 'Aprobada',
  REEMBOLSADA: 'Reembolsada',
  RECHAZADA: 'Rechazada',
}

// En revisión -> Aprobada o Rechazada. Aprobada -> Reembolsada.
const TRANSICIONES = {
  aprobar: { desde: ESTADOS_DEVOLUCION.EN_REVISION, hasta: ESTADOS_DEVOLUCION.APROBADA },
  rechazar: { desde: ESTADOS_DEVOLUCION.EN_REVISION, hasta: ESTADOS_DEVOLUCION.RECHAZADA },
  reembolsar: { desde: ESTADOS_DEVOLUCION.APROBADA, hasta: ESTADOS_DEVOLUCION.REEMBOLSADA },
}

const CLIENTES = [
  'Camila Rojas',
  'Luis Vera',
  'Elena Díaz',
  'Diego Soto',
  'Ana Muñoz',
  'Rodrigo Bravo',
  'Javiera Núñez',
  'Matías Contreras',
]

const OFERTAS = [
  { vendedor: 'Taller Tierra', nombre: 'Florero Gres Silvestre', precio: 19990 },
  { vendedor: 'Tejidos Luna', nombre: 'Manta de lana natural', precio: 38000 },
  { vendedor: 'Taller Tierra', nombre: 'Set de tazas', precio: 21000 },
  { vendedor: 'Cestería Austral', nombre: 'Canasto de mimbre', precio: 27500 },
  { vendedor: 'BiciBarrio', nombre: 'Servicio de mantención de bicicleta', precio: 18000, servicio: true },
  { vendedor: 'Manos del Sur', nombre: 'Clase de torno alfarero', precio: 32000, servicio: true },
]

const MOTIVOS_PRODUCTO = [
  { corto: 'Producto dañado', titulo: 'Producto recibido dañado', comentario: '“El producto llegó dañado. Solicito la devolución del total pagado.”' },
  { corto: 'No corresponde', titulo: 'El producto no corresponde a lo publicado', comentario: '“Lo que recibí no coincide con la publicación.”' },
  { corto: 'No llegó', titulo: 'El producto nunca llegó', comentario: '“Pasó la fecha estimada y el pedido no ha llegado.”' },
]

const MOTIVO_SERVICIO = {
  corto: 'Servicio cancelado',
  titulo: 'Servicio cancelado por el vendedor',
  comentario: '“El servicio fue cancelado y no se realizó.”',
}

// Casos por estado (el número es el de "DEV-0nn")
const EN_REVISION = [24, 22, 20, 17]
const APROBADAS = [23, 19]
const RECHAZADAS = [26, 21, 12]
const TOTAL = 27

function estadoDe(n) {
  if (EN_REVISION.includes(n)) return ESTADOS_DEVOLUCION.EN_REVISION
  if (APROBADAS.includes(n)) return ESTADOS_DEVOLUCION.APROBADA
  if (RECHAZADAS.includes(n)) return ESTADOS_DEVOLUCION.RECHAZADA
  return ESTADOS_DEVOLUCION.REEMBOLSADA
}

const NOTA_POR_ESTADO = {
  [ESTADOS_DEVOLUCION.EN_REVISION]: '',
  [ESTADOS_DEVOLUCION.APROBADA]: 'Aprobado. Pendiente de pago.',
  [ESTADOS_DEVOLUCION.REEMBOLSADA]: 'Reembolso pagado al medio de pago original.',
  [ESTADOS_DEVOLUCION.RECHAZADA]: 'No hay respaldo suficiente para el reclamo.',
}

const caso = (n, datos) => ({
  id: `DEV-${String(n).padStart(3, '0')}`,
  fecha: new Date(2026, 9, 14 + (n - 24)).toISOString(),
  estado: estadoDe(n),
  destino: 'medio de pago original',
  plazo: '5–10 días hábiles',
  ...datos,
})

// Los tres primeros son los del prototipo
const DEL_PROTOTIPO = [
  caso(24, {
    pedido: '1032',
    cliente: 'Camila Rojas',
    vendedor: 'Taller Tierra',
    detalle: '1 × Florero Gres Silvestre · M',
    motivo: 'Producto dañado',
    titulo: 'Producto recibido dañado',
    comentario: '“El florero llegó con una grieta. Solicito la devolución del total pagado.”',
    monto: 23490,
    fotos: 2,
    respuestaVendedor: true,
    nota: 'Daño acreditado. Devolución sin costo.',
  }),
  caso(23, {
    pedido: '1028',
    cliente: 'Luis Vera',
    vendedor: 'Tejidos Luna',
    detalle: '1 × Manta de lana natural',
    motivo: 'No corresponde',
    titulo: 'El producto no corresponde a lo publicado',
    comentario: '“El color y el tamaño no son los de la publicación.”',
    monto: 38000,
    fotos: 1,
    respuestaVendedor: true,
    nota: NOTA_POR_ESTADO[ESTADOS_DEVOLUCION.APROBADA],
  }),
  caso(22, {
    pedido: '1021',
    cliente: 'Elena Díaz',
    vendedor: 'BiciBarrio',
    detalle: 'Servicio de mantención de bicicleta',
    motivo: 'Servicio cancelado',
    titulo: 'Servicio cancelado por el vendedor',
    comentario: '“Cancelaron el servicio el mismo día y no me devolvieron el pago.”',
    monto: 18000,
    fotos: 0,
    respuestaVendedor: false,
    nota: '',
  }),
]

const GENERADOS = Array.from({ length: TOTAL }, (_, i) => TOTAL - i)
  .filter((n) => ![24, 23, 22].includes(n))
  .map((n) => {
    const oferta = OFERTAS[n % OFERTAS.length]
    const cantidad = oferta.servicio ? 1 : (n % 3) + 1
    const motivo = oferta.servicio ? MOTIVO_SERVICIO : MOTIVOS_PRODUCTO[n % MOTIVOS_PRODUCTO.length]
    const estado = estadoDe(n)

    return caso(n, {
      pedido: String(1000 + n),
      cliente: CLIENTES[(n * 3) % CLIENTES.length],
      vendedor: oferta.vendedor,
      detalle: oferta.servicio ? oferta.nombre : `${cantidad} × ${oferta.nombre}`,
      motivo: motivo.corto,
      titulo: motivo.titulo,
      comentario: motivo.comentario,
      monto: oferta.precio * cantidad,
      fotos: oferta.servicio ? 0 : n % 3,
      respuestaVendedor: n % 2 === 0,
      nota: NOTA_POR_ESTADO[estado],
    })
  })

const EJEMPLO = [...DEL_PROTOTIPO, ...GENERADOS].sort((a, b) => (a.id < b.id ? 1 : -1))

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const copiar = (datos) => JSON.parse(JSON.stringify(datos))

let baseDatos = copiar(EJEMPLO)

// Simula la API. Reemplazar por fetch cuando el backend esté listo.
export async function listarDevolucionesAdmin() {
  // TODO: conectar API (GET de todas las solicitudes de devolución, solo administrador)
  await delay(500)
  return copiar(baseDatos)
}

// accion: 'aprobar' | 'rechazar' | 'reembolsar'
export async function resolverDevolucionAdmin(id, accion, nota) {
  console.log('[Devoluciones] Resolver:', { id, accion, nota })
  // TODO: conectar API (PATCH del estado del caso con la nota interna)
  await delay(500)

  const caso = baseDatos.find((c) => c.id === id)
  const paso = TRANSICIONES[accion]
  if (!caso) throw new Error('Caso no encontrado.')
  if (!paso || caso.estado !== paso.desde) throw new Error('Este cambio de estado no está permitido.')

  caso.estado = paso.hasta
  caso.nota = nota
  return copiar(caso)
}
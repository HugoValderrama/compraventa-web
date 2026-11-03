// Pedidos de TODA la plataforma (vista del administrador).
// Datos de ejemplo: 248 pedidos, para que los contadores coincidan con el prototipo.

export const ESTADOS_ADMIN = {
  POR_PREPARAR: 'Por preparar',
  CONFIRMADO: 'Confirmado',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

const CLIENTES = [
  'Camila Rojas',
  'Diego Soto',
  'Ana Muñoz',
  'Rodrigo Bravo',
  'Javiera Núñez',
  'Matías Contreras',
  'Fernanda Lagos',
  'Tomás Vera',
  'Constanza Araya',
  'Felipe Salinas',
]

const COMUNAS = ['Valdivia', 'Santiago', 'Puerto Montt', 'Osorno', 'Castro', 'Frutillar', 'Temuco', 'Puerto Varas']

const OFERTAS = [
  { emprendedor: 'Taller Tierra', tipo: 'Producto', nombre: 'Florero Gres Silvestre', precio: 19990 },
  { emprendedor: 'Manos del Sur', tipo: 'Servicio', nombre: 'Taller de cerámica inicial', precio: 45000 },
  { emprendedor: 'Tejidos Luna', tipo: 'Producto', nombre: 'Manta de lana natural', precio: 38000 },
  { emprendedor: 'Taller Tierra', tipo: 'Producto', nombre: 'Set de tazas', precio: 21000 },
  { emprendedor: 'Cestería Austral', tipo: 'Producto', nombre: 'Canasto de mimbre', precio: 27500 },
  { emprendedor: 'Manos del Sur', tipo: 'Servicio', nombre: 'Clase de torno alfarero', precio: 32000 },
]

const ENVIO = [3000, 3500, 4000, 4500]

const pedido = ({ id, fecha, cliente, oferta, cantidad = 1, comuna, estado, pagado = true, envio = 0 }) => {
  const servicio = oferta.tipo === 'Servicio'
  const subtotal = oferta.precio * cantidad
  return {
    id: String(id),
    fecha: fecha.toISOString(),
    cliente,
    emprendedor: oferta.emprendedor,
    tipo: oferta.tipo,
    detalle: servicio ? oferta.nombre : `${cantidad} × ${oferta.nombre}`,
    comuna,
    subtotal,
    envio,
    total: subtotal + envio,
    medioPago: Number(id) % 2 ? 'Transferencia' : 'Tarjeta',
    pagado,
    estado,
  }
}

// Los tres primeros son los del prototipo
const PRIMEROS = [
  pedido({
    id: 1048,
    fecha: new Date(2026, 9, 15, 14, 20),
    cliente: 'Camila Rojas',
    oferta: OFERTAS[0],
    comuna: 'Valdivia',
    estado: ESTADOS_ADMIN.POR_PREPARAR,
    envio: 3500,
  }),
  pedido({
    id: 1047,
    fecha: new Date(2026, 9, 15, 11, 5),
    cliente: 'Diego Soto',
    oferta: OFERTAS[1],
    comuna: 'Valdivia',
    estado: ESTADOS_ADMIN.CONFIRMADO,
  }),
  pedido({
    id: 1046,
    fecha: new Date(2026, 9, 14, 16, 40),
    cliente: 'Ana Muñoz',
    oferta: OFERTAS[2],
    comuna: 'Santiago',
    estado: ESTADOS_ADMIN.ENVIADO,
  }),
]

// Resto: 7 por preparar, 38 en curso, 6 cancelados y 194 entregados
const CANCELADOS = [60, 95, 130, 165, 200, 235]
const SIN_PAGAR = [2, 5] // por preparar que aún no pagan

function estadoGenerado(k) {
  if (CANCELADOS.includes(k)) return ESTADOS_ADMIN.CANCELADO
  if (k < 7) return ESTADOS_ADMIN.POR_PREPARAR
  if (k < 45) return k % 2 ? ESTADOS_ADMIN.CONFIRMADO : ESTADOS_ADMIN.ENVIADO
  return ESTADOS_ADMIN.ENTREGADO
}

const GENERADOS = Array.from({ length: 245 }, (_, k) => {
  const oferta = OFERTAS[(k * 5 + 1) % OFERTAS.length]
  const servicio = oferta.tipo === 'Servicio'
  const estado = estadoGenerado(k)
  const fecha = new Date(2026, 9, 14, 16, 40)
  fecha.setMinutes(fecha.getMinutes() - (k + 1) * 78)

  return pedido({
    id: 1045 - k,
    fecha,
    cliente: CLIENTES[(k * 3 + 2) % CLIENTES.length],
    oferta,
    cantidad: servicio ? 1 : (k % 3) + 1,
    comuna: COMUNAS[(k * 7 + 3) % COMUNAS.length],
    estado,
    pagado: estado !== ESTADOS_ADMIN.CANCELADO && !SIN_PAGAR.includes(k),
    envio: servicio ? 0 : ENVIO[k % ENVIO.length],
  })
})

const PEDIDOS_EJEMPLO = [...PRIMEROS, ...GENERADOS]

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Simula la API. Reemplazar por fetch cuando el backend esté listo.
export async function listarPedidosAdmin() {
  // TODO: conectar API (GET de todos los pedidos de la plataforma, solo administrador)
  await delay(500)
  return PEDIDOS_EJEMPLO.map((p) => ({ ...p }))
}
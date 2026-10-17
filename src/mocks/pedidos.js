export const ESTADOS_PEDIDO = {
  RECIBIDO: 'Recibido',
  PREPARACION: 'En preparación',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
}

export const TRANSPORTISTAS = ['Chilexpress', 'Starken', 'Correos de Chile']

const SIGUIENTE = {
  Recibido: ['En preparación'],
  'En preparación': ['Enviado'],
  Enviado: ['Entregado'],
  Entregado: [],
}

const PEDIDOS_EJEMPLO = [
  {
    id: '1048',
    fecha: '2026-10-15T14:20:00',
    estado: ESTADOS_PEDIDO.RECIBIDO,
    cliente: { nombre: 'Camila Rojas', telefono: '+56 9 7842 1630' },
    items: [
      {
        id: 'i1',
        nombre: 'Florero Gres Silvestre',
        imagen: '', // TODO: conectar API (URL de la imagen)
        cantidad: 1,
        precioUnitario: 19990,
        variante: 'Tamaño M',
        sku: 'TT-FGS-M',
      },
    ],
    valorNeto: 16798,
    iva: 3192,
    total: 23490,
    envio: 3500,
    pagado: true,
    medioPago: 'Tarjeta',
    tipoEntrega: 'Despacho a domicilio',
    direccionEntrega: {
      nombre: 'Camila Rojas',
      telefono: '+56 9 7842 1630',
      direccion: 'Av. Alemania 640, depto. 302 Valdivia, Región de Los Ríos',
    },
    notaCliente: 'Por favor, proteger bien el florero.',
    despacho: {
      empresaTransporte: null,
      numeroSeguimiento: null,
      fechaEstimada: '2026-10-17',
      ultimaActualizacion: null,
      ubicacionActual: null,
    },
  },
  {
    id: '1047',
    fecha: '2026-10-14T11:05:00',
    estado: ESTADOS_PEDIDO.PREPARACION,
    cliente: { nombre: 'Andrés Muñoz', telefono: '+56 9 6123 4455' },
    items: [
      {
        id: 'i2',
        nombre: 'Set de platos artesanales',
        imagen: '',
        cantidad: 2,
        precioUnitario: 27000,
        variante: 'Esmalte azul',
        sku: 'TT-SPA-AZ',
      },
    ],
    valorNeto: 45378,
    iva: 8622,
    total: 58000,
    envio: 4000,
    pagado: true,
    medioPago: 'Transferencia',
    tipoEntrega: 'Despacho a domicilio',
    direccionEntrega: {
      nombre: 'Andrés Muñoz',
      telefono: '+56 9 6123 4455',
      direccion: 'Los Notros 1250, Puerto Montt, Región de Los Lagos',
    },
    notaCliente: '',
    despacho: {
      empresaTransporte: null,
      numeroSeguimiento: null,
      fechaEstimada: '2026-10-18',
      ultimaActualizacion: null,
      ubicacionActual: null,
    },
  },
  {
    id: '1046',
    fecha: '2026-10-12T09:40:00',
    estado: ESTADOS_PEDIDO.ENVIADO,
    cliente: { nombre: 'Paula Herrera', telefono: '+56 9 5544 3322' },
    items: [
      {
        id: 'i3',
        nombre: 'Tejidos Luna',
        imagen: '',
        cantidad: 1,
        precioUnitario: 32000,
        variante: 'Color natural',
        sku: 'TT-TL-NAT',
      },
    ],
    valorNeto: 26891,
    iva: 5109,
    total: 35000,
    envio: 3000,
    pagado: true,
    medioPago: 'Tarjeta',
    tipoEntrega: 'Despacho a domicilio',
    direccionEntrega: {
      nombre: 'Paula Herrera',
      telefono: '+56 9 5544 3322',
      direccion: 'Pedro Montt 320, Osorno, Región de Los Lagos',
    },
    notaCliente: '',
    despacho: {
      empresaTransporte: 'Starken',
      numeroSeguimiento: 'STK-884201',
      fechaEstimada: '2026-10-15',
      ultimaActualizacion: '2026-10-14T16:30:00',
      ubicacionActual: 'Centro de distribución Osorno',
    },
  },
]

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const copiar = (datos) => JSON.parse(JSON.stringify(datos))

let baseDatos = copiar(PEDIDOS_EJEMPLO)

function buscar(id) {
  const pedido = baseDatos.find((p) => p.id === id)
  if (!pedido) throw new Error('Pedido no encontrado.')
  return pedido
}

function validarCambio(pedido, nuevoEstado) {
  if (!SIGUIENTE[pedido.estado].includes(nuevoEstado)) {
    throw new Error('Este cambio de estado no está permitido.')
  }
}

// Simula la API. Reemplazar por fetch cuando el backend esté listo.
export async function listarPedidos() {
  // TODO: conectar API
  await delay(400)
  return copiar(baseDatos)
}

export async function obtenerPedido(id) {
  // TODO: conectar API
  await delay(400)
  const pedido = baseDatos.find((p) => p.id === id)
  return pedido ? copiar(pedido) : null
}

export async function comenzarPreparacion(id) {
  // TODO: conectar API
  await delay(400)
  const pedido = buscar(id)
  validarCambio(pedido, ESTADOS_PEDIDO.PREPARACION)
  pedido.estado = ESTADOS_PEDIDO.PREPARACION
  return copiar(pedido)
}

export async function marcarEnviado(id, { empresaTransporte, numeroSeguimiento }) {
  // TODO: conectar API
  await delay(600)
  const pedido = buscar(id)
  validarCambio(pedido, ESTADOS_PEDIDO.ENVIADO)
  pedido.estado = ESTADOS_PEDIDO.ENVIADO
  pedido.despacho = {
    ...pedido.despacho,
    empresaTransporte,
    numeroSeguimiento,
    ultimaActualizacion: new Date().toISOString(),
  }
  return copiar(pedido)
}

export async function solicitarCancelacion(id) {
  // TODO: conectar API
  await delay(500)
  const pedido = buscar(id)
  if ([ESTADOS_PEDIDO.ENVIADO, ESTADOS_PEDIDO.ENTREGADO].includes(pedido.estado)) {
    throw new Error('Un pedido enviado no se puede cancelar.')
  }
  return null
}
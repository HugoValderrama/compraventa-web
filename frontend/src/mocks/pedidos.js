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

// TODO: conectar API (URL de la imagen del producto)
const item = (id, nombre, variante, sku, cantidad, precioUnitario) => ({
  id,
  nombre,
  imagen: '',
  cantidad,
  precioUnitario,
  variante,
  sku,
})

function crearPedido({
  id,
  fecha,
  estado,
  cliente,
  items,
  envio = 0,
  medioPago,
  tipoEntrega = 'Despacho a domicilio',
  direccion,
  notaCliente = '',
  despacho = {},
}) {
  const total = items.reduce((suma, i) => suma + i.cantidad * i.precioUnitario, 0) + envio
  const valorNeto = Math.round(total / 1.19)

  return {
    id,
    fecha,
    estado,
    cliente,
    items,
    valorNeto,
    iva: total - valorNeto,
    total,
    envio,
    pagado: true,
    medioPago,
    tipoEntrega,
    direccionEntrega: {
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      direccion,
    },
    notaCliente,
    despacho: {
      empresaTransporte: null,
      numeroSeguimiento: null,
      fechaEstimada: null,
      ultimaActualizacion: null,
      ubicacionActual: null,
      ...despacho,
    },
  }
}

// 2 por preparar, 3 enviados, 4 entregados
const PEDIDOS_EJEMPLO = [
  crearPedido({
    id: '1048',
    fecha: '2026-10-15T14:20:00',
    estado: ESTADOS_PEDIDO.RECIBIDO,
    cliente: { nombre: 'Camila Rojas', telefono: '+56 9 7842 1630' },
    items: [item('i1', 'Florero Gres Silvestre', 'Tamaño M', 'TT-FGS-M', 1, 19990)],
    envio: 3500,
    medioPago: 'Tarjeta',
    direccion: 'Av. Alemania 640, depto. 302, Valdivia, Región de Los Ríos',
    notaCliente: 'Por favor, proteger bien el florero.',
    despacho: { fechaEstimada: '2026-10-17' },
  }),
  crearPedido({
    id: '1047',
    fecha: '2026-10-15T11:05:00',
    estado: ESTADOS_PEDIDO.PREPARACION,
    cliente: { nombre: 'Diego Soto', telefono: '+56 9 6123 4455' },
    items: [item('i2', 'Florero Gres Silvestre', 'Tamaño M', 'TT-FGS-M', 2, 19990)],
    medioPago: 'Transferencia',
    tipoEntrega: 'Retiro en taller',
    direccion: 'Retiro en taller · Taller Tierra',
    despacho: { fechaEstimada: '2026-10-17' },
  }),
  crearPedido({
    id: '1046',
    fecha: '2026-10-14T16:40:00',
    estado: ESTADOS_PEDIDO.ENVIADO,
    cliente: { nombre: 'Ana Muñoz', telefono: '+56 9 5544 3322' },
    items: [item('i3', 'Taza de gres natural', 'Color natural', 'TT-TGN-NAT', 1, 15490)],
    envio: 3500,
    medioPago: 'Tarjeta',
    direccion: 'Av. Providencia 1208, depto. 45, Santiago, Región Metropolitana',
    despacho: {
      empresaTransporte: 'Chilexpress',
      numeroSeguimiento: 'CHX-558120',
      fechaEstimada: '2026-10-17',
      ultimaActualizacion: '2026-10-15T09:10:00',
      ubicacionActual: 'Centro de distribución Santiago',
    },
  }),
  crearPedido({
    id: '1045',
    fecha: '2026-10-13T10:15:00',
    estado: ESTADOS_PEDIDO.ENVIADO,
    cliente: { nombre: 'Rodrigo Bravo', telefono: '+56 9 4billion'.replace('billion', '4455 1290') },
    items: [item('i4', 'Plato hondo esmaltado', 'Esmalte azul', 'TT-PHE-AZ', 4, 6500)],
    envio: 4000,
    medioPago: 'Tarjeta',
    direccion: 'Los Notros 1250, Puerto Montt, Región de Los Lagos',
    despacho: {
      empresaTransporte: 'Starken',
      numeroSeguimiento: 'STK-884201',
      fechaEstimada: '2026-10-16',
      ultimaActualizacion: '2026-10-14T16:30:00',
      ubicacionActual: 'Centro de distribución Puerto Montt',
    },
  }),
  crearPedido({
    id: '1044',
    fecha: '2026-10-12T17:50:00',
    estado: ESTADOS_PEDIDO.ENVIADO,
    cliente: { nombre: 'Javiera Núñez', telefono: '+56 9 8812 0034' },
    items: [item('i5', 'Jarrón terracota', 'Tamaño L', 'TT-JT-L', 1, 38000)],
    envio: 4500,
    medioPago: 'Transferencia',
    direccion: 'Pedro Montt 320, Osorno, Región de Los Lagos',
    despacho: {
      empresaTransporte: 'Correos de Chile',
      numeroSeguimiento: 'CCH-771903',
      fechaEstimada: '2026-10-16',
      ultimaActualizacion: '2026-10-14T12:00:00',
      ubicacionActual: 'Sucursal Osorno',
    },
  }),
  crearPedido({
    id: '1043',
    fecha: '2026-10-10T09:30:00',
    estado: ESTADOS_PEDIDO.ENTREGADO,
    cliente: { nombre: 'Matías Contreras', telefono: '+56 9 7001 2288' },
    items: [item('i6', 'Set de tazas', 'Pack x2', 'TT-ST-2', 2, 21000)],
    envio: 4500,
    medioPago: 'Tarjeta',
    direccion: 'Calle Blanco 55, Castro, Región de Los Lagos',
    despacho: {
      empresaTransporte: 'Starken',
      numeroSeguimiento: 'STK-872110',
      fechaEstimada: '2026-10-14',
      ultimaActualizacion: '2026-10-13T15:45:00',
      ubicacionActual: 'Entregado al cliente',
    },
  }),
  crearPedido({
    id: '1042',
    fecha: '2026-10-08T13:00:00',
    estado: ESTADOS_PEDIDO.ENTREGADO,
    cliente: { nombre: 'Fernanda Lagos', telefono: '+56 9 6677 1409' },
    items: [item('i7', 'Maceta mediana', 'Tamaño M', 'TT-MM-M', 3, 8990)],
    envio: 3500,
    medioPago: 'Tarjeta',
    direccion: 'Camino Real 88, Frutillar, Región de Los Lagos',
    despacho: {
      empresaTransporte: 'Chilexpress',
      numeroSeguimiento: 'CHX-540077',
      fechaEstimada: '2026-10-12',
      ultimaActualizacion: '2026-10-11T11:20:00',
      ubicacionActual: 'Entregado al cliente',
    },
  }),
  crearPedido({
    id: '1041',
    fecha: '2026-10-06T15:25:00',
    estado: ESTADOS_PEDIDO.ENTREGADO,
    cliente: { nombre: 'Tomás Vera', telefono: '+56 9 5120 9983' },
    items: [item('i8', 'Florero Gres Silvestre', 'Tamaño S', 'TT-FGS-S', 1, 14990)],
    envio: 3000,
    medioPago: 'Transferencia',
    direccion: 'Av. Gramado 210, Puerto Varas, Región de Los Lagos',
    despacho: {
      empresaTransporte: 'Correos de Chile',
      numeroSeguimiento: 'CCH-766012',
      fechaEstimada: '2026-10-10',
      ultimaActualizacion: '2026-10-09T10:05:00',
      ubicacionActual: 'Entregado al cliente',
    },
  }),
  crearPedido({
    id: '1040',
    fecha: '2026-10-03T18:10:00',
    estado: ESTADOS_PEDIDO.ENTREGADO,
    cliente: { nombre: 'Constanza Araya', telefono: '+56 9 9034 7716' },
    items: [item('i9', 'Taza de gres natural', 'Color natural', 'TT-TGN-NAT', 2, 15490)],
    envio: 3000,
    medioPago: 'Tarjeta',
    direccion: 'Calle Bellavista 410, Temuco, Región de la Araucanía',
    despacho: {
      empresaTransporte: 'Starken',
      numeroSeguimiento: 'STK-861455',
      fechaEstimada: '2026-10-08',
      ultimaActualizacion: '2026-10-07T17:30:00',
      ubicacionActual: 'Entregado al cliente',
    },
  }),
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
  await delay(500)
  return copiar(baseDatos)
}

export async function obtenerPedido(id) {
  // TODO: conectar API
  await delay(400)
  const pedido = baseDatos.find((p) => p.id === id)
  return pedido ? copiar(pedido) : null
}

export async function comenzarPreparacion(id) {
  console.log('[Pedidos] Comenzar preparación:', { id })
  // TODO: conectar API
  await delay(400)
  const pedido = buscar(id)
  validarCambio(pedido, ESTADOS_PEDIDO.PREPARACION)
  pedido.estado = ESTADOS_PEDIDO.PREPARACION
  return copiar(pedido)
}

export async function marcarEnviado(id, { empresaTransporte, numeroSeguimiento }) {
  console.log('[Pedidos] Marcar como enviado:', { id, empresaTransporte, numeroSeguimiento })
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
  console.log('[Pedidos] Solicitar cancelación:', { id })
  // TODO: conectar API
  await delay(500)
  const pedido = buscar(id)
  if ([ESTADOS_PEDIDO.ENVIADO, ESTADOS_PEDIDO.ENTREGADO].includes(pedido.estado)) {
    throw new Error('Un pedido enviado no se puede cancelar.')
  }
  return null
}
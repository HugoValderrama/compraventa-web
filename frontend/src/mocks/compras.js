export const ESTADOS_COMPRA = {
  RECIBIDO: 'Recibido',
  PREPARACION: 'En preparación',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
}

// TODO: conectar API (URL de la imagen del producto)
const item = (id, nombre, variante, cantidad, precioUnitario) => ({
  id,
  nombre,
  imagen: '',
  cantidad,
  precioUnitario,
  variante,
})

function crearCompra({
  id,
  fecha,
  estado,
  vendedor,
  items,
  envio,
  medioPago,
  direccion,
  despacho = {},
}) {
  const subtotal = items.reduce((suma, i) => suma + i.cantidad * i.precioUnitario, 0)
  const valorNeto = Math.round(subtotal / 1.19)

  return {
    id,
    fecha,
    estado,
    vendedor,
    items,
    valorNeto,
    iva: subtotal - valorNeto,
    total: subtotal + envio,
    envio,
    medioPago,
    direccionEntrega: {
      nombre: 'Nicolás Pardo',
      telefono: '+56 9 7310 4482',
      direccion,
    },
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

// Una compra por estado
const COMPRAS_EJEMPLO = [
  crearCompra({
    id: '2041',
    fecha: '2026-10-16T18:20:00',
    estado: ESTADOS_COMPRA.RECIBIDO,
    vendedor: 'Taller Tierra',
    items: [item('c1', 'Florero Gres Silvestre', 'Tamaño M', 1, 19990)],
    envio: 3500,
    medioPago: 'Tarjeta',
    direccion: 'Av. Alemania 640, depto. 302, Valdivia, Región de Los Ríos',
    despacho: { fechaEstimada: '2026-10-24' },
  }),
  crearCompra({
    id: '2040',
    fecha: '2026-10-14T10:05:00',
    estado: ESTADOS_COMPRA.PREPARACION,
    vendedor: 'Tejidos Luna',
    items: [
      item('c2', 'Manta de lana', 'Color natural', 1, 45000),
      item('c3', 'Cojín tejido', 'Gris', 2, 12000),
    ],
    envio: 4000,
    medioPago: 'Transferencia',
    direccion: 'Los Notros 1250, Puerto Montt, Región de Los Lagos',
    despacho: { fechaEstimada: '2026-10-22' },
  }),
  crearCompra({
    id: '2039',
    fecha: '2026-10-10T16:40:00',
    estado: ESTADOS_COMPRA.ENVIADO,
    vendedor: 'Taller Tierra',
    items: [item('c4', 'Taza de gres natural', 'Color natural', 2, 15490)],
    envio: 3500,
    medioPago: 'Tarjeta',
    direccion: 'Av. Providencia 1208, depto. 45, Santiago, Región Metropolitana',
    despacho: {
      empresaTransporte: 'Chilexpress',
      numeroSeguimiento: 'CHX-558120',
      fechaEstimada: '2026-10-19',
      ultimaActualizacion: '2026-10-16T14:30:00',
      ubicacionActual: 'Centro de distribución - Santiago',
    },
  }),
  crearCompra({
    id: '2038',
    fecha: '2026-10-05T09:30:00',
    estado: ESTADOS_COMPRA.ENTREGADO,
    vendedor: 'Cerámica del Sur',
    items: [item('c5', 'Set de tazas', 'Pack x2', 1, 21000)],
    envio: 4500,
    medioPago: 'Tarjeta',
    direccion: 'Calle Blanco 55, Castro, Región de Los Lagos',
    despacho: {
      empresaTransporte: 'Starken',
      numeroSeguimiento: 'STK-872110',
      fechaEstimada: '2026-10-10',
      ultimaActualizacion: '2026-10-09T15:45:00',
      ubicacionActual: 'Entregado al cliente',
    },
  }),
]

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const copiar = (datos) => JSON.parse(JSON.stringify(datos))

// Simula la API. Reemplazar por fetch cuando el backend esté listo.
export async function listarCompras() {
  // TODO: conectar API
  await delay(500)
  return copiar(COMPRAS_EJEMPLO)
}

export async function obtenerCompra(id) {
  // TODO: conectar API
  await delay(400)
  const compra = COMPRAS_EJEMPLO.find((c) => c.id === id)
  return compra ? copiar(compra) : null
}
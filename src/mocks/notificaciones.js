// TODO: conectar API
// Nota: estos endpoints NO están en los 31 prioritarios:
//   GET   /api/notifications
//   PATCH /api/notifications/:id/read
//   PATCH /api/notifications/read-all
// El mock recibe `rol` porque la cuenta puede tener ambos modos; el backend
// real lo sacaría del token / modo activo.
// Modelo: { id, tipo, titulo, detalle, fecha (ISO), leida, ruta }

import { STOCK_BAJO } from '../utils/productos'

const esperar = (ms = 150) => new Promise((resolver) => setTimeout(resolver, ms))

const crearCliente = () => {
  const hace = (min) => new Date(Date.now() - min * 60000).toISOString()
  return [
    { id: 'c1', tipo: 'pedido_estado', titulo: 'Tu pedido #1021 fue enviado', detalle: 'Llegará en 2 a 3 días hábiles.', fecha: hace(5), leida: false, ruta: '/compras/1021' },
    { id: 'c2', tipo: 'cotizacion_respondida', titulo: 'Respondieron tu cotización', detalle: 'Taller Los Lagos envió su propuesta.', fecha: hace(45), leida: false, ruta: '/cotizaciones/310' },
    { id: 'c3', tipo: 'mensaje_nuevo', titulo: 'Nuevo mensaje de Ferretería Sur', detalle: '¿Sigues interesado en el pedido?', fecha: hace(120), leida: false, ruta: '/mensajeria' },
    { id: 'c4', tipo: 'oferta_deseos', titulo: 'Un producto de tu lista está en oferta', detalle: 'Audífonos inalámbricos con 30% de descuento.', fecha: hace(60 * 5), leida: true, ruta: '/productos/45' },
    { id: 'c5', tipo: 'pregunta_respondida', titulo: 'Respondieron tu pregunta', detalle: 'El vendedor respondió sobre la talla M.', fecha: hace(60 * 26), leida: true, ruta: '/mis-preguntas' },
    { id: 'c6', tipo: 'cotizacion_respondida', titulo: 'Tu cotización vence mañana', detalle: 'La cotización #305 está por vencer.', fecha: hace(60 * 30), leida: false, ruta: '/cotizaciones/305' },
    { id: 'c7', tipo: 'pedido_estado', titulo: 'Pedido #1015 entregado', detalle: 'Califica tu compra cuando quieras.', fecha: hace(60 * 72), leida: true, ruta: '/compras/1015' },
  ]
}

const crearEmprendedor = () => {
  const hace = (min) => new Date(Date.now() - min * 60000).toISOString()
  return [
    { id: 'e1', tipo: 'pedido_nuevo', titulo: 'Nuevo pedido #2044', detalle: 'Un cliente compró 2 productos.', fecha: hace(3), leida: false, ruta: '/pedidos/2044' },
    { id: 'e2', tipo: 'cotizacion_recibida', titulo: 'Solicitud de cotización', detalle: 'Te pidieron cotizar un servicio de pintura.', fecha: hace(30), leida: false, ruta: '/cotizaciones-recibidas/88' },
    { id: 'e3', tipo: 'pregunta_nueva', titulo: 'Nueva pregunta pendiente', detalle: '¿Tienen stock en color negro?', fecha: hace(90), leida: false, ruta: '/preguntas-recibidas' },
    { id: 'e4', tipo: 'mensaje_nuevo', titulo: 'Mensaje de Camila R.', detalle: 'Hola, ¿hacen envíos a Puerto Montt?', fecha: hace(180), leida: true, ruta: '/mensajeria' },
    { id: 'e5', tipo: 'resena_nueva', titulo: 'Nueva reseña de 5 estrellas', detalle: '"Excelente atención y rápido despacho".', fecha: hace(60 * 10), leida: true, ruta: '/calificaciones' },
    { id: 'e6', tipo: 'stock_bajo', titulo: 'Stock bajo', detalle: `Una variante de "Polera básica" tiene menos de ${STOCK_BAJO} unidades.`, fecha: hace(60 * 28), leida: false, ruta: '/inventario' },
    { id: 'e7', tipo: 'pedido_nuevo', titulo: 'Nuevo pedido #2039', detalle: 'Un cliente compró 1 servicio.', fecha: hace(60 * 50), leida: true, ruta: '/pedidos/2039' },
  ]
}

let almacen = null
const obtener = () => {
  if (!almacen) almacen = { cliente: crearCliente(), emprendedor: crearEmprendedor() }
  return almacen
}

// GET /api/notifications
export async function getNotifications(rol = 'cliente') {
  await esperar()
  return (obtener()[rol] ?? []).map((n) => ({ ...n }))
}

// PATCH /api/notifications/:id/read
export async function markNotificationRead(id) {
  await esperar()
  Object.values(obtener()).forEach((lista) => {
    const n = lista.find((x) => x.id === id)
    if (n) n.leida = true
  })
  return { ok: true }
}

// PATCH /api/notifications/read-all
export async function markAllNotificationsRead(rol = 'cliente') {
  await esperar()
  ;(obtener()[rol] ?? []).forEach((n) => {
    n.leida = true
  })
  return { ok: true }
}

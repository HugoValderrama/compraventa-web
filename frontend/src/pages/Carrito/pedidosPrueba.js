import { CLAVE_CARRITO, EVENTO_CARRITO, cargarCarrito } from './carrito.js'
import { prepararEnvio } from './direcciones.js'

export const CLAVE_PEDIDOS_PRUEBA = 'laguito-libre.pedidos-prueba.v1'
export const EVENTO_PEDIDOS_PRUEBA = 'laguito-libre:pedidos-prueba-actualizados'

const texto = (valor) => typeof valor === 'string' ? valor.trim() : ''
const entero = (valor) => Number.isSafeInteger(valor) && valor >= 0

export function crearIdPedido() {
  return globalThis.crypto?.randomUUID?.() ?? `pedido-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function formatearFechaPedido(valor) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Santiago',
  }).format(new Date(valor))
}

function copiarDireccion(direccion) {
  return {
    id: texto(direccion?.id),
    destinatario: texto(direccion?.destinatario),
    telefono: texto(direccion?.telefono),
    direccion: texto(direccion?.direccion) || [texto(direccion?.calle), texto(direccion?.numero), texto(direccion?.departamento)].filter(Boolean).join(' '),
    ciudad: texto(direccion?.ciudad) || texto(direccion?.comuna),
    region: texto(direccion?.region),
    codigoPostal: texto(direccion?.codigoPostal),
  }
}

function copiarItems(resumen) {
  return resumen.lineas.map((linea) => ({
    id: linea.id,
    nombre: linea.producto.nombre,
    vendedor: linea.producto.vendedor,
    imagen: linea.producto.imagen,
    cantidad: linea.cantidad,
    precioUnitario: linea.producto.precio,
    importe: linea.importe,
  }))
}

function normalizarPedido(pedido) {
  if (!pedido || !texto(pedido.id) || !texto(pedido.numeroOrden) || pedido.modo !== 'prueba' || pedido.estado !== 'registrado') throw new Error('Pedido inválido')
  if (!['tarjeta', 'transferencia'].includes(pedido.metodo) || typeof pedido.creadoEn !== 'string' || !Number.isFinite(Date.parse(pedido.creadoEn))) throw new Error('Pago o fecha inválidos')
  if (!Array.isArray(pedido.items) || !pedido.items.length || !entero(pedido.totalProductos)) throw new Error('Importes inválidos')
  const ids = new Set()
  let total = 0
  const items = pedido.items.map((item) => {
    if (!item || !texto(item.id) || !texto(item.nombre) || ids.has(item.id) || !entero(item.cantidad) || item.cantidad === 0 || !entero(item.precioUnitario) || !entero(item.importe) || item.importe !== item.cantidad * item.precioUnitario) throw new Error('Producto inválido')
    ids.add(item.id)
    total += item.importe
    if (!entero(total)) throw new Error('Total inválido')
    return { id: item.id, nombre: item.nombre, vendedor: texto(item.vendedor), imagen: texto(item.imagen), cantidad: item.cantidad, precioUnitario: item.precioUnitario, importe: item.importe }
  })
  if (total !== pedido.totalProductos) throw new Error('Total inconsistente')
  const direccion = copiarDireccion(pedido.direccion)
  if (!direccion.id || !direccion.destinatario || !direccion.direccion || !direccion.ciudad || !direccion.region || !direccion.telefono) throw new Error('Dirección inválida')
  const ultimosDigitos = pedido.metodo === 'tarjeta' ? pedido.ultimosDigitos : null
  if (pedido.metodo === 'tarjeta' && (typeof ultimosDigitos !== 'string' || ultimosDigitos.length !== 4 || /[^0-9]/.test(ultimosDigitos))) throw new Error('Tarjeta inválida')
  return {
    id: pedido.id,
    numeroOrden: pedido.numeroOrden,
    creadoEn: pedido.creadoEn,
    modo: 'prueba',
    estado: 'registrado',
    metodo: pedido.metodo,
    ultimosDigitos,
    direccion,
    items,
    totalProductos: total,
    costoEnvio: null,
    entregaEstimada: null,
  }
}

export function cargarPedidosPrueba(almacenamiento) {
  try {
    const storage = almacenamiento ?? window.localStorage
    const guardado = storage.getItem(CLAVE_PEDIDOS_PRUEBA)
    const datos = guardado === null ? [] : JSON.parse(guardado)
    if (!Array.isArray(datos)) throw new Error('Pedidos inválidos')
    const ids = new Set()
    const numeros = new Set()
    const pedidos = datos.map((dato) => {
      const pedido = normalizarPedido(dato)
      if (ids.has(pedido.id) || numeros.has(pedido.numeroOrden)) throw new Error('Pedido duplicado')
      ids.add(pedido.id)
      numeros.add(pedido.numeroOrden)
      return pedido
    })
    return { pedidos, error: '' }
  } catch {
    return { pedidos: [], error: 'No se pudieron cargar los pedidos de prueba. Intenta nuevamente.' }
  }
}

const firmaItems = (items) => JSON.stringify(items.map(({ id, cantidad }) => ({ id, cantidad })).sort((a, b) => a.id.localeCompare(b.id)))

function vaciarCarritoDelPedido(pedido, almacenamiento) {
  const actual = cargarCarrito(almacenamiento)
  if (actual.error) return 'El pedido se guardó, pero no se pudo revisar el carrito.'
  if (!actual.items.length) return ''
  if (firmaItems(actual.items) !== firmaItems(pedido.items)) return 'El pedido se guardó y se conservaron los cambios recientes del carrito.'
  try {
    const storage = almacenamiento ?? window.localStorage
    storage.setItem(CLAVE_CARRITO, '[]')
  } catch {
    return 'El pedido se guardó, pero no se pudo vaciar el carrito.'
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_CARRITO))
  return ''
}

// Registra únicamente un pedido local de prueba. Nunca guarda número de tarjeta ni CVV.
export function registrarPedidoPrueba(revision, intentoId, almacenamiento, fecha = new Date()) {
  if (typeof intentoId !== 'string' || !intentoId.trim() || intentoId.length > 100) throw new Error('No se pudo identificar el intento de compra.')
  const guardados = cargarPedidosPrueba(almacenamiento)
  if (guardados.error) throw new Error(guardados.error)
  const existente = guardados.pedidos.find((pedido) => pedido.id === intentoId)
  if (existente) return { pedido: existente, aviso: vaciarCarritoDelPedido(existente, almacenamiento) }
  if (!revision || revision.modo !== 'prueba') throw new Error('Valida primero el pago de prueba.')

  const actual = prepararEnvio(almacenamiento)
  if (JSON.stringify(copiarItems(actual.resumen)) !== JSON.stringify(copiarItems(revision.resumen)) || JSON.stringify(copiarDireccion(actual.direccion)) !== JSON.stringify(copiarDireccion(revision.direccion))) {
    throw new Error('El carrito o la dirección cambiaron. Revisa los datos y vuelve a confirmar.')
  }
  const fechaOrden = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/Santiago' }).formatToParts(fecha)
  const dia = ['year', 'month', 'day'].map((tipo) => fechaOrden.find((parte) => parte.type === tipo).value).join('')
  const base = `LL-${dia}-${intentoId.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase()}`
  let numeroOrden = base
  let consecutivo = 2
  while (guardados.pedidos.some((pedido) => pedido.numeroOrden === numeroOrden)) numeroOrden = `${base}-${consecutivo++}`
  const pedido = normalizarPedido({
    id: intentoId,
    numeroOrden,
    creadoEn: fecha.toISOString(),
    modo: 'prueba',
    estado: 'registrado',
    metodo: revision.metodo,
    ultimosDigitos: revision.ultimosDigitos,
    direccion: copiarDireccion(actual.direccion),
    items: copiarItems(actual.resumen),
    totalProductos: actual.resumen.total,
  })
  try {
    const storage = almacenamiento ?? window.localStorage
    storage.setItem(CLAVE_PEDIDOS_PRUEBA, JSON.stringify([...guardados.pedidos, pedido]))
  } catch {
    throw new Error('No se pudo guardar el pedido de prueba. Intenta nuevamente.')
  }
  const aviso = vaciarCarritoDelPedido(pedido, almacenamiento)
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_PEDIDOS_PRUEBA))
  return { pedido, aviso }
}

export function suscribirPedidosPrueba(onCambio, objetivo = window) {
  const onStorage = (event) => {
    if (event.key === CLAVE_PEDIDOS_PRUEBA || event.key === null) onCambio()
  }
  objetivo.addEventListener('storage', onStorage)
  objetivo.addEventListener(EVENTO_PEDIDOS_PRUEBA, onCambio)
  return () => {
    objetivo.removeEventListener('storage', onStorage)
    objetivo.removeEventListener(EVENTO_PEDIDOS_PRUEBA, onCambio)
  }
}

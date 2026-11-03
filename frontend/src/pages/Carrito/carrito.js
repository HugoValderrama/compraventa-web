import { cargarCatalogo } from '../Catalogo/catalogo.js'

export const CLAVE_CARRITO = 'laguito-libre.carrito.v1'
export const EVENTO_CARRITO = 'laguito-libre:carrito-actualizado'

function cantidadValida(cantidad) {
  if (!Number.isSafeInteger(cantidad) || cantidad < 1) {
    throw new Error('La cantidad debe ser un número entero mayor que cero.')
  }
}

export function cargarCarrito(almacenamiento) {
  try {
    const storage = almacenamiento ?? window.localStorage
    const texto = storage.getItem(CLAVE_CARRITO)
    const registros = texto === null ? [] : JSON.parse(texto)
    if (!Array.isArray(registros)) throw new Error('Carrito inválido')

    const unicos = new Map()
    for (const registro of registros) {
      if (!registro || typeof registro.id !== 'string' || !registro.id.trim()) {
        throw new Error('Producto inválido')
      }
      cantidadValida(registro.cantidad)
      const id = registro.id.trim()
      const cantidad = (unicos.get(id)?.cantidad ?? 0) + registro.cantidad
      cantidadValida(cantidad)
      unicos.set(id, { id, cantidad })
    }
    return { items: [...unicos.values()], error: '' }
  } catch {
    return { items: [], error: 'No se pudo cargar tu carrito. Intenta nuevamente.' }
  }
}

function productoActual(id, almacenamiento) {
  const catalogo = cargarCatalogo(almacenamiento)
  if (catalogo.error) throw new Error(catalogo.error)
  const producto = catalogo.productos.find((item) => item.id === id)
  if (!producto) throw new Error('Este producto ya no está disponible.')
  return producto
}

function modificarCarrito(transformar, almacenamiento) {
  const actuales = cargarCarrito(almacenamiento)
  if (actuales.error) throw new Error(actuales.error)
  const items = transformar(actuales.items)
  if (JSON.stringify(items) !== JSON.stringify(actuales.items)) {
    try {
      const storage = almacenamiento ?? window.localStorage
      storage.setItem(CLAVE_CARRITO, JSON.stringify(items))
    } catch {
      throw new Error('No se pudo guardar el carrito. Intenta nuevamente.')
    }
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_CARRITO))
  }
  return { items, error: '' }
}

export function agregarAlCarrito(id, cantidad = 1, almacenamiento) {
  cantidadValida(cantidad)
  const producto = productoActual(id, almacenamiento)
  return modificarCarrito((items) => {
    const anterior = items.find((item) => item.id === id)
    const total = (anterior?.cantidad ?? 0) + cantidad
    cantidadValida(total)
    if (producto.stock === 0) throw new Error('Este producto está sin stock.')
    if (total > producto.stock) {
      throw new Error('Solo hay ' + producto.stock + ' unidades disponibles de este producto.')
    }
    return anterior
      ? items.map((item) => item.id === id ? { ...item, cantidad: total } : item)
      : [...items, { id, cantidad }]
  }, almacenamiento)
}

export function cambiarCantidad(id, cantidad, almacenamiento) {
  cantidadValida(cantidad)
  const producto = productoActual(id, almacenamiento)
  return modificarCarrito((items) => {
    const anterior = items.find((item) => item.id === id)
    if (!anterior) throw new Error('Este producto ya no está en el carrito.')
    // Permite reducir una cantidad antigua si el stock ha bajado.
    if (cantidad > producto.stock && cantidad >= anterior.cantidad) {
      throw new Error('Solo hay ' + producto.stock + ' unidades disponibles de este producto.')
    }
    return items.map((item) => item.id === id ? { ...item, cantidad } : item)
  }, almacenamiento)
}

export function quitarDelCarrito(id, almacenamiento) {
  return modificarCarrito((items) => items.filter((item) => item.id !== id), almacenamiento)
}

export function resumirCarrito(items, productos) {
  const porId = new Map(productos.map((producto) => [producto.id, producto]))
  let subtotal = 0
  let unidades = 0
  let importesValidos = true
  const lineas = items.map((item) => {
    const producto = porId.get(item.id) ?? null
    const calculado = producto ? producto.precio * item.cantidad : null
    const importe = calculado !== null && Number.isSafeInteger(calculado) ? calculado : null
    let problema = ''

    if (!producto) problema = 'Este producto ya no está disponible.'
    else if (producto.stock === 0) problema = 'Este producto está sin stock.'
    else if (item.cantidad > producto.stock) problema = 'Solo quedan ' + producto.stock + ' unidades. Ajusta la cantidad.'
    if (importe === null && producto) problema = 'No se pudo calcular el importe de este producto.'

    if (importe === null || !Number.isSafeInteger(subtotal + importe)) importesValidos = false
    else subtotal += importe
    unidades += item.cantidad
    return { ...item, producto, importe, problema }
  })

  const cantidadesValidas = Number.isSafeInteger(unidades)
  return {
    lineas,
    subtotal: importesValidos ? subtotal : null,
    total: importesValidos ? subtotal : null,
    unidades: cantidadesValidas ? unidades : null,
    puedeContinuar: lineas.length > 0 && cantidadesValidas && importesValidos && lineas.every((linea) => !linea.problema),
  }
}

export function validarCarritoActual(almacenamiento) {
  const carrito = cargarCarrito(almacenamiento)
  if (carrito.error) throw new Error(carrito.error)
  const catalogo = cargarCatalogo(almacenamiento)
  if (catalogo.error) throw new Error(catalogo.error)
  const resumen = resumirCarrito(carrito.items, catalogo.productos)
  if (!resumen.lineas.length) throw new Error('Tu carrito está vacío.')
  if (!resumen.puedeContinuar) {
    throw new Error(resumen.lineas.find((linea) => linea.problema)?.problema ?? 'Revisa las cantidades y los importes antes de continuar.')
  }
  return { carrito, catalogo, resumen }
}

export function suscribirCarrito(onCambio, objetivo = window) {
  const onStorage = (event) => {
    if (event.key === CLAVE_CARRITO || event.key === null) onCambio()
  }
  objetivo.addEventListener('storage', onStorage)
  objetivo.addEventListener(EVENTO_CARRITO, onCambio)
  return () => {
    objetivo.removeEventListener('storage', onStorage)
    objetivo.removeEventListener(EVENTO_CARRITO, onCambio)
  }
}

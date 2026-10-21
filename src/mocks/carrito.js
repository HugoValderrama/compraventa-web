import { obtenerProductoMock } from './productos'
import { precioVigente } from '../utils/productos'

// TODO: conectar API
// TODO (backend): un producto propio no debe poder agregarse al carrito
// (un emprendedor que compra en modo cliente); el backend lo validará.

const esperar = (ms = 150) => new Promise((resolver) => setTimeout(resolver, ms))

const items = [
  { id: 1, nombre: 'Audífonos inalámbricos', cantidad: 2, precio: 12990 },
  { id: 2, nombre: 'Mouse gamer', cantidad: 1, precio: 8990 },
]

// GET /api/cart
export async function getCart() {
  await esperar()
  return { items: items.map((item) => ({ ...item })) }
}

// POST /api/cart/items
export async function addToCart(productId, varianteId, cantidad) {
  await esperar()
  const producto = obtenerProductoMock(productId)
  if (!producto || !producto.activo) throw new Error('El producto ya no está disponible.')

  const variante = producto.variantes.find((v) => v.id === varianteId)
  if (!variante) throw new Error('La variante seleccionada no existe.')

  const id = `${productId}:${varianteId}`
  const existente = items.find((item) => item.id === id)
  const total = (existente?.cantidad ?? 0) + cantidad
  if (!Number.isInteger(cantidad) || cantidad < 1 || total > variante.stock) {
    throw new Error('No hay stock suficiente para esa cantidad.')
  }

  if (existente) {
    existente.cantidad = total
  } else {
    items.push({
      id,
      productId,
      varianteId,
      nombre: variante.etiqueta ? `${producto.nombre} (${variante.etiqueta})` : producto.nombre,
      cantidad,
      precio: precioVigente(producto).precio,
    })
  }
  return { ok: true, items: items.length }
}
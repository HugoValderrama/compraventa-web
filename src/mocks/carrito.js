// TODO: conectar API
// TODO (backend): un producto propio no debe poder agregarse al carrito
// (un emprendedor que compra en modo cliente); el backend lo validará.

const esperar = (ms = 150) => new Promise((resolver) => setTimeout(resolver, ms))

// GET /api/cart
export async function getCart() {
  await esperar()
  return {
    items: [
      { id: 1, nombre: 'Audífonos inalámbricos', cantidad: 2, precio: 12990 },
      { id: 2, nombre: 'Mouse gamer', cantidad: 1, precio: 8990 },
    ],
  }
}

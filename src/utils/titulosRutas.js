import { matchPath } from 'react-router-dom'

// El ORDEN importa: se usa la primera coincidencia.
// Por eso /productos/nuevo va antes que /productos/:id.
// Se incluyen las rutas del prompt y los alias que ya existen en App.jsx.
const TITULOS = [
  ['/catalogo', 'Catálogo'],
  ['/categorias', 'Categorías'],
  ['/tiendas/:id', 'Tienda'],

  ['/perfil', 'Mi perfil'],
  ['/perfilE', 'Mi perfil'],
  ['/direcciones', 'Mis direcciones'],

  ['/carrito', 'Mi carrito'],
  ['/carrito/direccion', 'Dirección de envío'],
  ['/carrito/pago', 'Pago'],
  ['/carrito/confirmacion/:id', 'Compra confirmada'],
  ['/checkout', 'Finalizar compra'],

  ['/compras', 'Mis compras'],
  ['/compras/:id/seguimiento', 'Seguimiento'],
  ['/compras/:id', 'Detalle de compra'],

  ['/cotizaciones', 'Mis cotizaciones'],
  ['/cotizaciones/nueva', 'Solicitar cotización'],
  ['/cotizaciones/:id', 'Detalle de cotización'],
  ['/cotizaciones-recibidas', 'Cotizaciones recibidas'],
  ['/cotizaciones-recibidas/:id', 'Detalle de cotización'],

  ['/mensajeria', 'Mensajería'],
  ['/mensajeria/:id', 'Mensajería'],

  ['/preguntas', 'Mis preguntas'],
  ['/mis-preguntas', 'Mis preguntas'],
  ['/mis-preguntas/:id', 'Mis preguntas'],
  ['/preguntas-pendientes', 'Preguntas pendientes'],
  ['/preguntas-recibidas', 'Preguntas pendientes'],
  ['/preguntas-recibidas/:id', 'Preguntas pendientes'],

  ['/resenas', 'Mis reseñas'],
  ['/deseos', 'Lista de deseos'],
  ['/lista-deseos', 'Lista de deseos'],

  ['/emprendedor', 'Panel del emprendedor'],
  ['/productos', 'Mis productos'],
  ['/productos/nuevo', 'Nuevo producto'],
  ['/productos/:id/editar', 'Editar producto'],
  ['/productos/:id', 'Detalle de producto'],
  ['/servicios', 'Mis servicios'],
  ['/servicios/nuevo', 'Nuevo servicio'],
  ['/servicios/:id/editar', 'Editar servicio'],
  ['/servicios/:id', 'Detalle de servicio'],
  ['/inventario', 'Inventario'],
  ['/ofertas', 'Ofertas'],
  ['/pedidos', 'Pedidos recibidos'],
  ['/pedidos/:id', 'Detalle de pedido'],
  ['/calificaciones', 'Mis calificaciones'],
]

// Devuelve el título de la ruta o '' si no hay coincidencia.
export function tituloDeRuta(pathname) {
  const ruta = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  for (const [path, titulo] of TITULOS) {
    if (matchPath({ path, end: true }, ruta)) return titulo
  }
  return ''
}

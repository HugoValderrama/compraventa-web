// Se consulta la misma colección que utiliza tu página Productos.jsx.
export const CLAVE_PRODUCTOS = 'laguito-libre.productos.v1'

const INICIALES = [
  {
    id: '1',
    nombre: 'Florero Gres Silvestre',
    categoria: 'Cerámicas artesanales',
    vendedor: 'Taller Tierra',
    precio: 19990,
    precioAnterior: 24990,
    stock: 12,
    imagen: '',
    descripcion: 'Florero de gres con acabado rústico, hecho a mano.',
  },
]

const CAMPOS_FILTRO = ['q', 'categoria', 'precioMin', 'precioMax', 'calificacion']

function normalizarProducto(producto) {
  if (
    !producto ||
    typeof producto.id !== 'string' ||
    !producto.id.trim() ||
    typeof producto.nombre !== 'string' ||
    !producto.nombre.trim() ||
    !Number.isSafeInteger(producto.precio) ||
    producto.precio < 0 ||
    !Number.isSafeInteger(producto.stock) ||
    producto.stock < 0
  ) {
    throw new Error('Producto inválido')
  }

  const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '')
  const calificacionValida =
    typeof producto.calificacion === 'number' &&
    Number.isFinite(producto.calificacion) &&
    producto.calificacion >= 0 &&
    producto.calificacion <= 5

  return {
    id: producto.id,
    nombre: producto.nombre.trim(),
    categoria: texto(producto.categoria) || 'Sin categoría',
    vendedor: texto(producto.vendedor),
    precio: producto.precio,
    precioAnterior:
      Number.isSafeInteger(producto.precioAnterior) && producto.precioAnterior > producto.precio
        ? producto.precioAnterior
        : 0,
    stock: producto.stock,
    precioEnvio: Number.isSafeInteger(producto.precioEnvio) && producto.precioEnvio >= 0
      ? producto.precioEnvio
      : null,
    imagen: texto(producto.imagen),
    descripcion: texto(producto.descripcion),
    // No se asignan puntuaciones a productos que todavía no las tienen.
    calificacion: calificacionValida ? producto.calificacion : null,
  }
}

export function cargarCatalogo(almacenamiento) {
  try {
    const storage = almacenamiento ?? window.localStorage
    const guardado = storage.getItem(CLAVE_PRODUCTOS)
    const productos = guardado === null ? INICIALES : JSON.parse(guardado)

    if (!Array.isArray(productos)) throw new Error('Catálogo inválido')

    return { productos: productos.map(normalizarProducto), error: '' }
  } catch {
    return { productos: [], error: 'No se pudo cargar el catálogo. Intenta nuevamente.' }
  }
}

export function pesos(valor) {
  return valor.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  })
}

export function obtenerCategorias(productos) {
  return [...new Set(productos.map((producto) => producto.categoria))].sort((a, b) =>
    a.localeCompare(b, 'es')
  )
}

function precioDesdeTexto(texto) {
  if (texto === '') return null
  if (!/^\d+$/.test(texto)) return NaN
  const numero = Number(texto)
  return Number.isSafeInteger(numero) ? numero : NaN
}

export function leerFiltros(parametros) {
  const precioMinTexto = parametros.get('precioMin') ?? ''
  const precioMaxTexto = parametros.get('precioMax') ?? ''
  const precioMin = precioDesdeTexto(precioMinTexto)
  const precioMax = precioDesdeTexto(precioMaxTexto)
  const calificacion = Number(parametros.get('calificacion') || 0)
  const errores = {}

  if (Number.isNaN(precioMin)) errores.precioMin = 'Ingresa un precio entero desde 0.'
  if (Number.isNaN(precioMax)) errores.precioMax = 'Ingresa un precio entero desde 0.'
  if (Number.isFinite(precioMin) && Number.isFinite(precioMax) && precioMin > precioMax) {
    errores.precioMin = 'El mínimo debe ser menor o igual al máximo.'
    errores.precioMax = 'El máximo debe ser mayor o igual al mínimo.'
  }
  if (!Number.isInteger(calificacion) || calificacion < 0 || calificacion > 5) {
    errores.calificacion = 'Selecciona una calificación entre 1 y 5, o todas.'
  }

  return {
    q: parametros.get('q') ?? '',
    categoria: parametros.get('categoria') ?? '',
    precioMinTexto,
    precioMaxTexto,
    precioMin,
    precioMax,
    calificacion: errores.calificacion ? 0 : calificacion,
    errores,
  }
}

function textoComparable(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function filtrarProductos(productos, filtros) {
  if (Object.keys(filtros.errores).length) return []

  const busqueda = textoComparable(filtros.q)
  const categoria = textoComparable(filtros.categoria)

  return productos.filter((producto) => {
    const texto = textoComparable(producto.nombre + ' ' + producto.categoria + ' ' + producto.vendedor)

    return (
      (!busqueda || texto.includes(busqueda)) &&
      (!categoria || textoComparable(producto.categoria) === categoria) &&
      (filtros.precioMin === null || producto.precio >= filtros.precioMin) &&
      (filtros.precioMax === null || producto.precio <= filtros.precioMax) &&
      (filtros.calificacion === 0 ||
        (producto.calificacion !== null && producto.calificacion >= filtros.calificacion))
    )
  })
}

export function actualizarFiltro(parametros, campo, valor) {
  const siguientes = new URLSearchParams(parametros)
  if (valor === '' || valor === null) siguientes.delete(campo)
  else siguientes.set(campo, String(valor))
  return siguientes
}

export function limpiarFiltros(parametros) {
  const siguientes = new URLSearchParams(parametros)
  CAMPOS_FILTRO.forEach((campo) => siguientes.delete(campo))
  return siguientes
}

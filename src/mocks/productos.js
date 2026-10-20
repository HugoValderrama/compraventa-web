import { normalizarProducto } from '../utils/productos';
import { hoyISO } from '../utils/formatos';

const RETARDO_MS = 500;
const esperar = (ms = RETARDO_MS) => new Promise((resolve) => setTimeout(resolve, ms));

const CATEGORIAS = [
  { id: 'c1', nombre: 'Cerámicas artesanales' },
  { id: 'c2', nombre: 'Textiles' },
  { id: 'c3', nombre: 'Joyería artesanal' },
  { id: 'c4', nombre: 'Madera y muebles' },
  { id: 'c5', nombre: 'Cuero y marroquinería' },
  { id: 'c6', nombre: 'Alimentos y conservas' },
  { id: 'c7', nombre: 'Decoración del hogar' },
];

// En el backend, GET /api/products/:id debe incluir la tienda del emprendedor.
const TIENDAS = {
  1: { id: 1, nombre: 'Pérez y Soto Artesanías SpA' },
  2: { id: 2, nombre: 'Taller Newen' },
};

// Fotos de prueba (SVG en línea) para ver la galería sin archivos reales.
const foto = (color, texto) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="${color}"/><text x="300" y="320" font-size="40" text-anchor="middle" fill="#fff" font-family="sans-serif">${texto}</text></svg>`
  )}`;

// En memoria: se reinicia al recargar.
//  1: variantes con stock normal, bajo y agotado + 3 fotos (dueño: emprendedor 1)
//  2: de otro emprendedor, sin productos relacionados
//  3: con oferta vigente
//  4: variante única sin nombre
//  5: INACTIVO (solo lo ve su dueño)
//  6: restricción de edad (+18)
let productosMock = [
  {
    id: '1',
    emprendedorId: 1,
    nombre: 'Florero Gres Silvestre',
    descripcion: 'Florero de gres con acabado rústico, hecho a mano.',
    categoria: 'Cerámicas artesanales',
    precio: 19990,
    tipoVariante: 'Tamaño',
    variantes: [
      { id: 'v1', etiqueta: 'S (Pequeño)', sku: 'FLO-S', stock: 25 },
      { id: 'v2', etiqueta: 'M (Mediano)', sku: 'FLO-M', stock: 6 },
      { id: 'v3', etiqueta: 'L (Grande)', sku: 'FLO-L', stock: 0 },
    ],
    fotos: [foto('#7a5c3e', 'Florero 1'), foto('#9c7a55', 'Florero 2'), foto('#5c452d', 'Florero 3')],
    caracteristicas: {
      Material: 'Cerámica de alta temperatura (Gres)',
      Dimensiones: '15 cm de alto × 10 cm de diámetro',
      Peso: '450 gramos',
      Origen: 'Elaborado artesanalmente, Valparaíso',
    },
    envio: { retiroEnTaller: true, despacho: true, costoEnvio: 3500, diasPreparacion: 3 },
    restriccionEdad: false,
    activo: true,
    oferta: null,
  },
  {
    id: '2',
    emprendedorId: 2,
    nombre: 'Telar Mapuche Mediano',
    descripcion: 'Telar tradicional tejido a mano en lana de oveja.',
    categoria: 'Textiles',
    precio: 45000,
    tipoVariante: 'Color',
    variantes: [{ id: 'v1', etiqueta: 'Natural', sku: 'TEL-N', stock: 3 }],
    fotos: [],
    caracteristicas: { Material: 'Lana de oveja', Dimensiones: '', Peso: '', Origen: 'Araucanía' },
    envio: { retiroEnTaller: false, despacho: true, costoEnvio: 5000, diasPreparacion: 7 },
    restriccionEdad: false,
    activo: true,
    oferta: null,
  },
  {
    id: '3',
    emprendedorId: 2,
    nombre: 'Taza de Greda Esmaltada',
    descripcion: 'Taza de greda esmaltada, apta para lavavajillas.',
    categoria: 'Cerámicas artesanales',
    precio: 8990,
    tipoVariante: 'Color',
    variantes: [
      { id: 'v1', etiqueta: 'Azul', sku: 'TAZ-A', stock: 12 },
      { id: 'v2', etiqueta: 'Verde', sku: 'TAZ-V', stock: 3 },
    ],
    fotos: [foto('#3b6ea5', 'Taza')],
    caracteristicas: { Material: 'Greda esmaltada', Dimensiones: '9 cm de alto', Peso: '320 gramos', Origen: 'Pomaire' },
    envio: { retiroEnTaller: false, despacho: true, costoEnvio: 0, diasPreparacion: 2 },
    restriccionEdad: false,
    activo: true,
    oferta: { fechaInicio: '2026-10-01', fechaFin: '2027-12-31', precioOferta: 6990 },
  },
  {
    id: '4',
    emprendedorId: 1,
    nombre: 'Plato Hondo de Gres',
    descripcion: 'Plato hondo de gres con esmalte natural, ideal para sopas.',
    categoria: 'Cerámicas artesanales',
    precio: 12990,
    tipoVariante: 'Tamaño',
    variantes: [{ id: 'v1', etiqueta: '', sku: 'PLA-1', stock: 9 }],
    fotos: [],
    caracteristicas: { Material: 'Gres', Dimensiones: '', Peso: '', Origen: '' },
    envio: { retiroEnTaller: true, despacho: false, costoEnvio: 0, diasPreparacion: 1 },
    restriccionEdad: false,
    activo: true,
    oferta: null,
  },
  {
    id: '5',
    emprendedorId: 1,
    nombre: 'Mate de Greda',
    descripcion: 'Mate de greda con virola de alpaca. Temporalmente sin publicar.',
    categoria: 'Cerámicas artesanales',
    precio: 15000,
    tipoVariante: 'Tamaño',
    variantes: [{ id: 'v1', etiqueta: '', sku: '', stock: 5 }],
    fotos: [],
    caracteristicas: { Material: '', Dimensiones: '', Peso: '', Origen: '' },
    envio: { retiroEnTaller: true, despacho: true, costoEnvio: 2500, diasPreparacion: 2 },
    restriccionEdad: false,
    activo: false,
    oferta: null,
  },
  {
    id: '6',
    emprendedorId: 2,
    nombre: 'Licor de Murta Artesanal',
    descripcion: 'Licor de murta elaborado de forma artesanal, botella de 500 ml.',
    categoria: 'Alimentos y conservas',
    precio: 12000,
    tipoVariante: 'Sabor',
    variantes: [{ id: 'v1', etiqueta: 'Murta', sku: 'LIC-M', stock: 4 }],
    fotos: [],
    caracteristicas: { Material: 'Murta y alcohol de caña', Dimensiones: '500 ml', Peso: '', Origen: 'Chiloé' },
    envio: { retiroEnTaller: true, despacho: true, costoEnvio: 4000, diasPreparacion: 4 },
    restriccionEdad: true,
    activo: true,
    oferta: null,
  },
];

const PREGUNTAS = {
  1: [
    { id: 'q1', autor: 'Camila R.', texto: '¿El florero es apto para agua?', respuesta: 'Sí, está esmaltado por dentro y es impermeable.', fecha: '2026-10-02' },
    { id: 'q2', autor: 'Diego M.', texto: '¿Hacen envíos a Punta Arenas?', respuesta: null, fecha: '2026-10-15' },
  ],
};

const RESENAS = {
  1: [
    { id: 'r1', autor: 'Valentina P.', estrellas: 5, comentario: 'Hermoso, llegó muy bien embalado.', fecha: '2026-09-20' },
    { id: 'r2', autor: 'Jorge T.', estrellas: 4, comentario: 'Buena calidad, el color es un poco más oscuro que en la foto.', fecha: '2026-10-01' },
  ],
  3: [{ id: 'r3', autor: 'Ana L.', estrellas: 5, comentario: 'Perfecta para el café de la mañana.', fecha: '2026-10-10' }],
};

const carritoMock = [];
const deseosMock = [];

const copia = (producto) => ({
  ...normalizarProducto(structuredClone(producto)),
  tienda: TIENDAS[producto.emprendedorId] ?? null,
});

// TODO: conectar API
// GET /api/categories
export async function getCategories() {
  await esperar(200);
  return CATEGORIAS.map((c) => ({ ...c }));
}

// TODO: conectar API
// GET /api/products   (con ?emprendedorId= para "Mis productos")
export async function getProducts({ emprendedorId } = {}) {
  await esperar();
  return productosMock
    .filter((p) => emprendedorId === undefined || p.emprendedorId === emprendedorId)
    .map(copia);
}

// TODO: conectar API
// GET /api/products/:id
export async function getProduct(id) {
  await esperar();
  const producto = productosMock.find((p) => p.id === id);
  if (!producto) throw Object.assign(new Error('Producto no encontrado.'), { codigo: 404 });
  return copia(producto);
}

// TODO: conectar API
// GET /api/products/:id/related
export async function getRelatedProducts(id) {
  await esperar();
  const base = productosMock.find((p) => p.id === id);
  if (!base) return [];
  return productosMock
    .filter((p) => p.id !== id && p.activo && p.categoria === base.categoria)
    .slice(0, 4)
    .map(copia);
}

// TODO: conectar API
// GET /api/products/:id/questions
export async function getQuestions(id) {
  await esperar();
  return (PREGUNTAS[id] ?? []).map((q) => ({ ...q }));
}

// TODO: conectar API
// POST /api/products/:id/questions   (el autor sale de la sesión)
export async function createQuestion(id, texto) {
  await esperar();
  const limpio = (texto ?? '').trim();
  if (!productosMock.some((p) => p.id === id)) throw new Error('El producto ya no existe.');
  if (!limpio || limpio.length > 100) throw new Error('La pregunta debe tener entre 1 y 100 caracteres.');
  const nueva = { id: crypto.randomUUID(), autor: 'Tú', texto: limpio, respuesta: null, fecha: hoyISO() };
  PREGUNTAS[id] = [nueva, ...(PREGUNTAS[id] ?? [])];
  return { ...nueva };
}

// TODO: conectar API
// GET /api/products/:id/reviews
export async function getReviews(id) {
  await esperar();
  return (RESENAS[id] ?? []).map((r) => ({ ...r }));
}

// TODO: conectar API
// POST /api/cart/items
export async function addToCart(productId, varianteId, cantidad) {
  await esperar(300);
  const producto = productosMock.find((p) => p.id === productId);
  if (!producto || !producto.activo) throw new Error('El producto ya no está disponible.');
  const variante = normalizarProducto(producto).variantes.find((v) => v.id === varianteId);
  if (!variante) throw new Error('La variante seleccionada no existe.');
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > variante.stock) {
    throw new Error('No hay stock suficiente para esa cantidad.');
  }
  const existente = carritoMock.find((i) => i.productId === productId && i.varianteId === varianteId);
  if (existente) existente.cantidad = Math.min(existente.cantidad + cantidad, variante.stock);
  else carritoMock.push({ productId, varianteId, cantidad });
  return { ok: true, items: carritoMock.length };
}

// TODO: conectar API
// POST /api/wishlist
export async function addToWishlist(productId) {
  await esperar(300);
  if (!productosMock.some((p) => p.id === productId)) throw new Error('El producto ya no existe.');
  if (!deseosMock.includes(productId)) deseosMock.push(productId);
  return { ok: true };
}

// TODO: conectar API
// POST /api/products
// En el backend el emprendedorId sale del usuario en sesión, no del cuerpo.
// Las fotos llegan como URLs locales (URL.createObjectURL); el backend real
// debe recibir los archivos (multipart) y devolver las URLs definitivas.
export async function createProduct(data) {
  await esperar();
  const nuevo = normalizarProducto({ ...structuredClone(data), id: crypto.randomUUID() });
  productosMock = [nuevo, ...productosMock];
  return copia(nuevo);
}

// TODO: conectar API
// PUT /api/products/:id
export async function updateProduct(id, data) {
  await esperar();
  const actual = productosMock.find((p) => p.id === id);
  if (!actual) throw new Error('El producto ya no existe.');
  const actualizado = normalizarProducto({
    ...actual,
    ...structuredClone(data),
    id,
    emprendedorId: actual.emprendedorId,
  });
  productosMock = productosMock.map((p) => (p.id === id ? actualizado : p));
  return copia(actualizado);
}

// TODO: conectar API
// DELETE /api/products/:id
export async function deleteProduct(id) {
  await esperar();
  if (!productosMock.some((p) => p.id === id)) throw new Error('El producto ya no existe.');
  productosMock = productosMock.filter((p) => p.id !== id);
  return { ok: true };
}
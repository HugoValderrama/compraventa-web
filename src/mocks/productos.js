import { normalizarProducto } from '../utils/productos';

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

// En memoria: se reinicia al recargar. El producto "2" es de otro emprendedor
// (sirve para probar que no se puede editar un producto ajeno).
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
      { id: 'v1', etiqueta: 'S (Pequeño)', sku: 'FLO-S', stock: 5 },
      { id: 'v2', etiqueta: 'M (Mediano)', sku: 'FLO-M', stock: 4 },
      { id: 'v3', etiqueta: 'L (Grande)', sku: 'FLO-L', stock: 3 },
    ],
    fotos: [],
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
];

const copia = (producto) => normalizarProducto(structuredClone(producto));

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
  if (!producto) throw new Error('Producto no encontrado.');
  return copia(producto);
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
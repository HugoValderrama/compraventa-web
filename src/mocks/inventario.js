import { MAX_STOCK } from '../utils/inventario';
import { exigirEmprendedor, fallo } from './sesionMock';
import {
  actualizarStockVarianteMock,
  listarProductosMock,
  obtenerProductoMock,
} from './productos';

// Lee y escribe sobre la MISMA fuente que mocks/productos.js (no copia datos):
// lo que cambie aquí se ve en el detalle del producto y en el dashboard.

const esperar = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));


// Los ids de variante de los productos son locales ("v1"); con el backend real serán
// globales. Aquí la variante se identifica como "productoId:varianteId".
const idVariante = (productoId, varianteId) => `${productoId}:${varianteId}`;

function aItem(producto, variante) {
  return {
    varianteId: idVariante(producto.id, variante.id),
    productoId: producto.id,
    productoNombre: producto.nombre,
    foto: producto.fotos[0] ?? null,
    categoria: producto.categoria,
    etiqueta: variante.etiqueta,
    tipoVariante: producto.tipoVariante,
    sku: variante.sku,
    stock: variante.stock,
    activo: producto.activo,
  };
}

// TODO: conectar API
// GET /api/me/inventory
export async function getInventory() {
  await esperar();
  const yo = exigirEmprendedor();
  return listarProductosMock()
    .filter((p) => String(p.emprendedorId) === String(yo.id))
    .flatMap((p) => p.variantes.map((v) => aItem(p, v)));
}

// TODO: conectar API
// PATCH /api/variants/:id/stock   cuerpo: { stock }
export async function updateVariantStock(varianteId, stock) {
  await esperar();
  const yo = exigirEmprendedor();

  if (!Number.isInteger(stock) || stock < 0 || stock > MAX_STOCK) {
    throw fallo(`El stock debe ser un entero entre 0 y ${MAX_STOCK.toLocaleString('es-CL')}.`, 400, 'stock');
  }

  const texto = String(varianteId);
  const corte = texto.indexOf(':');
  const productoId = texto.slice(0, corte);
  const idLocal = texto.slice(corte + 1);

  const producto = obtenerProductoMock(productoId);
  if (!producto || !producto.variantes.some((v) => v.id === idLocal)) {
    throw fallo('La variante ya no existe.', 404);
  }
  if (String(producto.emprendedorId) !== String(yo.id)) {
    throw fallo('No puedes modificar el stock de un producto ajeno.', 403);
  }

  actualizarStockVarianteMock(productoId, idLocal, stock);

  const actualizado = obtenerProductoMock(productoId);
  return aItem(actualizado, actualizado.variantes.find((v) => v.id === idLocal));
}
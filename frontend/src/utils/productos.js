// src/utils/productos.js
export const STOCK_BAJO = 10;
export function normalizarProducto(raw = {}) {
  const variantes = Array.isArray(raw.variantes) && raw.variantes.length ? raw.variantes : variantesDesdeLegacy(raw);
  return {
    ...raw,
    precio: Number(raw.precio) || 0,
    tipoVariante: raw.tipoVariante || 'Tamaño',
    variantes: variantes.map((v, i) => ({ id: v.id ?? `v${i + 1}`, etiqueta: v.etiqueta ?? '', sku: v.sku ?? '', stock: Number(v.stock) || 0 })),
    fotos: raw.fotos?.length ? raw.fotos : raw.imagen ? [raw.imagen] : [],
    caracteristicas: raw.caracteristicas ?? { Material: raw.material ?? '', Dimensiones: raw.dimensiones ?? '', Peso: raw.peso ?? '', Origen: raw.origen ?? '' },
    envio: { retiroEnTaller: false, despacho: true, costoEnvio: 0, diasPreparacion: 1, ...(raw.envio ?? {}) },
    restriccionEdad: Boolean(raw.restriccionEdad),
    activo: raw.activo ?? true,
    oferta: raw.oferta ?? null,
  };
}
function variantesDesdeLegacy(raw) {
  const etiquetas = Array.isArray(raw.tamaños) ? raw.tamaños : String(raw.tamaños ?? '').split(',').map((t) => t.trim()).filter(Boolean);
  if (etiquetas.length === 0) return [{ id: 'v1', etiqueta: '', sku: '', stock: Number(raw.stock) || 0 }];
  return etiquetas.map((etiqueta, i) => ({ id: `v${i + 1}`, etiqueta, sku: '', stock: i === 0 ? Number(raw.stock) || 0 : 0 }));
}
export const stockTotal = (p) => p.variantes.reduce((s, v) => s + (Number(v.stock) || 0), 0);
export const esStockBajo = (stock) => stock > 0 && stock < STOCK_BAJO;
export function precioVigente(p, hoy = new Date()) {
  const o = p.oferta;
  if (o && p.precio > 0 && new Date(o.fechaInicio) <= hoy && hoy <= new Date(o.fechaFin)) {
    return { precio: o.precioOferta, precioNormal: p.precio, descuento: Math.round((1 - o.precioOferta / p.precio) * 100) };
  }
  return { precio: p.precio, precioNormal: null, descuento: 0 };
}
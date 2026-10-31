import { esStockBajo } from './productos';

export const MAX_STOCK = 99999;
export const PRODUCTOS_POR_PAGINA = 10;

// 'agotado' (0) | 'bajo' (1 a STOCK_BAJO - 1) | 'disponible' (STOCK_BAJO o más).
// El umbral vive en utils/productos.js (esStockBajo): aquí no se redefine.
export function estadoStock(stock) {
  if (stock === 0) return 'agotado';
  return esStockBajo(stock) ? 'bajo' : 'disponible';
}

// '' si el texto es un entero válido (0 a MAX_STOCK); si no, el mensaje de error.
// Estas reglas se repetirán en el backend.
export function validarStock(texto) {
  const valor = String(texto ?? '').trim();
  if (!valor) return 'Ingresa el stock.';
  if (!/^\d+$/.test(valor)) return 'El stock debe ser un número entero, 0 o mayor.';
  if (Number(valor) > MAX_STOCK) return `El stock máximo es ${MAX_STOCK.toLocaleString('es-CL')}.`;
  return '';
}

// Número si el texto es un stock válido; null si no.
export const stockDesdeTexto = (texto) =>
  validarStock(texto) ? null : Number(String(texto).trim());

export const normalizarBusqueda = (texto) =>
  String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const nombreVariante = (item) =>
  item.etiqueta ? `${item.productoNombre} · ${item.etiqueta}` : item.productoNombre;

export function contarEstados(items) {
  const cuenta = { total: items.length, disponible: 0, bajo: 0, agotado: 0 };
  items.forEach((item) => {
    cuenta[estadoStock(item.stock)] += 1;
  });
  return cuenta;
}

export function textoAlerta({ bajo, agotado }) {
  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  if (bajo && agotado) {
    return `Tienes ${plural(bajo, 'variante con stock bajo', 'variantes con stock bajo')} y ${plural(agotado, 'agotada', 'agotadas')}.`;
  }
  if (bajo) return `Tienes ${plural(bajo, 'variante con stock bajo', 'variantes con stock bajo')}.`;
  if (agotado) return `Tienes ${plural(agotado, 'variante agotada', 'variantes agotadas')}.`;
  return '';
}

// Agrupa la lista plana por producto. orden: 'stock' (lo más crítico primero) | 'nombre'.
export function agruparPorProducto(items, orden) {
  const mapa = new Map();
  items.forEach((item) => {
    if (!mapa.has(item.productoId)) {
      mapa.set(item.productoId, {
        productoId: item.productoId,
        productoNombre: item.productoNombre,
        foto: item.foto,
        categoria: item.categoria,
        activo: item.activo,
        filas: [],
      });
    }
    mapa.get(item.productoId).filas.push(item);
  });

  const grupos = [...mapa.values()];
  const porNombre = (a, b) => a.productoNombre.localeCompare(b.productoNombre, 'es');

  if (orden === 'stock') {
    grupos.forEach((g) => g.filas.sort((a, b) => a.stock - b.stock));
    const critico = (g) => Math.min(...g.filas.map((f) => f.stock));
    grupos.sort((a, b) => critico(a) - critico(b) || porNombre(a, b));
  } else {
    grupos.sort(porNombre);
  }
  return grupos;
}

// Estado de edición de una fila: texto del campo, error y límites de los botones − y +.
export function estadoEdicion(item, ediciones) {
  const texto = ediciones[item.varianteId];
  const modificada = texto !== undefined;
  const valor = modificada ? texto : String(item.stock);
  const numero = stockDesdeTexto(valor) ?? item.stock;
  return {
    modificada,
    valor,
    error: modificada ? validarStock(texto) : '',
    puedeBajar: numero > 0,
    puedeSubir: numero < MAX_STOCK,
  };
}
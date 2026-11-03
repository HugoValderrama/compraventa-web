import { getInventory } from './inventario';
import { listarProductosMock } from './productos';
import { listarPedidos } from './pedidos';
import { ESTADOS as ESTADOS_COTIZACION, obtenerSolicitudes } from './cotizacionesRecibidas';
// Pantalla de preguntas (módulo del equipo): ajusta la ruta si el archivo está en otra carpeta.
import { cargarPreguntas, contarPreguntas, preguntasDelUsuario } from '../pages/MisPreguntas/preguntas';
import { aISO } from '../utils/formatos';
import { esStockBajo } from '../utils/productos';
import { normalizarBusqueda } from '../utils/inventario';
import {
  DIAS_PERIODO,
  ESTADOS_PEDIDO,
  ESTADO_CANCELADO,
  PERIODOS,
  fechaLocal,
  rangoPeriodo,
  sumarDiasA,
} from '../utils/dashboard';

// Forma real de mocks/pedidos.js: { id, fecha, estado, cliente: { nombre }, total,
// items: [{ nombre, cantidad, precioUnitario }] }. Los ítems aún no traen productoId.
const aPedido = (pedido) => ({
  id: pedido.id,
  fecha: pedido.fecha,
  cliente: pedido.cliente?.nombre ?? 'Cliente',
  total: Number(pedido.total) || 0,
  estado: pedido.estado,
  items: (pedido.items ?? []).map((item) => ({
    productoId: item.productoId ?? null,
    nombre: item.nombre,
    cantidad: Number(item.cantidad) || 0,
    precio: Number(item.precioUnitario) || 0,
  })),
});

// Mismas preguntas que ve el emprendedor en su pantalla de preguntas pendientes.
// Si no se pueden leer, esa pantalla muestra el error; aquí el contador queda en 0.
function contarPreguntasPendientes() {
  const { preguntas, error } = cargarPreguntas();
  return error ? 0 : contarPreguntas(preguntasDelUsuario(preguntas, 'emprendedor')).pendientes;
}

// TODO: conectar API. Opción A: GET /api/me/dashboard?periodo=7d|30d|12m. Opción B: armarlo en el frontend con GET /api/me/received-orders, GET /api/me/inventory, GET /api/me/received-quotes y GET /api/me/pending-questions.
export async function getDashboard(periodo = '30d') {
  if (!PERIODOS.some((p) => p.valor === periodo)) {
    throw Object.assign(new Error('El periodo no es válido.'), { codigo: 400 });
  }

  const [crudos, inventario, solicitudes] = await Promise.all([
    listarPedidos(),
    getInventory(),
    obtenerSolicitudes(),
  ]);

  const pedidos = crudos.map(aPedido);
  // Un pedido cancelado no cuenta como venta (hoy el mock de pedidos no tiene ese estado).
  const vendidos = pedidos.filter((p) => p.estado !== ESTADO_CANCELADO);

  const { inicio, inicioPrevio, finExclusivo } = rangoPeriodo(periodo);
  const entre = (pedido, desde, hasta) => {
    const fecha = fechaLocal(pedido.fecha);
    return Boolean(fecha) && fecha >= desde && fecha < hasta;
  };
  const actuales = vendidos.filter((p) => entre(p, inicio, finExclusivo));
  const previos = vendidos.filter((p) => entre(p, inicioPrevio, inicio));
  const suma = (lista) => lista.reduce((s, p) => s + p.total, 0);

  const total = suma(actuales);
  const totalPrevio = suma(previos);

  // Serie: un punto por día (7d, 30d) o por mes (12m); fecha siempre 'aaaa-mm-dd'.
  const claveDe = (fecha) =>
    aISO(periodo === '12m' ? new Date(fecha.getFullYear(), fecha.getMonth(), 1) : fecha);
  const porClave = new Map();
  actuales.forEach((p) => {
    const clave = claveDe(fechaLocal(p.fecha));
    porClave.set(clave, (porClave.get(clave) ?? 0) + p.total);
  });
  const cantidad = periodo === '12m' ? 12 : DIAS_PERIODO[periodo];
  const serie = Array.from({ length: cantidad }, (_, i) => {
    const fecha = aISO(
      periodo === '12m'
        ? new Date(inicio.getFullYear(), inicio.getMonth() + i, 1)
        : sumarDiasA(inicio, i)
    );
    return { fecha, total: porClave.get(fecha) ?? 0 };
  });

  // Pedidos por estado: todos los pedidos vigentes (no solo los del periodo).
  const pedidosPorEstado = Object.fromEntries(ESTADOS_PEDIDO.map((e) => [e, 0]));
  vendidos.forEach((p) => {
    if (p.estado in pedidosPorEstado) pedidosPorEstado[p.estado] += 1;
  });

  const pedidosRecientes = [...pedidos]
    .sort((a, b) => (fechaLocal(b.fecha)?.getTime() ?? 0) - (fechaLocal(a.fecha)?.getTime() ?? 0))
    .slice(0, 5)
    .map(({ id, fecha, cliente, total: monto, estado }) => ({ id, fecha, cliente, total: monto, estado }));

  // Los ítems del pedido no traen productoId: se agrupa por nombre y el id se busca en el
  // catálogo por coincidencia de nombre. Sin coincidencia, productoId queda en null.
  const idPorNombre = new Map(
    listarProductosMock().map((p) => [normalizarBusqueda(p.nombre), String(p.id)])
  );
  const acumulado = new Map();
  actuales.forEach((p) =>
    p.items.forEach((item) => {
      const nombreNormal = normalizarBusqueda(item.nombre);
      const clave = item.productoId !== null ? `id:${item.productoId}` : `nombre:${nombreNormal}`;
      const fila = acumulado.get(clave) ?? {
        productoId:
          item.productoId !== null ? String(item.productoId) : idPorNombre.get(nombreNormal) ?? null,
        nombre: item.nombre,
        unidades: 0,
        total: 0,
      };
      fila.unidades += item.cantidad;
      fila.total += item.cantidad * item.precio;
      acumulado.set(clave, fila);
    })
  );
  const topProductos = [...acumulado.values()]
    .sort((a, b) => b.unidades - a.unidades || b.total - a.total)
    .slice(0, 5);

  // Mismo umbral que /inventario (esStockBajo): lo que baje de STOCK_BAJO aparece aquí.
  const stockCritico = inventario
    .filter((v) => v.stock === 0 || esStockBajo(v.stock))
    .sort((a, b) => a.stock - b.stock || a.productoNombre.localeCompare(b.productoNombre, 'es'))
    .map(({ varianteId, productoId, productoNombre, etiqueta, sku, stock }) => ({
      varianteId,
      productoId,
      productoNombre,
      etiqueta,
      sku,
      stock,
    }));

  return {
    periodo,
    ventas: {
      total,
      pedidos: actuales.length,
      ticketPromedio: actuales.length ? Math.round(total / actuales.length) : 0,
      variacionPct: totalPrevio > 0 ? Math.round(((total - totalPrevio) / totalPrevio) * 100) : null,
    },
    serie,
    pedidosPorEstado,
    pedidosRecientes,
    topProductos,
    stockCritico,
    cotizacionesPendientes: solicitudes.filter((s) => s.estado === ESTADOS_COTIZACION.PENDIENTE).length,
    preguntasPendientes: contarPreguntasPendientes(),
  };
}
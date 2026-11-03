export const PERIODOS = [
  { valor: '7d', texto: '7 días' },
  { valor: '30d', texto: '30 días' },
  { valor: '12m', texto: '12 meses' },
];

export const DIAS_PERIODO = { '7d': 7, '30d': 30 };

export const ESTADOS_PEDIDO = ['Recibido', 'En preparación', 'Enviado', 'Entregado'];
export const ESTADO_CANCELADO = 'Cancelado';

// 'aaaa-mm-dd' se interpreta como fecha LOCAL: new Date('aaaa-mm-dd') sería UTC
// y en Chile correría la fecha un día hacia atrás.
export function fechaLocal(valor) {
  if (!valor) return null;
  const texto = String(valor);
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(texto)
    ? new Date(Number(texto.slice(0, 4)), Number(texto.slice(5, 7)) - 1, Number(texto.slice(8, 10)))
    : new Date(texto);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export const sumarDiasA = (fecha, dias) =>
  new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);

// Rango [inicio, finExclusivo) del periodo y inicio del periodo anterior (misma duración).
export function rangoPeriodo(periodo, hoy = new Date()) {
  if (periodo === '12m') {
    const anio = hoy.getFullYear();
    const mes = hoy.getMonth();
    return {
      inicio: new Date(anio, mes - 11, 1),
      inicioPrevio: new Date(anio, mes - 23, 1),
      finExclusivo: new Date(anio, mes + 1, 1),
    };
  }
  const dias = DIAS_PERIODO[periodo];
  const fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const inicio = sumarDiasA(fin, -(dias - 1));
  return { inicio, inicioPrevio: sumarDiasA(inicio, -dias), finExclusivo: sumarDiasA(fin, 1) };
}
// Datos y reglas del módulo de reportes (/reportes).
// En memoria: con backend, `cargarVentas` pasa a pedir a la API (idealmente ya filtrado).
// TODO: conectar API  ->  GET /api/reports/sales?desde=&hasta=&estado=&categoria=

const RETARDO_MS = 300
const esperar = (ms = RETARDO_MS) => new Promise((resolve) => setTimeout(resolve, ms))

export const TIPOS_REPORTE = ['Ventas'] // otros tipos (productos, clientes) cuando existan sus tablas

export const ESTADOS_REPORTE = [
  { valor: 'Todos', etiqueta: 'Todos los estados' },
  { valor: 'Finalizada', etiqueta: 'Finalizadas' },
  { valor: 'Pendiente', etiqueta: 'Pendientes' },
  { valor: 'Cancelada', etiqueta: 'Canceladas' },
]

// Los datos de ejemplo son de agosto a octubre de 2026; por eso el reporte parte en septiembre.
export const FILTROS_INICIALES = {
  tipo: 'Ventas',
  desde: '2026-09-01',
  hasta: '2026-09-30',
  estado: 'Finalizada',
  categoria: 'Todas',
}

export const FILTROS_VACIOS = { tipo: 'Ventas', desde: '', hasta: '', estado: 'Todos', categoria: 'Todas' }

const venta = (id, fecha, cliente, total, estado, categoria) => ({ id, fecha, cliente, total, estado, categoria })

// Septiembre 2026: 24 ventas finalizadas = $1.248.000 (promedio $52.000), más pendientes y canceladas.
const VENTAS_MOCK = [
  venta('V-0207', '2026-08-04', 'Diego Soto', 47000, 'Finalizada', 'Textiles'),
  venta('V-0208', '2026-08-07', 'Antonia Núñez', 31000, 'Finalizada', 'Joyería artesanal'),
  venta('V-0209', '2026-08-11', 'Joaquín Reyes', 61000, 'Finalizada', 'Joyería artesanal'),
  venta('V-0210', '2026-08-11', 'Camila González', 64500, 'Finalizada', 'Cuero y marroquinería'),
  venta('V-0211', '2026-08-15', 'Valentina Pérez', 24500, 'Cancelada', 'Madera y muebles'),
  venta('V-0212', '2026-08-17', 'Constanza Díaz', 90000, 'Finalizada', 'Madera y muebles'),
  venta('V-0213', '2026-08-21', 'Javiera Lagos', 82000, 'Finalizada', 'Cerámicas artesanales'),
  venta('V-0214', '2026-08-24', 'Sofía Fuentes', 28000, 'Finalizada', 'Madera y muebles'),
  venta('V-0215', '2026-08-26', 'Matías Rojas', 42000, 'Finalizada', 'Cuero y marroquinería'),
  venta('V-0216', '2026-08-27', 'Constanza Díaz', 37500, 'Finalizada', 'Madera y muebles'),
  venta('V-0217', '2026-08-29', 'Francisca Muñoz', 86000, 'Finalizada', 'Alimentos y conservas'),
  venta('V-0218', '2026-08-31', 'Catalina Leiva', 76000, 'Finalizada', 'Madera y muebles'),
  venta('V-0219', '2026-09-02', 'Javiera Lagos', 67500, 'Finalizada', 'Decoración del hogar'),
  venta('V-0220', '2026-09-03', 'Javiera Lagos', 25000, 'Cancelada', 'Cuero y marroquinería'),
  venta('V-0221', '2026-09-04', 'Benjamín Silva', 65000, 'Cancelada', 'Alimentos y conservas'),
  venta('V-0222', '2026-09-05', 'Fernanda Tapia', 74000, 'Finalizada', 'Cerámicas artesanales'),
  venta('V-0223', '2026-09-05', 'Francisca Muñoz', 65000, 'Finalizada', 'Madera y muebles'),
  venta('V-0224', '2026-09-06', 'Isidora Pinto', 80000, 'Finalizada', 'Textiles'),
  venta('V-0225', '2026-09-07', 'Camila González', 37500, 'Finalizada', 'Decoración del hogar'),
  venta('V-0226', '2026-09-07', 'Javiera Lagos', 40000, 'Finalizada', 'Textiles'),
  venta('V-0227', '2026-09-09', 'Francisca Muñoz', 76000, 'Finalizada', 'Decoración del hogar'),
  venta('V-0228', '2026-09-09', 'Matías Rojas', 74000, 'Finalizada', 'Alimentos y conservas'),
  venta('V-0229', '2026-09-11', 'Diego Soto', 37500, 'Finalizada', 'Madera y muebles'),
  venta('V-0230', '2026-09-12', 'Diego Soto', 25500, 'Finalizada', 'Alimentos y conservas'),
  venta('V-0231', '2026-09-13', 'Joaquín Reyes', 71500, 'Finalizada', 'Alimentos y conservas'),
  venta('V-0232', '2026-09-14', 'Sebastián Vera', 54500, 'Finalizada', 'Cerámicas artesanales'),
  venta('V-0233', '2026-09-15', 'Sofía Fuentes', 30000, 'Finalizada', 'Textiles'),
  venta('V-0234', '2026-09-16', 'Felipe Castro', 26000, 'Finalizada', 'Joyería artesanal'),
  venta('V-0235', '2026-09-16', 'Ignacio Araya', 81500, 'Finalizada', 'Alimentos y conservas'),
  venta('V-0236', '2026-09-16', 'Camila González', 20000, 'Finalizada', 'Decoración del hogar'),
  venta('V-0237', '2026-09-17', 'Felipe Castro', 65500, 'Finalizada', 'Cuero y marroquinería'),
  venta('V-0238', '2026-09-19', 'Matías Rojas', 74500, 'Finalizada', 'Textiles'),
  venta('V-0239', '2026-09-21', 'Tomás Herrera', 33000, 'Finalizada', 'Joyería artesanal'),
  venta('V-0240', '2026-09-23', 'Sebastián Vera', 20000, 'Finalizada', 'Cuero y marroquinería'),
  venta('V-0241', '2026-09-27', 'Catalina Leiva', 81500, 'Finalizada', 'Cuero y marroquinería'),
  venta('V-0242', '2026-09-27', 'Antonia Núñez', 40000, 'Pendiente', 'Decoración del hogar'),
  venta('V-0243', '2026-09-27', 'Tomás Herrera', 22000, 'Finalizada', 'Cerámicas artesanales'),
  venta('V-0244', '2026-09-28', 'Antonia Núñez', 72500, 'Pendiente', 'Textiles'),
  venta('V-0245', '2026-09-29', 'Isidora Pinto', 23000, 'Finalizada', 'Madera y muebles'),
  venta('V-0246', '2026-09-30', 'Camila González', 45000, 'Pendiente', 'Madera y muebles'),
  venta('V-0247', '2026-09-30', 'Fernanda Tapia', 90000, 'Pendiente', 'Alimentos y conservas'),
  venta('V-0248', '2026-09-30', 'Camila González', 68000, 'Finalizada', 'Textiles'),
  venta('V-0249', '2026-10-03', 'Joaquín Reyes', 57000, 'Finalizada', 'Decoración del hogar'),
  venta('V-0250', '2026-10-08', 'Joaquín Reyes', 41000, 'Finalizada', 'Cuero y marroquinería'),
  venta('V-0251', '2026-10-15', 'Catalina Leiva', 52500, 'Cancelada', 'Joyería artesanal'),
  venta('V-0252', '2026-10-17', 'Antonia Núñez', 46500, 'Finalizada', 'Joyería artesanal'),
  venta('V-0253', '2026-10-19', 'Francisca Muñoz', 89500, 'Finalizada', 'Cuero y marroquinería'),
  venta('V-0254', '2026-10-23', 'Javiera Lagos', 83500, 'Pendiente', 'Textiles'),
  venta('V-0255', '2026-10-25', 'Martín Ortiz', 88500, 'Finalizada', 'Cerámicas artesanales'),
  venta('V-0256', '2026-10-31', 'Catalina Leiva', 20500, 'Pendiente', 'Cuero y marroquinería'),
]

export const CATEGORIAS_REPORTE = [...new Set(VENTAS_MOCK.map((v) => v.categoria))].sort((a, b) => a.localeCompare(b, 'es'))

// READ
export async function cargarVentas() {
  await esperar()
  return VENTAS_MOCK.map((v) => ({ ...v }))
}

/* ------------------------------- Filtros ------------------------------- */

// Devuelve el mensaje de error, o '' si los filtros son válidos.
export function errorDeFiltros({ desde, hasta }) {
  if (desde && hasta && desde > hasta) return 'La fecha «Desde» no puede ser posterior a «Hasta».'
  return ''
}

export function filtrarVentas(ventas, { desde, hasta, estado, categoria }) {
  return ventas.filter(
    (v) =>
      (!desde || v.fecha >= desde) &&
      (!hasta || v.fecha <= hasta) &&
      (estado === 'Todos' || v.estado === estado) &&
      (categoria === 'Todas' || v.categoria === categoria),
  )
}

// Más reciente primero ('desc') o más antigua primero ('asc'); a igual fecha, por número de operación.
export function ordenarVentas(ventas, direccion = 'desc') {
  const signo = direccion === 'asc' ? 1 : -1
  return [...ventas].sort((a, b) => signo * (a.fecha.localeCompare(b.fecha) || a.id.localeCompare(b.id)))
}

// Ingresos y promedio cuentan solo las ventas finalizadas.
export function calcularResumen(ventas) {
  const finalizadas = ventas.filter((v) => v.estado === 'Finalizada')
  const ingresos = finalizadas.reduce((suma, v) => suma + v.total, 0)

  return {
    ingresos,
    finalizadas: finalizadas.length,
    promedio: finalizadas.length ? Math.round(ingresos / finalizadas.length) : 0,
  }
}

/* ------------------------------- Textos -------------------------------- */

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const partes = (iso) => {
  const [anio, mes, dia] = iso.split('-').map(Number)
  return { anio, mes, dia }
}

// '2026-09-30' -> '30/09/2026'
export function formatearFechaReporte(iso) {
  const { anio, mes, dia } = partes(iso)
  return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${anio}`
}

// Chip del período: 'Septiembre 2026' si es un mes completo; si no, el rango.
export function etiquetaPeriodo(desde, hasta) {
  if (!desde && !hasta) return ''
  if (!desde) return `Hasta ${formatearFechaReporte(hasta)}`
  if (!hasta) return `Desde ${formatearFechaReporte(desde)}`

  const a = partes(desde)
  const b = partes(hasta)
  const mesCompleto = a.anio === b.anio && a.mes === b.mes && a.dia === 1 && b.dia === new Date(b.anio, b.mes, 0).getDate()

  if (mesCompleto) return `${MESES[a.mes - 1][0].toUpperCase()}${MESES[a.mes - 1].slice(1)} ${a.anio}`
  return `${formatearFechaReporte(desde)} – ${formatearFechaReporte(hasta)}`
}

// Subtítulo: 'Del 1 al 30 de septiembre de 2026'
export function describirPeriodo(desde, hasta) {
  if (!desde && !hasta) return 'Todas las fechas'

  const larga = ({ dia, mes, anio }) => `${dia} de ${MESES[mes - 1]} de ${anio}`
  if (!desde) return `Hasta el ${larga(partes(hasta))}`
  if (!hasta) return `Desde el ${larga(partes(desde))}`
  if (desde === hasta) return `El ${larga(partes(desde))}`

  const a = partes(desde)
  const b = partes(hasta)
  if (a.anio === b.anio && a.mes === b.mes) return `Del ${a.dia} al ${b.dia} de ${MESES[b.mes - 1]} de ${b.anio}`
  if (a.anio === b.anio) return `Del ${a.dia} de ${MESES[a.mes - 1]} al ${b.dia} de ${MESES[b.mes - 1]} de ${b.anio}`
  return `Del ${larga(a)} al ${larga(b)}`
}

export const textoResultados = (cantidad) => `${cantidad} ${cantidad === 1 ? 'resultado' : 'resultados'}`

// Chips de "Filtros activos". `quitar` dice qué campos se limpian al cerrar el chip.
export function filtrosActivos({ desde, hasta, estado, categoria }) {
  const activos = []

  if (desde || hasta) {
    activos.push({ clave: 'periodo', etiqueta: etiquetaPeriodo(desde, hasta), quitar: { desde: '', hasta: '' } })
  }
  if (estado !== 'Todos') {
    const { etiqueta } = ESTADOS_REPORTE.find((e) => e.valor === estado) ?? { etiqueta: estado }
    activos.push({ clave: 'estado', etiqueta, quitar: { estado: 'Todos' } })
  }
  if (categoria !== 'Todas') {
    activos.push({ clave: 'categoria', etiqueta: categoria, quitar: { categoria: 'Todas' } })
  }

  return activos
}
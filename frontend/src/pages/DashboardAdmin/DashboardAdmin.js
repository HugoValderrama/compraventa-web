// Resumen del marketplace para el Dashboard Admin.
// Datos de ejemplo: cuando exista el backend, estos valores salen de la API.

const RESUMEN_EJEMPLO = {
  actualizado: new Date(2026, 9, 15, 14, 30).toISOString(),
  ventas: { monto: 12480000, pedidosPagados: 240, variacion: 12 }, // variacion: % respecto al mes anterior
  usuarios: { total: 1248, emprendedores: 160, administradores: 8 },
  publicaciones: { activas: 386, productos: 298, servicios: 88 },
  casos: { porResolver: 6, enRevision: 4, aprobados: 2 },
  pendientes: { publicacionesPorModerar: 12, devolucionesEnRevision: 4, usuariosPorVerificar: 3 },
  actividad: [
    {
      id: '1048',
      cliente: 'Camila Rojas',
      emprendedor: 'Taller Tierra',
      detalle: 'Florero Gres Silvestre',
      total: 23490,
      estado: 'Por preparar',
      fecha: new Date(2026, 9, 15, 14, 20).toISOString(),
    },
    {
      id: '1047',
      cliente: 'Diego Soto',
      emprendedor: 'Manos del Sur',
      detalle: 'Taller de cerámica',
      total: 45000,
      estado: 'Confirmado',
      fecha: new Date(2026, 9, 15, 11, 5).toISOString(),
    },
    {
      id: '1046',
      cliente: 'Ana Muñoz',
      emprendedor: 'Tejidos Luna',
      detalle: 'Manta de lana',
      total: 38000,
      estado: 'Enviado',
      fecha: new Date(2026, 9, 14, 16, 40).toISOString(),
    },
  ],
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))


export async function obtenerDashboardAdmin() {
  
  await delay(500)
  return JSON.parse(JSON.stringify(RESUMEN_EJEMPLO))
}
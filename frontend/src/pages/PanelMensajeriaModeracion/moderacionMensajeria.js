// Datos del Panel de Moderación de Mensajería: preguntas y mensajes que llevan
// demasiado tiempo sin respuesta. Datos de ejemplo hasta que exista el backend.

export const UMBRAL_HORAS = 48

const HORA_MS = 60 * 60 * 1000
const haceHoras = (horas) => new Date(Date.now() - horas * HORA_MS).toISOString()

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// "ruta" es la pantalla donde se ve el detalle; en null si esa pantalla aún no existe.
function datosDeEjemplo() {
  return {
    umbralHoras: UMBRAL_HORAS,
    preguntas: [
      {
        id: 'PRE-0412',
        publicacion: 'Balón de fútbol mundial Qatar 2022',
        texto: '¿Realizan envíos a Punta Arenas?',
        fecha: haceHoras(72), // hace 3 días
        ruta: null,
      },
    ],
    mensajes: [
      {
        id: 'MSJ-0230',
        publicacion: 'Notebook Lenovo',
        texto: '¿Incluye cargador?',
        fecha: haceHoras(80), // hace 3 días y 8 horas
        ruta: '/mensajeria',
      },
    ],
  }
}

// Simula la API. Reemplazar por fetch cuando el backend esté listo.
export async function obtenerPanelModeracion() {
  // TODO: conectar API (preguntas y mensajes sin respuesta por más de UMBRAL_HORAS)
  await delay(500)
  return datosDeEjemplo()
}
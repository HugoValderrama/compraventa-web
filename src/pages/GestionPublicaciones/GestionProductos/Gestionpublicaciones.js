// Capa de datos de "Gestión de Productos/Servicios" (vista de administración).
// Aquí vive el CRUD y los cambios de estado; la página solo dibuja.
// Con backend, basta con reemplazar leer() y escribir() por llamadas a la API.

const CLAVE = 'laguito-libre.publicaciones-admin.v1'

export const TIPOS = ['Producto', 'Servicio']

export const CATEGORIAS = [
  'Cerámicas artesanales',
  'Textiles',
  'Alimentos',
  'Joyería',
  'Servicios técnicos',
  'Talleres y clases',
]

export const ESTADOS = ['En revisión', 'Activa', 'Pausada', 'Rechazada']

// Qué estados puede alcanzar cada publicación desde su estado actual.
const TRANSICIONES = {
  'En revisión': ['Activa', 'Rechazada'],
  Activa: ['Pausada'],
  Pausada: ['Activa'],
  Rechazada: [],
}

export const MAXIMO_MOTIVO = 300

const SEMILLA = [
  { id: 'PUB-0387', titulo: 'Florero Gres Silvestre', emprendedor: 'Taller Tierra', tipo: 'Producto', categoria: 'Cerámicas artesanales', precio: 23490, estado: 'En revisión', motivo: '' },
  { id: 'PUB-0386', titulo: 'Taller de cerámica inicial', emprendedor: 'Manos del Sur', tipo: 'Servicio', categoria: 'Talleres y clases', precio: 45000, estado: 'En revisión', motivo: '' },
  { id: 'PUB-0385', titulo: 'Manta de lana natural', emprendedor: 'Tejidos Luna', tipo: 'Producto', categoria: 'Textiles', precio: 38000, estado: 'Activa', motivo: '' },
  { id: 'PUB-0384', titulo: 'Reparación de bicicletas', emprendedor: 'BiciBarrio', tipo: 'Servicio', categoria: 'Servicios técnicos', precio: 18000, estado: 'Pausada', motivo: '' },
  { id: 'PUB-0383', titulo: 'Pack de miel artesanal', emprendedor: 'Abeja del Lago', tipo: 'Producto', categoria: 'Alimentos', precio: 12000, estado: 'Rechazada', motivo: 'Las fotos no muestran el producto real y falta la información de origen.' },
  { id: 'PUB-0382', titulo: 'Collar de plata y lapislázuli', emprendedor: 'Joyas del Norte', tipo: 'Producto', categoria: 'Joyería', precio: 54900, estado: 'Activa', motivo: '' },
  { id: 'PUB-0381', titulo: 'Clase de telar para principiantes', emprendedor: 'Tejidos Luna', tipo: 'Servicio', categoria: 'Talleres y clases', precio: 30000, estado: 'Activa', motivo: '' },
  { id: 'PUB-0380', titulo: 'Taza de gres natural', emprendedor: 'Taller Tierra', tipo: 'Producto', categoria: 'Cerámicas artesanales', precio: 9990, estado: 'Activa', motivo: '' },
]

const invalida = (p) =>
  !p ||
  typeof p.id !== 'string' ||
  !p.id ||
  typeof p.titulo !== 'string' ||
  typeof p.emprendedor !== 'string' ||
  !TIPOS.includes(p.tipo) ||
  typeof p.categoria !== 'string' ||
  !Number.isSafeInteger(p.precio) ||
  p.precio < 0 ||
  !ESTADOS.includes(p.estado)

/* ------------------------- Lectura / escritura ------------------------- */

function leer() {
  try {
    const texto = window.localStorage.getItem(CLAVE)
    const lista = texto === null ? SEMILLA : JSON.parse(texto)

    if (!Array.isArray(lista) || lista.some(invalida)) {
      throw new Error('Datos inválidos')
    }

    return { publicaciones: lista, error: '' }
  } catch {
    return {
      publicaciones: [],
      error: 'No se pudieron leer las publicaciones. Revisa el almacenamiento del navegador.',
    }
  }
}

function escribir(lista) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(lista))
  } catch {
    throw new Error('No se pudo guardar. Revisa el almacenamiento del navegador.')
  }

  return { publicaciones: lista, error: '' }
}

// Siempre parte de lo último guardado, así dos pestañas no se pisan.
function actuales() {
  const datos = leer()
  if (datos.error) throw new Error(datos.error)
  return datos.publicaciones
}

function siguienteId(lista) {
  const mayor = lista.reduce((max, p) => {
    const numero = Number(p.id.replace(/^PUB-/, ''))
    return Number.isFinite(numero) ? Math.max(max, numero) : max
  }, 0)

  return `PUB-${String(mayor + 1).padStart(4, '0')}`
}

function validar(form) {
  const titulo = String(form.titulo ?? '').trim()
  const emprendedor = String(form.emprendedor ?? '').trim()
  const precio = String(form.precio ?? '').trim() === '' ? NaN : Number(form.precio)

  if (!titulo) throw new Error('El título es obligatorio.')
  if (titulo.length > 80) throw new Error('El título puede tener hasta 80 caracteres.')
  if (!emprendedor) throw new Error('El emprendedor es obligatorio.')
  if (emprendedor.length > 60) throw new Error('El nombre del emprendedor puede tener hasta 60 caracteres.')
  if (!TIPOS.includes(form.tipo)) throw new Error('Selecciona si es producto o servicio.')
  if (!CATEGORIAS.includes(form.categoria)) throw new Error('Selecciona una categoría.')
  if (!Number.isSafeInteger(precio) || precio < 1 || precio > 99999999) {
    throw new Error('El precio debe ser un número entero mayor que cero.')
  }

  return { titulo, emprendedor, tipo: form.tipo, categoria: form.categoria, precio }
}

/* ------------------------------- CRUD --------------------------------- */

// READ
export const cargarPublicaciones = leer

// CREATE (toda publicación nueva entra "En revisión")
export function crearPublicacion(form) {
  const lista = actuales()
  const nueva = {
    id: siguienteId(lista),
    estado: 'En revisión',
    motivo: '',
    ...validar(form),
  }

  return escribir([nueva, ...lista])
}

// UPDATE (datos de la publicación; el estado se cambia con cambiarEstado)
export function actualizarPublicacion(id, form) {
  const lista = actuales()

  if (!lista.some((p) => p.id === id)) {
    throw new Error('La publicación ya no existe.')
  }

  const cambios = validar(form)
  return escribir(lista.map((p) => (p.id === id ? { ...p, ...cambios } : p)))
}

// DELETE
export function eliminarPublicacion(id) {
  const lista = actuales()

  if (!lista.some((p) => p.id === id)) {
    throw new Error('La publicación ya no existe.')
  }

  return escribir(lista.filter((p) => p.id !== id))
}

// Aprobar, rechazar, pausar o reactivar. Rechazar exige un motivo.
export function cambiarEstadoPublicacion(id, estado, motivo = '') {
  const lista = actuales()
  const actual = lista.find((p) => p.id === id)

  if (!actual) throw new Error('La publicación ya no existe.')
  if (!TRANSICIONES[actual.estado].includes(estado)) {
    throw new Error('Este cambio de estado no está permitido.')
  }

  const texto = String(motivo).trim()

  if (estado === 'Rechazada') {
    if (!texto) throw new Error('Indica el motivo del rechazo.')
    if (texto.length > MAXIMO_MOTIVO) {
      throw new Error(`El motivo puede tener hasta ${MAXIMO_MOTIVO} caracteres.`)
    }
  }

  return escribir(
    lista.map((p) =>
      p.id === id
        ? { ...p, estado, motivo: estado === 'Rechazada' ? texto : '' }
        : p
    )
  )
}

/* --------------------- Cálculos y formato para la UI ------------------- */

export function contarPorEstado(lista) {
  const conteos = { Todas: lista.length }
  ESTADOS.forEach((estado) => {
    conteos[estado] = lista.filter((p) => p.estado === estado).length
  })
  return conteos
}

export function filtrarPublicaciones(lista, { estado, busqueda, tipo, categoria }) {
  const texto = busqueda.trim().toLowerCase()

  return lista.filter(
    (p) =>
      (estado === 'Todas' || p.estado === estado) &&
      (tipo === 'Todos' || p.tipo === tipo) &&
      (categoria === 'Todas' || p.categoria === categoria) &&
      (!texto ||
        `${p.titulo} ${p.id} ${p.emprendedor}`.toLowerCase().includes(texto))
  )
}

export const formatearPrecio = (valor) =>
  valor.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  })

// Avisa cuando otra pestaña cambia las publicaciones.
export function suscribirPublicaciones(callback) {
  const alCambiar = (event) => {
    if (event.key === CLAVE || event.key === null) callback()
  }

  window.addEventListener('storage', alCambiar)
  return () => window.removeEventListener('storage', alCambiar)
}